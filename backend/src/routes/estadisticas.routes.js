const { Router } = require('express');
const ctrl = require('../controllers/estadisticas.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/goleo', authenticate, ctrl.getGoleo);
router.get('/disciplina', authenticate, ctrl.getDisciplina);

module.exports = router;
