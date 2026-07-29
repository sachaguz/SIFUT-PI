const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const sedes = await prisma.sede.findMany({
      include: { canchas: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(sedes);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const sede = await prisma.sede.findUnique({
      where: { id: req.params.id },
      include: { canchas: true },
    });
    if (!sede) return res.status(404).json({ error: 'Sede no encontrada' });
    res.json(sede);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const sede = await prisma.sede.create({
      data: req.body,
      include: { canchas: true },
    });
    res.status(201).json(sede);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const sede = await prisma.sede.update({
      where: { id: req.params.id },
      data: req.body,
      include: { canchas: true },
    });
    res.json(sede);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.sede.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sede eliminada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
