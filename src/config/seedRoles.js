const db = require('../models');
const { log } = require('./logger');

const Role = db.role;

const seedRoles = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: 'user',
      }).save((err) => {
        logRoleSaveResult('user', err);
      });

      new Role({
        name: 'moderator',
      }).save((err) => {
        logRoleSaveResult('moderator', err);
      });

      new Role({
        name: 'admin',
      }).save((err) => {
        logRoleSaveResult('admin', err);
      });
    } else {
      if (err) {
        log.error({ err }, 'Initial: add roles error');
      }
      log.info('Initial: Roles exists');
    }
  });
};

const logRoleSaveResult = (role, err) => {
  if (err) {
    log.error({ err }, `Initial: add '${role}' role error`);
  }

  log.warn(`Initial: added '${role}' to roles collection`);
};

module.exports = seedRoles;
