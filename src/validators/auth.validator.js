const Joi = require('joi');

const AppLogger = require('../config/logger');
const { auth, common } = require('../config/constants');

const { signupSchema } = require('../schemas/auth.schema');
const validateRequest = require('../util/validateRequest');
const validationErrorDetailsToString = require('../util/validationErrorDetailsToString');

const signup = async (req, res, next) => {
  try {
    const value = await validateRequest(req, signupSchema);
    req.body = value;
    next();
  } catch (err) {
    const message = `${
      common.VALIDATION_ERROR
    }: ${validationErrorDetailsToString(err.details)}`;

    const body = {
      status: 400,
      error: message,
    };

    AppLogger.log.warn({ err }, auth.SIGNUP_VALIDATOR);

    res.status(400).send(body);
  }
};

module.exports = { signup };
