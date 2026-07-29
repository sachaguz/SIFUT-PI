const { body, param, query, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const v = {
  register: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('apellido').trim().notEmpty().withMessage('Apellido es requerido'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    handleValidation,
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    handleValidation,
  ],
  sede: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('direccion').trim().notEmpty().withMessage('Dirección es requerida'),
    body('telefono').trim().notEmpty().withMessage('Teléfono es requerido'),
    body('activa').optional().isBoolean(),
    handleValidation,
  ],
  cancha: [
    body('sedeId').isUUID().withMessage('Sede inválida'),
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('tipo').isIn(['FUTBOL5', 'FUTBOL7', 'FUTBOL11']).withMessage('Tipo de cancha inválido'),
    body('superficie').trim().notEmpty().withMessage('Superficie es requerida'),
    body('capacidad').isInt({ min: 1 }).withMessage('Capacidad debe ser mayor a 0'),
    body('precioPorHora').isDecimal().withMessage('Precio por hora inválido'),
    handleValidation,
  ],
  horario: [
    body('canchaId').isUUID().withMessage('Cancha inválida'),
    body('diaSemana').isInt({ min: 0, max: 6 }).withMessage('Día de la semana inválido (0-6)'),
    body('horaInicio').matches(/^\d{2}:\d{2}$/).withMessage('Hora de inicio inválida (HH:MM)'),
    body('horaFin').matches(/^\d{2}:\d{2}$/).withMessage('Hora de fin inválida (HH:MM)'),
    body('disponible').optional().isBoolean(),
    handleValidation,
  ],
  reserva: [
    body('canchaId').isUUID().withMessage('Cancha inválida'),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('horaInicio').matches(/^\d{2}:\d{2}$/).withMessage('Hora de inicio inválida'),
    body('horaFin').matches(/^\d{2}:\d{2}$/).withMessage('Hora de fin inválida'),
    body('metodoPago').isIn(['TARJETA', 'TRANSFERENCIA', 'EFECTIVO']).withMessage('Método de pago inválido'),
    handleValidation,
  ],
  torneo: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('tipo').trim().notEmpty().withMessage('Tipo es requerido'),
    body('categoria').trim().notEmpty().withMessage('Categoría es requerida'),
    body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
    body('fechaFin').isISO8601().withMessage('Fecha de fin inválida'),
    body('diasJuego').isArray().withMessage('Días de juego debe ser un arreglo'),
    handleValidation,
  ],
  equipo: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('categoria').trim().notEmpty().withMessage('Categoría es requerida'),
    body('torneoId').isUUID().withMessage('Torneo inválido'),
    handleValidation,
  ],
  jugador: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('numeroCamiseta').isInt({ min: 1, max: 99 }).withMessage('Número de camiseta inválido'),
    body('posicion').isIn(['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO']).withMessage('Posición inválida'),
    body('equipoId').isUUID().withMessage('Equipo inválido'),
    handleValidation,
  ],
  partido: [
    body('torneoId').isUUID().withMessage('Torneo inválido'),
    body('equipoLocalId').isUUID().withMessage('Equipo local inválido'),
    body('equipoVisitanteId').isUUID().withMessage('Equipo visitante inválido'),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('hora').matches(/^\d{2}:\d{2}$/).withMessage('Hora inválida'),
    body('jornada').isInt({ min: 1 }).withMessage('Jornada inválida'),
    body('canchaId').optional().isUUID(),
    handleValidation,
  ],
  resultado: [
    body('golesLocal').isInt({ min: 0 }).withMessage('Goles locales inválidos'),
    body('golesVisitante').isInt({ min: 0 }).withMessage('Goles visitantes inválidos'),
    body('estadisticas').optional().isObject(),
    handleValidation,
  ],
  evento: [
    body('tipo').isIn(['GOL', 'AUTOGOL', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'SUSTITUCION']).withMessage('Tipo de evento inválido'),
    body('jugadorId').isUUID().withMessage('Jugador inválido'),
    body('minuto').isInt({ min: 0, max: 120 }).withMessage('Minuto inválido'),
    handleValidation,
  ],
  uuid: [
    param('id').isUUID().withMessage('ID inválido'),
    handleValidation,
  ],
};

module.exports = v;
