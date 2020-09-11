const Joi = require('joi');

const signupSchema = Joi.object({
  username: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.string().valid('user', 'moderator', 'admin'),
});

module.exports = { signupSchema };
