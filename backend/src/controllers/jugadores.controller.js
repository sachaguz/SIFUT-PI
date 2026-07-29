const prisma = require('../config/database');

async function getByEquipo(req, res, next) {
  try {
    const jugadores = await prisma.jugador.findMany({
      where: { equipoId: req.params.equipoId },
      include: { equipo: { select: { id: true, nombre: true } } },
      orderBy: { numeroCamiseta: 'asc' },
    });
    res.json(jugadores);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const jugador = await prisma.jugador.findUnique({
      where: { id: req.params.id },
      include: { equipo: { select: { id: true, nombre: true } } },
    });
    if (!jugador) return res.status(404).json({ error: 'Jugador no encontrado' });
    res.json(jugador);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const jugador = await prisma.jugador.create({
      data: req.body,
      include: { equipo: { select: { id: true, nombre: true } } },
    });
    res.status(201).json(jugador);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const jugador = await prisma.jugador.update({
      where: { id: req.params.id },
      data: req.body,
      include: { equipo: { select: { id: true, nombre: true } } },
    });
    res.json(jugador);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.jugador.delete({ where: { id: req.params.id } });
    res.json({ message: 'Jugador eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getByEquipo, getById, create, update, remove };
