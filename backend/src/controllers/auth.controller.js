const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const config = require('../config');

const SALT_ROUNDS = 12;

async function register(req, res, next) {
  try {
    const { nombre, apellido, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        nombre,
        apellido,
        email,
        password: hashedPassword,
        role: 'USUARIO',
      },
      select: { id: true, nombre: true, apellido: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrecta' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrecta' });
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiration,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration,
    });

    res.json({
      user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const payload = jwt.verify(token, config.jwt.refreshSecret);
    const newPayload = { id: payload.id, email: payload.email, role: payload.role };

    const accessToken = jwt.sign(newPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiration,
    });

    res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Refresh token inválido' });
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nombre: true, apellido: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refreshToken, getProfile };
