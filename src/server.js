const mongoose = require('mongoose');
const app = require('./app');
const AppLogger = require('./config/logger');
const { connectDB } = require('./config/db');
const seedRoles = require('./config/seedRoles');
const { userRole } = require('./config/constants');
const { port } = require('./config/app.config');

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

process.on('SIGTERM', () => {
  AppLogger.log.info('SIGTERM signal received.');

  AppLogger.log.info('Closing http server...');
  server.close(() => {
    AppLogger.log.info('Http server closed.');

    mongoose.connection.close(false, () => {
      AppLogger.log.info('MongoDb connection closed.');

      process.exit(0);
    });
  });
});
