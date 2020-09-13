const Joi = require('joi');

const { userRole } = require('../config/constants');

const signupSchema = Joi.object({
  username: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.array()
    .min(1)
    .max(3)
    .unique()
    .items(Joi.string().valid(...Object.values(userRole))),
});

module.exports = { signupSchema };
