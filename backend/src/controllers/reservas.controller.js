const prisma = require('../config/database');
const generateFolio = require('../utils/generateFolio');

async function getAll(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'USUARIO') where.userId = req.user.id;
    if (req.query.estado) where.estado = req.query.estado;
    if (req.query.fecha) {
      const date = new Date(req.query.fecha);
      where.fecha = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        cancha: { include: { sede: { select: { id: true, nombre: true } } } },
        user: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reservas);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'USUARIO') where.userId = req.user.id;

    const reserva = await prisma.reserva.findFirst({
      where,
      include: {
        cancha: { include: { sede: true } },
        user: { select: { id: true, nombre: true, apellido: true, email: true } },
        pago: true,
      },
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { canchaId, fecha, horaInicio, horaFin, metodoPago } = req.body;

    const conflicto = await prisma.reserva.findFirst({
      where: {
        canchaId,
        fecha: new Date(fecha),
        horaInicio,
        estado: { not: 'CANCELADA' },
      },
    });
    if (conflicto) {
      return res.status(409).json({ error: 'El horario ya está reservado' });
    }

    const cancha = await prisma.cancha.findUnique({ where: { id: canchaId } });
    if (!cancha) return res.status(404).json({ error: 'Cancha no encontrada' });

    const folio = generateFolio('RES');

    const reserva = await prisma.reserva.create({
      data: {
        userId: req.user.id,
        canchaId,
        fecha: new Date(fecha),
        horaInicio,
        horaFin,
        folio,
        totalPagado: cancha.precioPorHora,
        metodoPago,
      },
      include: {
        cancha: { include: { sede: { select: { id: true, nombre: true } } } },
      },
    });

    await prisma.pago.create({
      data: {
        reservaId: reserva.id,
        monto: cancha.precioPorHora,
        metodo: metodoPago,
        folio: generateFolio('PAG'),
        concepto: `Reserva ${reserva.folio} - ${cancha.nombre}`,
      },
    });

    res.status(201).json(reserva);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const where = { id: req.params.id };
    if (req.user.role === 'USUARIO') where.userId = req.user.id;

    const reserva = await prisma.reserva.findFirst({ where });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
    if (reserva.estado === 'CANCELADA') {
      return res.status(400).json({ error: 'La reserva ya está cancelada' });
    }

    const updated = await prisma.reserva.update({
      where: { id: req.params.id },
      data: { estado: 'CANCELADA' },
      include: { cancha: { include: { sede: { select: { id: true, nombre: true } } } } },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function getDisponibilidad(req, res, next) {
  try {
    const { canchaId, fecha } = req.query;
    if (!canchaId || !fecha) {
      return res.status(400).json({ error: 'canchaId y fecha son requeridos' });
    }

    const targetDate = new Date(fecha);
    const diaSemana = targetDate.getDay();

    const horarios = await prisma.horario.findMany({
      where: { canchaId, diaSemana, disponible: true },
      orderBy: { horaInicio: 'asc' },
    });

    const reservas = await prisma.reserva.findMany({
      where: {
        canchaId,
        fecha: targetDate,
        estado: { not: 'CANCELADA' },
      },
      select: { horaInicio: true, horaFin: true },
    });

    const horasReservadas = new Set(reservas.map((r) => r.horaInicio));

    const slots = horarios.map((h) => ({
      horaInicio: h.horaInicio,
      horaFin: h.horaFin,
      disponible: !horasReservadas.has(h.horaInicio),
    }));

    res.json(slots);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, cancel, getDisponibilidad };
