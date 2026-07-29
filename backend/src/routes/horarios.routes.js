const { Router } = require('express');
const ctrl = require('../controllers/horarios.controller');
const { authenticate, roleGuard } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.get('/cancha/:canchaId', authenticate, ctrl.getByCancha);
router.get('/sede/:sedeId', authenticate, ctrl.getBySede);
router.post('/', authenticate, roleGuard('ADMIN'), v.horario, ctrl.create);
router.put('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.update);
router.delete('/:id', authenticate, roleGuard('ADMIN'), v.uuid, ctrl.remove);

module.exports = router;
