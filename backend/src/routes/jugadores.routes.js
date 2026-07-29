const { Router } = require('express');
const ctrl = require('../controllers/jugadores.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/equipo/:equipoId', authenticate, ctrl.getByEquipo);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.post('/', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.jugador, ctrl.create);
router.put('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
