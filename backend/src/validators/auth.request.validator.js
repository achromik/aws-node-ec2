const AppLogger = require('../config/logger');
const { auth, common } = require('../config/constants');

const { signupSchema, signinSchema } = require('../schemas/auth.schema');
const validateRequest = require('../util/validateRequest');
const validationErrorDetailsToString = require('../util/validationErrorDetailsToString');

const prepareMessage = details =>
  `${common.VALIDATION_ERROR}: ${validationErrorDetailsToString(details)}`;

const signup = async (req, res, next) => {
  try {
    const value = await validateRequest.body(req, signupSchema);
    req.body = value;

    next();
    return true;
  } catch (err) {
    const message = prepareMessage(err.details);

    AppLogger.log.warn({ err }, auth.SIGNUP_VALIDATOR);

    next(new Error(message));
    return false;
  }
};

const signin = async (req, res, next) => {
  try {
    const value = await validateRequest.body(req, signinSchema);
    req.body = value;

    next();
    return true;
  } catch (err) {
    const message = prepareMessage(err.details);

    AppLogger.log.warn({ err }, auth.SIGNIN_VALIDATOR);

    next(new Error(message));
    return false;
  }
};

module.exports = { signup, signin };
