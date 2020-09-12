const { middleware, common } = require('../config/constants');
const AppLogger = require('../config/logger');
const { ROLES } = require('../models');
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

      res.status(400).send({
        error: {
          statusCode: 400,
          message: middleware.verifySignUp.USERNAME_EXISTS,
        },
      });
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

      res
        .status(400)
        .send({
          error: {
            statusCode: 400,
            message: middleware.verifySignUp.EMAIL_EXISTS,
          },
        });
      return;
    }

    next();
  } catch (err) {
    AppLogger.log.error(
      { err },
      middleware.verifySignUp.VERIFY_SIGNUP_MIDDLEWARE
    );

    res
      .status(500)
      .send({
        error: {
          statusCode: 400,
          message: err.message || common.UNKNOWN_ERROR,
        },
      });
    return;
  }
};

const checkRoleExisted = (req, res, next) => {
  if (req.body.roles) {
    const nonExistentRoles = req.body.roles.filter(
      (role) => !ROLES.includes(role)
    );

    if (nonExistentRoles.length) {
      res
        .status(400)
        .send({
          error: {
            statusCode: 400,
            message: `${middleware.verifySignUp.NON_EXISTENT_ROLE}${
              nonExistentRoles.length > 1 ? 's' : ''
            }: ${nonExistentRoles.join(', ')}`,
          },
        });
      return null;
    }
  }
  next();
};

module.exports = { checkDuplicateUsernameOrEmail, checkRoleExisted };
