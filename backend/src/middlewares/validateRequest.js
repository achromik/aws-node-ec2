const AppLogger = require('../config/logger');
const { common } = require('../config/constants');

const { validateRequest } = require('../util/validateRequest');
const validationErrorDetailsToString = require('../util/validationErrorDetailsToString');

exports.validateBody = (schema, validatorMessage = '') => async (
  req,
  res,
  next,
) => {
  try {
    const value = await validateRequest(req.body, schema);
    req.body = value;

    next();
    return true;
  } catch (err) {
    const message = `${
      common.VALIDATION_ERROR
    }: ${validationErrorDetailsToString(err.details)}`;

    AppLogger.log.warn({ err }, validatorMessage);

    const error = new Error(message);
    error.statusCode = 400;

    next(error);
    return false;
  }
};
