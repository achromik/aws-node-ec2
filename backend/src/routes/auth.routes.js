const express = require('express');

const { verifySignUp, validateRequest } = require('../middlewares');
const controller = require('../controllers/auth.controller');
const { authSchema } = require('../schemas');
const { auth } = require('../config/constants');

module.exports = (app, prefix = '', path = '/auth') => {
  const router = express.Router();

  router.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept',
    );
    next();
  });

  router.post(
    '/signup',
    [
      validateRequest.validateBody(
        authSchema.signupSchema,
        auth.SIGNUP_VALIDATOR,
      ),
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRoleExisted,
    ],
    controller.signUp,
  );

  router.post(
    '/signin',
    [
      validateRequest.validateBody(
        authSchema.signinSchema,
        auth.SIGNIN_VALIDATOR,
      ),
    ],
    controller.signIn,
  );

  app.use(prefix + path, router);
};
