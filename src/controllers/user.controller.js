const AppLogger = require('../config/logger');
const db = require('../models');

const User = db.user;

const saveUser = async (req, res, next) => {
  const { body } = req;
  try {
    const user = new User(body);
    const result = await user.save({ body });
    res.send({ data: result });
  } catch (err) {
    AppLogger.log.error({ err }, 'Saving user failed');
    res
      .status(400)
      .send({ error: { statusCode: 400, message: 'Saving user failed' } });
  }
};

module.exports = { saveUser };
