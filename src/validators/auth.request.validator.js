const AppLogger = require('../config/logger');
const { auth, common } = require('../config/constants');

const { signupSchema, signinSchema } = require('../schemas/auth.schema');
const validateRequest = require('../util/validateRequest');
const validationErrorDetailsToString = require('../util/validationErrorDetailsToString');

const prepareMessage = (details) =>
  `${common.VALIDATION_ERROR}: ${validationErrorDetailsToString(details)}`;

const signup = async (req, res, next) => {
  try {
    const value = await validateRequest.body(req, signupSchema);
    req.body = value;
    next();
  } catch (err) {
    const message = prepareMessage(err.details);

    AppLogger.log.warn({ err }, auth.SIGNUP_VALIDATOR);

    res.status(400).send({
      error: {
        statusCode: 400,
        message,
      },
    });
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
