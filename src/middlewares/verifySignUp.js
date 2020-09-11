const { middleware, common } = require('../config/constants');
const AppLogger = require('../config/logger');
const db = require('../models');

const ROLE = db.ROLES;
const User = db.user;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (user) {
      AppLogger.log.warn(
        middleware.verifySignUp.VERIFY_SIGNUP_MIDDLEWARE,
        middleware.verifySignUp.USERNAME_EXISTS
      );

      res
        .status(400)
        .send({ message: middleware.verifySignUp.USERNAME_EXISTS });
      return;
    }

    const email = await User.findOne({
      email: req.body.email,
    });

    if (email) {
      AppLogger.log.warn(
        middleware.verifySignUp.VERIFY_SIGNUP_MIDDLEWARE,
        middleware.verifySignUp.EMAIL_EXISTS
      );

      res.status(400).send({ message: middleware.verifySignUp.EMAIL_EXISTS });
      return;
    }

    next();
  } catch (err) {
    AppLogger.log.error(
      { err },
      middleware.verifySignUp.VERIFY_SIGNUP_MIDDLEWARE
    );

    res.status(500).send({ message: err.message || common.UNKNOWN_ERROR });
    return;
  }
};

module.exports = { checkDuplicateUsernameOrEmail };
