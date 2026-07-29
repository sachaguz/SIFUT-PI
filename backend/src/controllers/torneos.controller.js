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

module.exports = { getAll, getById, getTabla, create, update, remove };
