const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.query.sedeId) where.sedeId = req.query.sedeId;

    const canchas = await prisma.cancha.findMany({
      where,
      include: { sede: { select: { id: true, nombre: true } } },
      orderBy: { nombre: 'asc' },
    });
    res.json(canchas);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const cancha = await prisma.cancha.findUnique({
      where: { id: req.params.id },
      include: { sede: true, horarios: true },
    });
    if (!cancha) return res.status(404).json({ error: 'Cancha no encontrada' });
    res.json(cancha);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const cancha = await prisma.cancha.create({
      data: req.body,
      include: { sede: { select: { id: true, nombre: true } } },
    });
    res.status(201).json(cancha);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const cancha = await prisma.cancha.update({
      where: { id: req.params.id },
      data: req.body,
      include: { sede: { select: { id: true, nombre: true } } },
    });
    res.json(cancha);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.cancha.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cancha eliminada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
