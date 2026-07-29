const { Router } = require('express');
const ctrl = require('../controllers/reservas.controller');
const { authenticate } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/disponibilidad', authenticate, ctrl.getDisponibilidad);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.post('/', authenticate, v.reserva, ctrl.create);
router.patch('/:id/cancelar', authenticate, v.uuid, ctrl.cancel);

module.exports = router;
