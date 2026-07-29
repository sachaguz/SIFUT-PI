const config = require('./config');
const createApp = require('./app');

const app = createApp({ private: true });

app.listen(config.privatePort, () => {
  console.log(`[Servidor Privado] Escuchando en puerto ${config.privatePort}`);
});
