const { Router } = require('express');
const ctrl = require('../controllers/equipos.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.post('/', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.equipo, ctrl.create);
router.put('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ORGANIZADOR', 'ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
