const expect = require('chai').expect;
const sinon = require('sinon');
const chai = require('chai');

const app = require('../../src/app');
const bcrypt = require('bcryptjs');

const AppLogger = require('../../src/config/logger');
const conn = require('../../src/config/db');
const { userRole } = require('../../src/config/constants');
const db = require('../../src/models');

const User = db.user;
const Role = db.role;

describe('auth controller', () => {
  describe('POST /auth/signup ', () => {
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

    it('should return 201 and create user', async () => {
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

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('username');
      expect(res.body).to.have.property('email');
      expect(res.body).to.have.property('password');
      expect(res.body).to.have.property('roles');
      expect(res.body.roles).to.be.instanceOf(Array);

      bcrypt.hashSync.restore();
      Role.find.restore();
    });

    it("should return 201 and create user with role 'user' when passed user without any role", async () => {
      const payload = {
        username: 'Test',
        email: 'alex@example.com',
        password: 'foobar',
      };

      const mockUserRole = { _id: '5f5cf59366a9308b53374036' };

      const RoleStub = sinon.stub(Role, 'findOne').resolves(mockUserRole);

      const bcryptStub = sinon.stub(bcrypt, 'hashSync').callsFake((arg) => arg);

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('username');
      expect(res.body).to.have.property('email');
      expect(res.body).to.have.property('password');
      expect(res.body).to.have.property('roles');
      expect(res.body.roles.length).to.be.equal(1);
      expect(res.body.roles[0]).to.be.equal(mockUserRole._id);
      expect(res.body.roles).to.be.instanceOf(Array);

      bcrypt.hashSync.restore();
      Role.findOne.restore();
    });

    it('should return 400 when no user data passed', async () => {
      signupStub.callsFake((req, res, next) => {
        res.status(400).send();
      });

      const app = require('../../src/app');

      const res = await chai.request(app).post(apiURL).send();

      expect(res.statusCode).to.be.equal(400);
    });

    it('should return 500 when database fails', async () => {
      const payload = {
        username: 'Test1a',
        email: 'alex@example.com',
        password: 'foobara',
        roles: ['admin'],
      };

      signupStub.callsFake((req, res, next) => {
        next();
      });

      const findRoleStub = sinon
        .stub(Role, 'find')
        .throws(new Error('Database fails'));

      const app = require('../../src/app');

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(res.status).to.be.equal(500);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.equal('Database fails');

      Role.find.restore();
    });
  });

  describe('POST /auth/signin', () => {
    const apiURL = '/auth/signin';

    // let app;

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

    it('should return 500 when database fails', async () => {
      const findOneUserStub = sinon
        .stub(User, 'findOne')
        .throws(new Error('Database fails'));

      const res = await chai.request(app).post(apiURL).send();

      expect(res.status).to.be.equal(500);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.equal('Database fails');

      User.findOne.restore();
    });
  });
});
