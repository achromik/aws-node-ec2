const expect = require('chai').expect;
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const conn = require('../../src/config/db');
const controller = require('../../src/controllers/auth.controller');
const verifySignUp = require('../../src/middlewares').verifySignUp;
const authValidator = require('../../src/validators').authValidator;

let app;
let sandbox;

chai.use(chaiHttp);

describe('API auth routes', () => {
  describe('POST /auth/signup', () => {
    const apiURL = '/auth/signup';
    let checkRoleExistedStub;
    let checkDuplicateUsernameOrEmailStub;
    let signupPayloadValidationStub;
    let signUpStub;

    const payload = {
      username: 'Foo Bar',
      email: 'iro@fo.tp',
      password: 'foobar',
      roles: ['admin'],
    };

    beforeEach(async () => {
      delete require.cache[require.resolve('../../src/validators')];
      delete require.cache[require.resolve('../../src/middlewares')];
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];

      sandbox = sinon.createSandbox();

      signUpStub = sandbox
        .stub(controller, 'signUp')
        .callsFake((req, res, next) => {
          res.status(200).send({ text: 'test' });
        });

      signupPayloadValidationStub = sandbox
        .stub(authValidator, 'signup')
        .callsFake((req, res, next) => {
          next();
        });

      checkDuplicateUsernameOrEmailStub = sandbox
        .stub(verifySignUp, 'checkDuplicateUsernameOrEmail')
        .callsFake((req, res, next) => {
          next();
        });

      checkRoleExistedStub = sandbox
        .stub(verifySignUp, 'checkRoleExisted')
        .callsFake((req, res, next) => {
          next();
        });

      app = require('../../src/app');
    });

    afterEach(async () => {
      verifySignUp.checkDuplicateUsernameOrEmail.restore();
      verifySignUp.checkRoleExisted.restore();
      authValidator.signup.restore();

      controller.signUp.restore();

      sandbox.restore();
    });

    before(async () => {
      await conn.connectDB;
    });

    after(async () => {
      delete require.cache[require.resolve('../../src/validators')];
      delete require.cache[require.resolve('../../src/middlewares')];
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];

      await conn.close();
    });

    it('should not call signup controller when payload validation fails', async () => {
      signupPayloadValidationStub.callsFake((req, res, next) => {
        res.status(400).send({
          error: {
            statusCode: 400,
            message: 'Failed request payload validation',
          },
        });
        return;
      });

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Failed request payload validation'
      );
    });

    it('should not call controller when checkDuplicateUsernameOrEmail not passed', async () => {
      checkDuplicateUsernameOrEmailStub.callsFake((req, res, next) => {
        res.status(400).send({
          error: {
            statusCode: 400,
            message: 'Username or email already exists',
          },
        });
      });

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Username or email already exists'
      );
    });

    it('should not call controller when checkRoleExisted not passed', async () => {
      checkRoleExistedStub.callsFake((req, res, next) => {
        res.status(400).send({
          error: {
            statusCode: 400,
            message: 'Not supported user role',
          },
        });
      });

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.contain('Not supported user role');
    });

    it('should call signup controller when middleware functions all passed', async () => {
      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.calledOnce).to.be.equal(true);
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('text');
      expect(res.body.text).to.be.equal('test');
    });

    it('should call middlewares in specific order', async () => {
      const res = await chai.request(app).post(apiURL).send(payload);

      sinon.assert.callOrder(
        signupPayloadValidationStub,
        checkDuplicateUsernameOrEmailStub,
        checkRoleExistedStub
      );
    });
  });

  describe('POST /auth/signin', () => {
    const apiURL = '/auth/signin';
    let signInStub;

    const payload = {
      username: 'Foo Bar',
      email: 'iro@fo.tp',
      password: 'foobar',
      roles: ['admin'],
    };

    before((done) => {
      conn
        .connectDB()
        .then(() => done())
        .catch((err) => done(err));
    });

    beforeEach(async () => {
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];
      delete require.cache[require.resolve('../../src/app')];

      sandbox = sinon.createSandbox();

      signInStub = sandbox.stub(controller, 'signIn');

      app = require('../../src/app');
    });

    after((done) => {
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];

      conn
        .close()
        .then(() => done())
        .catch((err) => done(err));
    });

    afterEach((done) => {
      controller.signIn.restore();

      sandbox.restore();
      done();
    });

    xit('should return 400 when payload validation fails', async () => {
      const res = await chai.request(app).post(apiURL).send();

      expect(signInStub.notCalled).to.be.equal(true);
    });

    it('should call signin controller when middleware validation passed', async () => {
      signInStub.callsFake((req, res, next) => {
        res.status(200).send({ text: 'test' });
        return;
      });

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signInStub.calledOnce).to.be.equal(true);
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('text');
      expect(res.body.text).to.be.equal('test');
    });
  });
});
