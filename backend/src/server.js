const mongoose = require('mongoose');

const app = require('./app');
const AppLogger = require('./config/logger');
const { connectDB } = require('./config/db');
const seedRoles = require('./config/seedRoles');
const { userRole } = require('./config/constants');
const { port } = require('./config/app.config');

const terminateSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGTERM: 15,
};

let server;

async function start() {
  try {
    AppLogger.log.info('Starting server...');
    await connectDB();

    seedRoles(Object.values(userRole));

    server = app.listen(port, () => {
      AppLogger.log.info(`Listening on port ${port}...`);
    });
  } catch (err) {
    AppLogger.log.error('Unable to start server!', err.message);

    process.exit(1);
  }
}

start();

Object.keys(terminateSignals).forEach(signal => {
  process.on(signal, () => {
    AppLogger.log.info(`${signal} signal received.`);

    AppLogger.log.info('Closing http server...');
    server.close(() => {
      AppLogger.log.info('Http server closed.');

      mongoose.connection.close(false, () => {
        AppLogger.log.info('MongoDb connection closed.');

        process.exit(0);
      });
    });
  });
});
