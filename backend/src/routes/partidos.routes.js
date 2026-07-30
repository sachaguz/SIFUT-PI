const { Router } = require('express');
const ctrl = require('../controllers/partidos.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.post('/', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.partido, ctrl.create);
router.put('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.remove);
router.patch('/:id/resultado', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, v.resultado, ctrl.registrarResultado);
router.post('/:id/eventos', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, v.evento, ctrl.addEvento);
router.delete('/:id/eventos/:eventoId', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), ctrl.removeEvento);

module.exports = router;
