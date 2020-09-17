const db = require('../models');
const AppLogger = require('./logger');

const Role = db.role;

const saveRole = async roleName => {
  try {
    const role = new Role({ name: roleName });
    await role.save();
    AppLogger.log.warn(`Initial: added '${roleName}' to roles collection`);
  } catch (err) {
    AppLogger.log.error({ err }, `Initial: add '${roleName}' role error`);
  }
};

const seedRoles = async roles => {
  try {
    const count = await Role.estimatedDocumentCount({});

    if (!count) {
      await roles.map(async role => {
        await saveRole(role);
      });
    }

    AppLogger.log.info('Initial: Roles exists');
  } catch (err) {
    AppLogger.log.error({ err }, 'Initial: add roles error');
  }
};

module.exports = seedRoles;
