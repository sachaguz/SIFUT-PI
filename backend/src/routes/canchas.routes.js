const { Router } = require('express');
const ctrl = require('../controllers/canchas.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, ctrl.getAll);
router.get('/:id', authenticate, v.uuid, ctrl.getById);
router.post('/', authenticate, roleGuard('ADMIN'), v.cancha, ctrl.create);
router.put('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
