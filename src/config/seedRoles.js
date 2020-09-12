const db = require('../models');
const { userRole } = require('./constants');
const AppLogger = require('./logger');

const Role = db.role;

const seedRoles = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: userRole.USER,
      }).save((err) => {
        logRoleSaveResult(userRole.USER, err);
      });

      new Role({
        name: userRole.MODERATOR,
      }).save((err) => {
        logRoleSaveResult(userRole.MODERATOR, err);
      });

      new Role({
        name: userRole.ADMIN,
      }).save((err) => {
        logRoleSaveResult(userRole.ADMIN, err);
      });
    } else {
      if (err) {
        AppLogger.log.error({ err }, 'Initial: add roles error');
      }
      AppLogger.log.info('Initial: Roles exists');
    }
  });
};

const logRoleSaveResult = (role, err) => {
  if (err) {
    AppLogger.log.error({ err }, `Initial: add '${role}' role error`);
  }

  AppLogger.log.warn(`Initial: added '${role}' to roles collection`);
};

module.exports = seedRoles;
