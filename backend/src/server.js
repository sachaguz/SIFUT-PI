const config = require('./config');
const createApp = require('./app');

const app = createApp({ public: true });

app.listen(config.port, () => {
  console.log(`[Servidor Público] Escuchando en puerto ${config.port}`);
});
