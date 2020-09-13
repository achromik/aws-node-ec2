const auth = {
  SIGNUP_CONTROLLER: 'Signup Controller',
  SIGNUP_SUCCESS: 'User registration successful',
  SIGNUP_FAILURE: 'User registration failed',
  SIGNUP_VALIDATOR: 'Signup Validator',
};

const middleware = {
  verifySignUp: {
    VERIFY_SIGNUP_MIDDLEWARE: 'Verify Signup Middleware',
    CHECK_USER_OR_EMAIL: 'checkDuplicateUsernameOrEmail',
    USERNAME_EXISTS: 'Failed! Username is already in use',
    EMAIL_EXISTS: 'Failed! Email is already in use',
    NON_EXISTENT_ROLE: 'Failed! Non existent role',
  },
  authJwt: {
    AUTH_JWT_MIDDLEWARE: 'Auth JWT middleware',
    ADMIN_ROLE_REQUIRED: 'Require Admin Role',
    NO_TOKEN_PROVIDED: 'No Token provide',
    UNAUTHORIZED: 'Unauthorized',
  },
};

const common = {
  UNKNOWN_ERROR: 'Something went wrong',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Not Found',
  RESPONSE: 'Response',
  REQUEST: 'Request',
  REQUIRED_ROLE: 'Required Role',
};

const userRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

module.exports = { auth, middleware, common, userRole };
