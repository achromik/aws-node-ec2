const Joi = require('joi');

const { userRole } = require('../config/constants');

const signupSchema = Joi.object({
  username: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.array()
    .unique()
    .items(Joi.string().valid(...Object.values(userRole))),
});

const signinSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = { signupSchema, signinSchema };
