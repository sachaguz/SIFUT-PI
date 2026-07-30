const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const { metricsMiddleware } = require('./middleware/metrics');

function createApp(options = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan('combined'));
  app.use(metricsMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (options.public) {
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/sedes', require('./routes/sedes.routes'));
    app.use('/api/canchas', require('./routes/canchas.routes'));
    app.use('/api/horarios', require('./routes/horarios.routes'));
    app.use('/api/reservas', require('./routes/reservas.routes'));
    app.use('/api/torneos', require('./routes/torneos.routes'));
    app.use('/api/equipos', require('./routes/equipos.routes'));
    app.use('/api/jugadores', require('./routes/jugadores.routes'));
    app.use('/api/partidos', require('./routes/partidos.routes'));
    app.use('/api/pagos', require('./routes/pagos.routes'));
    app.use('/api/estadisticas', require('./routes/estadisticas.routes'));
  }

  if (options.private) {
    const { register } = require('./middleware/metrics');

    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/sedes', require('./routes/sedes.routes'));
    app.use('/api/canchas', require('./routes/canchas.routes'));
    app.use('/api/horarios', require('./routes/horarios.routes'));
    app.use('/api/reservas', require('./routes/reservas.routes'));
    app.use('/api/torneos', require('./routes/torneos.routes'));
    app.use('/api/equipos', require('./routes/equipos.routes'));
    app.use('/api/jugadores', require('./routes/jugadores.routes'));
    app.use('/api/partidos', require('./routes/partidos.routes'));
    app.use('/api/pagos', require('./routes/pagos.routes'));
    app.use('/api/estadisticas', require('./routes/estadisticas.routes'));

    app.get('/metrics', async (_req, res) => {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    });
  }

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
