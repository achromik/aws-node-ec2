const db = require('../models');
const { userRole } = require('./constants');
const AppLogger = require('./logger');

const Role = db.role;

const logRoleSaveResult = (role, err) => {
  if (err) {
    AppLogger.log.error({ err }, `Initial: add '${role}' role error`);
  }

  AppLogger.log.warn(`Initial: added '${role}' to roles collection`);
};

const seedRoles = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: userRole.USER,
      }).save((e) => {
        logRoleSaveResult(userRole.USER, e);
      });

      new Role({
        name: userRole.MODERATOR,
      }).save((e) => {
        logRoleSaveResult(userRole.MODERATOR, e);
      });

      new Role({
        name: userRole.ADMIN,
      }).save((e) => {
        logRoleSaveResult(userRole.ADMIN, e);
      });
    } else {
      if (err) {
        AppLogger.log.error({ err }, 'Initial: add roles error');
      }
      AppLogger.log.info('Initial: Roles exists');
    }
  });
};

module.exports = seedRoles;
