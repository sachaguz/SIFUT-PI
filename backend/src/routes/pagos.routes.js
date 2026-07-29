const { Router } = require('express');
const ctrl = require('../controllers/pagos.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/', authenticate, roleGuard('ADMIN'), ctrl.getAll);
router.get('/resumen', authenticate, roleGuard('ADMIN'), ctrl.getResumen);
router.get('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.getById);
router.patch('/:id/aprobar', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.aprobar);
router.patch('/:id/rechazar', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.rechazar);

module.exports = router;
