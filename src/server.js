const app = require('./app');
const AppLogger = require('./config/logger');
const { connectDB } = require('./config/db');
const seedRoles = require('./config/seedRoles');

const port = process.env.PORT || 3000;

connectDB().then(() => {
  seedRoles();
  app.listen(port, () => {
    AppLogger.log.info(`Listening on port ${port}!`);
  });
});
