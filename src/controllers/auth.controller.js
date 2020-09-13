const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('../config/auth.config');
const db = require('../models');
const AppLogger = require('../config/logger');
const { auth, userRole } = require('../config/constants');

const User = db.user;
const Role = db.role;

exports.signUp = async (req, res, next) => {
  // if (!req.body.password) {
  //   res.status(400).send({
  //     error: { statusCode: 400, message: 'Missing password property' },
  //   });
  //   return;
  // }

  try {
    const user = User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password || '', 8),
    });

    if (req.body.roles) {
      const roles = await Role.find({ name: { $in: req.body.roles } });

      user.roles = roles.map((role) => role._id);
    } else {
      const role = await Role.findOne({ name: userRole.USER });

      user.roles = [role._id];
    }
    const result = await user.save();

    AppLogger.log.info(`${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_SUCCESS}`);

    res.status(201).send(result);
  } catch (err) {
    AppLogger.log.error(
      { err },
      `${auth.SIGNUP_CONTROLLER}: ${auth.SIGNUP_FAILURE}`
    );

    res.status(500).send({ error: { statusCode: 500, message: err.message } });
    return;
  }
};
