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

const hasRole = (...args) => async (req, res, next) => {
  try {
    const rolesName = args.flat();

    const user = await User.findById(req.userId);

    const roles = await Role.find({ _id: { $in: user.roles } });

    const hasUserRole = roles.some(role => rolesName.includes(role.name));

    if (hasUserRole) {
      next();
      return true;
    }

    responseWithError(
      403,
      `${common.REQUIRED_ROLE}: ${rolesName.join(', ')}`,
    )(res);
    return false;
  } catch (err) {
    AppLogger.log.error({ err }, middleware.authJwt.AUTH_JWT_MIDDLEWARE);

    responseWithError(500, err.message || common.UNKNOWN_ERROR)(res);
    return false;
  }
};

exports.isAdmin = hasRole(userRole.ADMIN);
exports.isModerator = hasRole(userRole.MODERATOR);
exports.hasRole = hasRole;
