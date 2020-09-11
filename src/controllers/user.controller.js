const db = require('../models');
const User = db.user;

const saveUser = async (req, res, next) => {
  const body = req.body;
  try {
    const user = new User(body);
    const result = await user.save({ body });
    res.send({ data: result });
  } catch (err) {
    AppLogger.log.error({ err }, 'Saving user failed');
    res.status(400).send(err);
  }
};

module.exports = { saveUser };
