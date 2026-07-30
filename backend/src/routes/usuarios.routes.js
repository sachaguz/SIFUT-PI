const { Router } = require('express');
const ctrl = require('../controllers/usuarios.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, roleGuard('ADMIN'), ctrl.getAll);
router.get('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.getById);
router.post('/', authenticate, roleGuard('ADMIN'), v.usuarioCreate, ctrl.create);
router.put('/:id', authenticate, roleGuard('ADMIN'), v.uuid, v.usuarioUpdate, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
