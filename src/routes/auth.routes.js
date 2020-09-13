const { verifySignUp, asyncRoute } = require('../middlewares');
const controller = require('../controllers/auth.controller');
const { authValidator } = require('../validators');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  app.post(
    '/auth/signup',
    [
      authValidator.signup,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRoleExisted,
    ],
    controller.signUp
  );

  app.post('/auth/signin', controller.signIn);
};
