const prisma = require('../config/database');

async function getByCancha(req, res, next) {
  try {
    const horarios = await prisma.horario.findMany({
      where: { canchaId: req.params.canchaId },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
    res.json(horarios);
  } catch (err) {
    next(err);
  }
}

async function getBySede(req, res, next) {
  try {
    const canchas = await prisma.cancha.findMany({
      where: { sedeId: req.params.sedeId },
      select: { id: true },
    });
    const canchaIds = canchas.map((c) => c.id);

    const horarios = await prisma.horario.findMany({
      where: { canchaId: { in: canchaIds } },
      include: { cancha: { select: { id: true, nombre: true, precioPorHora: true } } },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
    res.json(horarios);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const horario = await prisma.horario.create({ data: req.body });
    res.status(201).json(horario);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const horario = await prisma.horario.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(horario);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.horario.delete({ where: { id: req.params.id } });
    res.json({ message: 'Horario eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getByCancha, getBySede, create, update, remove };
