const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../config/auth.config');
const db = require('../models');
const AppLogger = require('../config/logger');
const { auth } = require('../config/constants');

const User = db.user;
const Role = db.role;

exports.signUp = async (req, res) => {
  try {
    const user = User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    const result = await user.save();

    AppLogger.log.info(`${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_SUCCESS}`);

    res.status(201).send({ message: auth.SIGNUP_SUCCESS });
  } catch (err) {
    AppLogger.log.error(
      { err },
      `${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_FAILURE}`
    );

    res.status(500).send({ message: err.message });
    return;
  }
};
