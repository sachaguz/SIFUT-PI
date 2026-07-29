const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.torneoId) where.torneoId = req.query.torneoId;

    const equipos = await prisma.equipo.findMany({
      where,
      include: {
        torneo: { select: { id: true, nombre: true } },
        _count: { select: { jugadores: true } },
      },
      orderBy: { nombre: 'asc' },
    });
    res.json(equipos);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id: req.params.id },
      include: {
        torneo: { select: { id: true, nombre: true } },
        jugadores: { orderBy: { numeroCamiseta: 'asc' } },
      },
    });
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' });
    res.json(equipo);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const equipo = await prisma.equipo.create({
      data: req.body,
      include: { torneo: { select: { id: true, nombre: true } } },
    });
    res.status(201).json(equipo);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const equipo = await prisma.equipo.update({
      where: { id: req.params.id },
      data: req.body,
      include: { torneo: { select: { id: true, nombre: true } } },
    });
    res.json(equipo);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.equipo.delete({ where: { id: req.params.id } });
    res.json({ message: 'Equipo eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
