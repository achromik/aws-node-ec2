const expect = require('chai').expect;
const sinon = require('sinon');
const chai = require('chai');

const app = require('../../src/app');
const bcrypt = require('bcryptjs');

const AppLogger = require('../../src/config/logger');
const conn = require('../../src/config/db');

describe('POST /auth/signup controller', () => {
  const apiURL = '/auth/signup';
  let app;
  let checkRoleExistedStub;
  let checkDuplicateUsernameOrEmailStub;
  let signupStub;
  let verifySignUp;
  let authValidator;

  before((done) => {
    conn
      .connectDB()
      .then(() => done())
      .catch((err) => done(err));
  });

  after((done) => {
    conn
      .close()
      .then(() => done())
      .catch((err) => done(err));
  });

  beforeEach(() => {
    delete require.cache[require.resolve('../../src/app')];
    verifySignUp = require('../../src/middlewares').verifySignUp;
    authValidator = require('../../src/validators').authValidator;

    checkRoleExistedStub = sinon
      .stub(verifySignUp, 'checkRoleExisted')
      .callsFake((req, res, next) => {
        next();
      });

    checkDuplicateUsernameOrEmailStub = sinon
      .stub(verifySignUp, 'checkDuplicateUsernameOrEmail')
      .callsFake((req, res, next) => {
        next();
      });

    signupStub = sinon
      .stub(authValidator, 'signup')
      .callsFake((req, res, next) => {
        next();
      });

    app = require('../../src/app');
  });

  afterEach(() => {
    verifySignUp.checkDuplicateUsernameOrEmail.restore();
    verifySignUp.checkRoleExisted.restore();
    authValidator.signup.restore();
  });

  it('should return 200 and create user', (done) => {
    const Role = require('../../src/models').role;

    const payload = {
      username: 'Test',
      email: 'alex@example.com',
      password: 'foobar',
      roles: ['admin'],
    };

    const RoleStub = sinon
      .stub(Role, 'find')
      .resolves([{ _id: '5f5cf59366a9308b53374036' }]);

    const bcryptStub = sinon.stub(bcrypt, 'hashSync').callsFake((arg) => arg);

    chai
      .request(app)
      .post(apiURL)
      .send(payload)
      .end((err, res) => {
        if (err) done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('username');
        expect(res.body).to.have.property('email');
        expect(res.body).to.have.property('password');
        expect(res.body).to.have.property('roles');
        expect(res.body.roles).to.be.instanceOf(Array);

        done();
      });

    bcrypt.hashSync.restore();
    Role.find.restore();
  });

  it('should return 200 when passed user without roles', () => {});

  it('should return 400 when no user data passed', (done) => {
    signupStub.callsFake((req, res, next) => {
      res.status(400).send();
    });

    const app = require('../../src/app');

    chai
      .request(app)
      .post(apiURL)
      .send()
      .end((err, res) => {
        if (err) done(err);

        expect(res).to.have.status(400);

        done();
      });
  });
});
