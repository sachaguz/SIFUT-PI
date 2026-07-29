const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.torneoId) where.torneoId = req.query.torneoId;
    if (req.query.estado) where.estado = req.query.estado;

    const partidos = await prisma.partido.findMany({
      where,
      include: {
        torneo: { select: { id: true, nombre: true } },
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
        cancha: { select: { id: true, nombre: true, sede: { select: { nombre: true } } } },
      },
      orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
    });
    res.json(partidos);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const partido = await prisma.partido.findUnique({
      where: { id: req.params.id },
      include: {
        torneo: { select: { id: true, nombre: true } },
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
        cancha: { include: { sede: { select: { nombre: true } } } },
        eventos: {
          include: { jugador: { select: { id: true, nombre: true, equipo: { select: { id: true, nombre: true } } } } },
          orderBy: { minuto: 'asc' },
        },
      },
    });
    if (!partido) return res.status(404).json({ error: 'Partido no encontrado' });
    res.json(partido);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const partido = await prisma.partido.create({
      data: {
        ...req.body,
        fecha: new Date(req.body.fecha),
      },
      include: {
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
      },
    });
    res.status(201).json(partido);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = { ...req.body };
    if (data.fecha) data.fecha = new Date(data.fecha);

    const partido = await prisma.partido.update({
      where: { id: req.params.id },
      data,
    });
    res.json(partido);
  } catch (err) {
    next(err);
  }
}

async function registrarResultado(req, res, next) {
  try {
    const { golesLocal, golesVisitante, estadisticas } = req.body;

    const partido = await prisma.partido.update({
      where: { id: req.params.id },
      data: {
        golesLocal,
        golesVisitante,
        estadisticas: estadisticas || undefined,
        estado: 'FINALIZADO',
      },
      include: {
        equipoLocal: { select: { id: true, nombre: true } },
        equipoVisitante: { select: { id: true, nombre: true } },
        eventos: {
          include: { jugador: { select: { id: true, nombre: true } } },
          orderBy: { minuto: 'asc' },
        },
      },
    });
    res.json(partido);
  } catch (err) {
    next(err);
  }
}

async function addEvento(req, res, next) {
  try {
    const evento = await prisma.eventoPartido.create({
      data: {
        partidoId: req.params.id,
        ...req.body,
      },
      include: { jugador: { select: { id: true, nombre: true } } },
    });

    if (req.body.tipo === 'GOL') {
      const jugador = await prisma.jugador.findUnique({ where: { id: req.body.jugadorId } });
      const partido = await prisma.partido.findUnique({ where: { id: req.params.id } });
      const isLocal = jugador.equipoId === partido.equipoLocalId;
      await prisma.partido.update({
        where: { id: req.params.id },
        data: isLocal ? { golesLocal: { increment: 1 } } : { golesVisitante: { increment: 1 } },
      });
    } else if (req.body.tipo === 'AUTOGOL') {
      const jugador = await prisma.jugador.findUnique({ where: { id: req.body.jugadorId } });
      const partido = await prisma.partido.findUnique({ where: { id: req.params.id } });
      const isLocal = jugador.equipoId === partido.equipoLocalId;
      await prisma.partido.update({
        where: { id: req.params.id },
        data: isLocal ? { golesVisitante: { increment: 1 } } : { golesLocal: { increment: 1 } },
      });
    }

    res.status(201).json(evento);
  } catch (err) {
    next(err);
  }
}

async function removeEvento(req, res, next) {
  try {
    await prisma.eventoPartido.delete({ where: { id: req.params.eventoId } });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, registrarResultado, addEvento, removeEvento };
