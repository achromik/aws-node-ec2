const express = require('express');

const { verifySignUp } = require('../middlewares');
const controller = require('../controllers/auth.controller');
const { authValidator } = require('../validators');

module.exports = (app, prefix = '', path = '/auth') => {
  const router = express.Router();

  router.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  router.post(
    '/signup',
    [
      authValidator.signup,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRoleExisted,
    ],
    controller.signUp
  );

  router.post('/signin', [authValidator.signin], controller.signIn);

  app.use(prefix + path, router);
};
