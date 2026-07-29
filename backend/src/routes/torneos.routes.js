const { Router } = require('express');
const ctrl = require('../controllers/torneos.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.get('/:id/tabla', authenticate, v.uuid, ctrl.getTabla);
router.post('/', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.torneo, ctrl.create);
router.post('/:id/generar-jornadas', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.generarJornadas);
router.post('/:id/generar-liguilla', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.generarLiguilla);
router.put('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
