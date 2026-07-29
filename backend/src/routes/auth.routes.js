const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const v = require('../middleware/validate');

const router = Router();

router.post('/register', v.register, ctrl.register);
router.post('/login', v.login, ctrl.login);
router.post('/refresh', ctrl.refreshToken);
router.get('/profile', authenticate, ctrl.getProfile);

module.exports = router;
