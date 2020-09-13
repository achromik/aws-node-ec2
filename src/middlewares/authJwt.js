const jwt = require('jsonwebtoken');

const AppLogger = require('../config/logger');
const authConfig = require('../config/auth.config');
const { middleware, common, userRole } = require('../config/constants');
const db = require('../models');
const { responseWithError } = require('../util/responseWithError');

const User = db.user;
const Role = db.role;

exports.verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];

  if (!token) {
    responseWithError(403, middleware.authJwt.NO_TOKEN_PROVIDED)(res);
    return;
  }

  jwt.verify(token, authConfig.secret, (err, decode) => {
    if (err) {
      responseWithError(401, middleware.authJwt.UNAUTHORIZED)(res);
      return;
    }
    req.userId = decode.id;
    next();
  });
};

exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    const roles = await Role.find({ _id: { $in: user.roles } });

    const isAdmin = roles.some((role) => role.name === userRole.ADMIN);
    if (isAdmin) {
      next();
      return true;
    }

    responseWithError(403, middleware.authJwt.ADMIN_ROLE_REQUIRED)(res);
    return false;
  } catch (err) {
    AppLogger.log.error({ err }, middleware.authJwt.AUTH_JWT_MIDDLEWARE);

    responseWithError(500, err.message || common.UNKNOWN_ERROR)(res);
    return false;
  }
};
