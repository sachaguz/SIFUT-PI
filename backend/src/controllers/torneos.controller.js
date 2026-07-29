const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;

    const torneos = await prisma.torneo.findMany({
      where,
      include: { equipos: { select: { id: true, nombre: true } } },
      orderBy: { fechaInicio: 'desc' },
    });
    res.json(torneos);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: req.params.id },
      include: {
        equipos: { include: { _count: { select: { jugadores: true } } } },
        partidos: {
          include: {
            equipoLocal: { select: { id: true, nombre: true } },
            equipoVisitante: { select: { id: true, nombre: true } },
            cancha: { select: { id: true, nombre: true } },
          },
          orderBy: [{ jornada: 'asc' }, { fecha: 'asc' }],
        },
      },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });
    res.json(torneo);
  } catch (err) {
    next(err);
  }
}

async function getTabla(req, res, next) {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: req.params.id },
      include: {
        equipos: { select: { id: true, nombre: true } },
        partidos: { where: { estado: 'FINALIZADO' } },
      },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });

    const stats = {};
    for (const eq of torneo.equipos) {
      stats[eq.id] = { equipo: eq.nombre, jj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
    }

    for (const p of torneo.partidos) {
      const local = stats[p.equipoLocalId];
      const visitante = stats[p.equipoVisitanteId];
      if (!local || !visitante) continue;

      local.jj++;
      visitante.jj++;
      local.gf += p.golesLocal;
      local.gc += p.golesVisitante;
      visitante.gf += p.golesVisitante;
      visitante.gc += p.golesLocal;

      if (p.golesLocal > p.golesVisitante) {
        local.g++;
        local.pts += 3;
        visitante.p++;
      } else if (p.golesLocal < p.golesVisitante) {
        visitante.g++;
        visitante.pts += 3;
        local.p++;
      } else {
        local.e++;
        visitante.e++;
        local.pts += 1;
        visitante.pts += 1;
      }
    }

    const tabla = Object.values(stats)
      .map((s) => ({ ...s, dg: s.gf - s.gc }))
      .sort((a, b) => b.pts - a.pts || b.dg - a.dg);

    tabla.forEach((row, i) => (row.pos = i + 1));

    res.json(tabla);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const torneo = await prisma.torneo.create({
      data: {
        ...req.body,
        fechaInicio: new Date(req.body.fechaInicio),
        fechaFin: new Date(req.body.fechaFin),
      },
    });
    res.status(201).json(torneo);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.fechaInicio) data.fechaInicio = new Date(data.fechaInicio);
    if (data.fechaFin) data.fechaFin = new Date(data.fechaFin);

    const torneo = await prisma.torneo.update({
      where: { id: req.params.id },
      data,
    });
    res.json(torneo);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.torneo.delete({ where: { id: req.params.id } });
    res.json({ message: 'Torneo eliminado' });
  } catch (err) {
    next(err);
  }
}

async function generarJornadas(req, res, next) {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: req.params.id },
      include: { equipos: true, partidos: true },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });

    const existingJornada = torneo.partidos.filter((p) => p.fase === 'JORNADA');
    if (existingJornada.length > 0) {
      return res.status(400).json({ error: 'Ya existen jornadas generadas. Elimina los partidos existentes primero.' });
    }

    const teams = [...torneo.equipos];
    if (teams.length < 2) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 equipos para generar jornadas.' });
    }

    const n = teams.length;
    const usesBye = n % 2 !== 0;
    if (usesBye) teams.push({ id: null, nombre: 'BYE' });
    const total = teams.length;
    const rounds = total - 1;

    const fixtures = [];
    const rotation = teams.slice(1);

    for (let round = 0; round < rounds; round++) {
      const current = [teams[0], ...rotation];
      for (let i = 0; i < total / 2; i++) {
        const home = current[i];
        const away = current[total - 1 - i];
        if (home.id && away.id) {
          fixtures.push({
            torneoId: torneo.id,
            equipoLocalId: home.id,
            equipoVisitanteId: away.id,
            fecha: new Date(torneo.fechaInicio),
            hora: '17:00',
            jornada: round + 1,
            fase: 'JORNADA',
          });
        }
      }
      rotation.push(rotation.shift());
    }

    const created = await prisma.partido.createMany({ data: fixtures });

    const partidos = await prisma.partido.findMany({
      where: { torneoId: torneo.id, fase: 'JORNADA' },
      include: {
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
      orderBy: [{ jornada: 'asc' }, { fecha: 'asc' }],
    });

    res.status(201).json({ totalJornadas: rounds, partidosCreados: created.count, partidos });
  } catch (err) {
    next(err);
  }
}

async function generarLiguilla(req, res, next) {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: req.params.id },
      include: {
        equipos: { select: { id: true, nombre: true } },
        partidos: { where: { estado: 'FINALIZADO', fase: 'JORNADA' } },
      },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });

    const existingLiguilla = await prisma.partido.findMany({
      where: { torneoId: torneo.id, fase: 'LIGUILLA' },
    });
    if (existingLiguilla.length > 0) {
      return res.status(400).json({ error: 'Ya existe una liguilla generada.' });
    }

    const stats = {};
    for (const eq of torneo.equipos) {
      stats[eq.id] = { equipoId: eq.id, nombre: eq.nombre, pts: 0, dg: 0, gf: 0 };
    }
    for (const p of torneo.partidos) {
      const local = stats[p.equipoLocalId];
      const visitante = stats[p.equipoVisitanteId];
      if (!local || !visitante) continue;
      local.gf += p.golesLocal;
      local.dg += p.golesLocal - p.golesVisitante;
      visitante.gf += p.golesVisitante;
      visitante.dg += p.golesVisitante - p.golesLocal;
      if (p.golesLocal > p.golesVisitante) { local.pts += 3; }
      else if (p.golesLocal < p.golesVisitante) { visitante.pts += 3; }
      else { local.pts += 1; visitante.pts += 1; }
    }

    const ranking = Object.values(stats).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

    if (ranking.length < 8) {
      return res.status(400).json({ error: `Se necesitan al menos 8 equipos clasificados. Solo hay ${ranking.length}.` });
    }

    const top8 = ranking.slice(0, 8);
    const matchups = [
      [top8[0], top8[7]],
      [top8[1], top8[6]],
      [top8[2], top8[5]],
      [top8[3], top8[4]],
    ];

    const lastJornada = await prisma.partido.aggregate({
      where: { torneoId: torneo.id },
      _max: { jornada: true },
    });
    const nextJornada = (lastJornada._max.jornada || 0) + 1;

    const fixtures = matchups.map(([home, away], i) => ({
      torneoId: torneo.id,
      equipoLocalId: home.equipoId,
      equipoVisitanteId: away.equipoId,
      fecha: new Date(torneo.fechaFin),
      hora: '17:00',
      jornada: nextJornada,
      fase: 'LIGUILLA',
    }));

    await prisma.partido.createMany({ data: fixtures });

    const partidos = await prisma.partido.findMany({
      where: { torneoId: torneo.id, fase: 'LIGUILLA' },
      include: {
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
      orderBy: { jornada: 'asc' },
    });

    res.status(201).json({
      clasificados: top8.map((t, i) => ({ pos: i + 1, equipo: t.nombre, pts: t.pts, dg: t.dg })),
      partidos,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getTabla, create, update, remove, generarJornadas, generarLiguilla };
