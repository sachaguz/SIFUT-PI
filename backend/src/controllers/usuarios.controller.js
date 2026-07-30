const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const cryptoService = require('../services/crypto.service');

const SALT_ROUNDS = 12;

const SAFE_SELECT = {
  id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  role: true,
  createdAt: true,
  _count: { select: { reservas: true } },
};

function withDecryptedTelefono(usuario) {
  return { ...usuario, telefono: usuario.telefono ? cryptoService.decrypt(usuario.telefono) : null };
}

async function getAll(req, res, next) {
  try {
    const { role, q } = req.query;
    const where = {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { apellido: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const usuarios = await prisma.user.findMany({
      where,
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    res.json(usuarios.map(withDecryptedTelefono));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: SAFE_SELECT,
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(withDecryptedTelefono(usuario));
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { nombre, apellido, email, password, telefono, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const usuario = await prisma.user.create({
      data: {
        nombre,
        apellido,
        email,
        password: hashedPassword,
        telefono: telefono ? cryptoService.encrypt(telefono) : null,
        role: role || 'USUARIO',
      },
      select: SAFE_SELECT,
    });
    res.status(201).json(withDecryptedTelefono(usuario));
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { nombre, apellido, email, telefono, role } = req.body;

    if (req.params.id === req.user.id && role && role !== 'ADMIN') {
      return res.status(400).json({ error: 'No puedes quitarte tu propio rol de administrador' });
    }

    const data = { nombre, apellido, email, role };
    if (telefono !== undefined) {
      data.telefono = telefono ? cryptoService.encrypt(telefono) : null;
    }

    const usuario = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: SAFE_SELECT,
    });
    res.json(withDecryptedTelefono(usuario));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create, update, remove };
