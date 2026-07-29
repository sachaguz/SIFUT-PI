function errorHandler(err, req, res, _next) {
  console.error(err.stack);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'El registro ya existe (campo único duplicado)' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;
