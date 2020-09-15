const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('../models');
const AppLogger = require('../config/logger');
const { auth, userRole } = require('../config/constants');
const { responseWithError } = require('../util/responseWithError');
const authConfig = require('../config/auth.config');

const User = db.user;
const Role = db.role;

exports.signUp = async (req, res, next) => {
  if (!req.body.password || !req.body.username || !req.body.email) {
    const error = new Error('Missing user data');
    error.status = 400;
    next(error);
    return;
  }

  try {
    const user = User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password || '', 8),
    });

    if (req.body.roles && req.body.roles.length) {
      const roles = await Role.find({ name: { $in: req.body.roles } });

      user.roles = roles.map((role) => role._id);
    } else {
      const role = await Role.findOne({ name: userRole.USER });

      user.roles = [role._id];
    }
    const result = await user.save();

    AppLogger.log.info(`${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_SUCCESS}`);

    res.status(201).send(result);
    return;
  } catch (err) {
    AppLogger.log.error(
      { err },
      `${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_FAILURE}`
    );

    err.status = 500;
    next(err);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    }).populate('roles', '-__v');

    if (!user) {
      responseWithError(404, auth.USER_NOT_FOUND)(res);
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      responseWithError(401, auth.INVALID_PASSWORD)(res);
      return;
    }

    const token = jwt.sign({ id: user.id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    const authorities = user.roles.map(
      (role) => `ROLE_${role.name.toUpperCase()}`
    );

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
    });
    return;
  } catch (err) {
    AppLogger.log.error(
      { err },
      `${auth.SIGNIN_CONTROLLER}: ${auth.SIGNIN_FAILURE}`
    );

    responseWithError(500, err.message)(res);
  }
};
