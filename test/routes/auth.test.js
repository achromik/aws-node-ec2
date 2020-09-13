'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const conn = require('../../src/config/db');

chai.use(chaiHttp);

describe('API auth routes', () => {
  const apiURL = '/auth/signup';

  describe('POST /auth/signup', () => {
    let checkRoleExistedStub;
    let checkDuplicateUsernameOrEmailStub;
    let signupPayloadValidationStub;
    let verifySignUp;
    let authValidator;
    let sandbox;

    const payload = {
      username: 'Foo Bar',
      email: 'iro@fo.tp',
      password: 'foobar',
      roles: ['admin'],
    };

    verifySignUp = require('../../src/middlewares').verifySignUp;
    authValidator = require('../../src/validators').authValidator;

    beforeEach(async () => {
      delete require.cache[require.resolve('../../src/validators')];
      delete require.cache[require.resolve('../../src/middlewares')];
      delete require.cache[require.resolve('../../src/app')];

      sandbox = sinon.createSandbox();

      signupPayloadValidationStub = sandbox.stub(authValidator, 'signup');

      checkDuplicateUsernameOrEmailStub = sandbox.stub(
        verifySignUp,
        'checkDuplicateUsernameOrEmail'
      );

      checkRoleExistedStub = sandbox.stub(verifySignUp, 'checkRoleExisted');
    });

    afterEach((done) => {
      verifySignUp.checkDuplicateUsernameOrEmail.restore();
      verifySignUp.checkRoleExisted.restore();
      authValidator.signup.restore();

      sandbox.restore();
      done();
    });

    before((done) => {
      conn
        .connectDB()
        .then(() => done())
        .catch((err) => done(err));
    });

    after((done) => {
      delete require.cache[require.resolve('../../src/validators')];
      delete require.cache[require.resolve('../../src/middlewares')];
      delete require.cache[require.resolve('../../src/app')];

      conn
        .close()
        .then(() => done())
        .catch((err) => done(err));
    });

    it('should return 400 when user exists', async () => {
      checkDuplicateUsernameOrEmailStub.callsFake((req, res, next) => {
        res.status(400).send({
          error: {
            statusCode: 400,
            message: 'User exists',
          },
        });
      });

      authValidator.signup.callsFake((req, res, next) => {
        next();
      });

      const app = require('../../src/app');

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.contain('User exists');
    });

    it('should return 400 when payload validation fails', async () => {
      signupPayloadValidationStub.callsFake((req, res, next) => {
        res.status(400).send({
          error: {
            statusCode: 400,
            message: 'Failed request payload validation',
          },
        });
      });

      const app = require('../../src/app');

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Failed request payload validation'
      );
    });
  });
});
