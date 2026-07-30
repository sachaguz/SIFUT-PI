const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const { metodo, estado, desde, hasta } = req.query;
    const where = {};
    if (metodo) where.metodo = metodo;
    if (estado) where.estado = estado;
    if (desde || hasta) {
      where.fecha = {
        ...(desde ? { gte: new Date(new Date(desde).setHours(0, 0, 0, 0)) } : {}),
        ...(hasta ? { lt: new Date(new Date(hasta).setHours(23, 59, 59, 999)) } : {}),
      };
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        reserva: {
          include: {
            user: { select: { id: true, nombre: true, apellido: true } },
            cancha: { select: { id: true, nombre: true, sede: { select: { nombre: true } } } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });
    res.json(pagos);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: req.params.id },
      include: {
        reserva: {
          include: {
            user: { select: { id: true, nombre: true, apellido: true, email: true } },
            cancha: { include: { sede: true } },
          },
        },
      },
    });
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(pago);
  } catch (err) {
    next(err);
  }
}

async function aprobar(req, res, next) {
  try {
    const pago = await prisma.pago.update({
      where: { id: req.params.id },
      data: { estado: 'APROBADO' },
    });
    res.json(pago);
  } catch (err) {
    next(err);
  }
}

async function rechazar(req, res, next) {
  try {
    const pago = await prisma.pago.update({
      where: { id: req.params.id },
      data: { estado: 'RECHAZADO' },
    });
    res.json(pago);
  } catch (err) {
    next(err);
  }
}

async function getResumen(req, res, next) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);

    const [ingresoDiario, ingresoMensual, pendientes] = await Promise.all([
      prisma.pago.aggregate({
        where: { estado: 'APROBADO', fecha: { gte: hoy, lt: manana } },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.pago.aggregate({
        where: { estado: 'APROBADO', fecha: { gte: inicioMes, lte: finMes } },
        _sum: { monto: true },
        _count: true,
      }),
      prisma.pago.findMany({
        where: { estado: 'PENDIENTE' },
        include: {
          reserva: {
            include: {
              user: { select: { nombre: true, apellido: true } },
              cancha: { select: { nombre: true } },
            },
          },
        },
        orderBy: { fecha: 'desc' },
      }),
    ]);

    const montoPendiente = pendientes.reduce((sum, p) => sum + Number(p.monto), 0);

    res.json({
      ingresoDiario: {
        total: ingresoDiario._sum.monto || 0,
        cantidad: ingresoDiario._count,
      },
      ingresoMensual: {
        total: ingresoMensual._sum.monto || 0,
        cantidad: ingresoMensual._count,
      },
      pendientes,
      montoPendiente,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, aprobar, rechazar, getResumen };
