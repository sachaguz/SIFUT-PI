const prisma = require('../config/database');
const { esFaseEliminatoria, calcularTablaPosiciones } = require('../utils/bracket');

const DIA_INDEX = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };

function normalizeDia(d) {
  return String(d).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().slice(0, 3);
}

function getValidDayIndices(diasJuego) {
  if (!Array.isArray(diasJuego) || diasJuego.length === 0) return null;
  const indices = diasJuego.map((d) => DIA_INDEX[normalizeDia(d)]).filter((i) => i !== undefined);
  return indices.length > 0 ? indices : null;
}

function generateMatchDates(fechaInicio, diasJuego, roundsNeeded) {
  const validIndices = getValidDayIndices(diasJuego);
  const dates = [];
  const cursor = new Date(fechaInicio);

  if (!validIndices) {
    for (let i = 0; i < roundsNeeded; i++) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return dates;
  }

  while (dates.length < roundsNeeded) {
    if (validIndices.includes(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

const HORA_SLOTS = ['17:00', '19:00', '21:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

function mapTorneoTipoACanchaTipo(tipo) {
  const norm = String(tipo).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '');
  if (norm.includes('5')) return 'FUTBOL5';
  if (norm.includes('7')) return 'FUTBOL7';
  if (norm.includes('11')) return 'FUTBOL11';
  return null;
}

// Mutates each fixture with a canchaId + hora, spreading simultaneous
// matches (same fecha) across the available canchas and, once those run
// out, across time slots - so two matches never share a cancha at the
// same date+hora. Also checks real reservas already booked on those
// canchas so a generated match can't collide with a paying customer.
async function asignarCanchasDisponibles(fixtures, tipoTorneo) {
  const tipoCancha = mapTorneoTipoACanchaTipo(tipoTorneo);
  const canchas = await prisma.cancha.findMany({
    where: tipoCancha ? { tipo: tipoCancha } : {},
    orderBy: { id: 'asc' },
  });
  if (canchas.length === 0) {
    const err = new Error('No hay canchas registradas para este tipo de torneo. Registra al menos una cancha antes de generar jornadas.');
    err.status = 400;
    throw err;
  }

  const fechas = fixtures.map((f) => f.fecha.getTime());
  const minFecha = new Date(Math.min(...fechas));
  const maxFecha = new Date(Math.max(...fechas));

  const reservasExistentes = await prisma.reserva.findMany({
    where: {
      canchaId: { in: canchas.map((c) => c.id) },
      estado: { not: 'CANCELADA' },
      fecha: { gte: minFecha, lte: maxFecha },
    },
    select: { canchaId: true, fecha: true, horaInicio: true },
  });

  const ocupado = new Set(
    reservasExistentes.map((r) => `${r.canchaId}|${r.fecha.toISOString().slice(0, 10)}|${r.horaInicio}`)
  );

  const porFecha = new Map();
  fixtures.forEach((f) => {
    const key = f.fecha.toISOString().slice(0, 10);
    if (!porFecha.has(key)) porFecha.set(key, []);
    porFecha.get(key).push(f);
  });

  const maxSlots = canchas.length * HORA_SLOTS.length;
  porFecha.forEach((fixturesDelDia, fechaKey) => {
    let slot = 0;
    fixturesDelDia.forEach((fixture) => {
      while (slot < maxSlots * 10) {
        const cancha = canchas[slot % canchas.length];
        const hora = HORA_SLOTS[Math.floor(slot / canchas.length) % HORA_SLOTS.length];
        const key = `${cancha.id}|${fechaKey}|${hora}`;
        slot++;
        if (!ocupado.has(key)) {
          fixture.canchaId = cancha.id;
          fixture.hora = hora;
          ocupado.add(key);
          break;
        }
      }
    });
  });
}

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
        partidos: { where: { estado: 'FINALIZADO', fase: 'JORNADA' } },
      },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });

    const tabla = calcularTablaPosiciones(torneo.equipos, torneo.partidos);
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

    const roundDates = generateMatchDates(torneo.fechaInicio, torneo.diasJuego, rounds);

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
            fecha: roundDates[round],
            hora: '17:00',
            jornada: round + 1,
            fase: 'JORNADA',
          });
        }
      }
      rotation.push(rotation.shift());
    }

    await asignarCanchasDisponibles(fixtures, torneo.tipo);

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
      where: { torneoId: torneo.id },
    });
    if (existingLiguilla.some((p) => esFaseEliminatoria(p.fase))) {
      return res.status(400).json({ error: 'Ya existe una liguilla generada.' });
    }

    const ranking = calcularTablaPosiciones(torneo.equipos, torneo.partidos);

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

    const fixtures = matchups.map(([home, away]) => ({
      torneoId: torneo.id,
      equipoLocalId: home.equipoId,
      equipoVisitanteId: away.equipoId,
      fecha: new Date(torneo.fechaFin),
      hora: '17:00',
      jornada: nextJornada,
      fase: 'CUARTOS',
    }));

    await asignarCanchasDisponibles(fixtures, torneo.tipo);

    await prisma.partido.createMany({ data: fixtures });

    const partidos = await prisma.partido.findMany({
      where: { torneoId: torneo.id, fase: 'CUARTOS' },
      include: {
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
      orderBy: { jornada: 'asc' },
    });

    res.status(201).json({
      clasificados: top8.map((t, i) => ({ pos: i + 1, equipo: t.equipo, pts: t.pts, dg: t.dg })),
      partidos,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, getTabla, create, update, remove, generarJornadas, generarLiguilla };
