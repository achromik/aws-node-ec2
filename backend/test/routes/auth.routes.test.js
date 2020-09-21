const { expect } = require('chai');
const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const conn = require('../../src/config/db');
const authRoutes = require('../../src/routes/auth.routes');
const controller = require('../../src/controllers/auth.controller');
const { verifySignUp, validateRequest } = require('../../src/middlewares');

let sandbox;

chai.use(chaiHttp);

describe('API auth routes', () => {
  describe('POST /auth/signup', () => {
    const apiURL = '/auth/signup';

    let checkRoleExistedStub;
    let checkDuplicateUsernameOrEmailStub;
    let signUpStub;

    const payload = {
      username: 'Foo Bar',
      email: 'iro@asd',
      password: 'foobar',
      roles: ['admin'],
    };

    const clearCachedModules = () => {
      delete require.cache[require.resolve('../../src/middlewares')];
      delete require.cache[require.resolve('../../src/app')];
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];
    };

    beforeEach(async () => {
      clearCachedModules();

      sandbox = sinon.createSandbox();

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

      signUpStub = sandbox
        .stub(controller, 'signUp')
        .callsFake((req, res, next) => {
          res.status(200).send({ text: 'test' });
        });
    });

    afterEach(async () => {
      verifySignUp.checkDuplicateUsernameOrEmail.restore();
      verifySignUp.checkRoleExisted.restore();
      validateRequest.validateBody.restore();

      controller.signUp.restore();

      sandbox.restore();
    });

    before(async () => {
      await conn.connectDB;
    });

    after(async () => {
      clearCachedModules();
      await conn.close();
    });

    it('should not call signup controller when payload validation fails', async () => {
      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          const error = new Error('Failed request payload validation');
          error.statusCode = 400;
          next(error);
        });

      // eslint-disable-next-line global-require
      const app = require('../../src/app');

      authRoutes(app);

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);
      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Failed request payload validation',
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

      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          next();
        });

      // eslint-disable-next-line global-require
      const app = require('../../src/app');

      authRoutes(app);

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Username or email already exists',
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

      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          next();
        });

      // eslint-disable-next-line global-require
      const app = require('../../src/app');

      authRoutes(app);

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.notCalled).to.be.equal(true);

      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.contain('Not supported user role');
    });

    it('should call signup controller when middleware functions all passed', async () => {
      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          next();
        });

      // eslint-disable-next-line global-require
      const app = require('../../src/app');

      authRoutes(app);
      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.calledOnce).to.be.equal(true);
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('text');
      expect(res.body.text).to.be.equal('test');
    });

    it('should call middlewares in specific order', async () => {
      const validateRequestBodyStub = sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          next();
        });

      // eslint-disable-next-line global-require
      const app = require('../../src/app');

      authRoutes(app);
      await chai.request(app).post(apiURL).send(payload);

      expect(signUpStub.calledOnce).to.be.equal(true);

      await sinon.assert.callOrder(
        validateRequestBodyStub,
        checkDuplicateUsernameOrEmailStub,
        checkRoleExistedStub,
      );
    });
  });

  describe('POST /auth/signin', () => {
    const apiURL = '/auth/signin';

    let app;
    let signInStub;

    const payload = {
      username: 'Foo Bar',
      email: 'iro@fo.tp',
      password: 'foobar',
      roles: ['admin'],
    };

    const clearCachedModules = () => {
      delete require.cache[
        require.resolve('../../src/controllers/auth.controller')
      ];
      delete require.cache[require.resolve('../../src/app')];
    };

    before(async () => {
      conn.connectDB();
    });

    beforeEach(async () => {
      clearCachedModules();

      sandbox = sinon.createSandbox();

      signInStub = sandbox
        .stub(controller, 'signIn')
        .callsFake((req, res, next) => {
          res.status(200).send({ text: 'test' });
        });
    });

    after(async () => {
      clearCachedModules();

      await conn.close();
    });

    afterEach(async () => {
      controller.signIn.restore();
      validateRequest.validateBody.restore();

      sandbox.restore();
    });

    it('should return 400 when payload validation fails', async () => {
      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          const error = new Error('Failed request payload validation');
          error.statusCode = 400;
          next(error);
        });

      // eslint-disable-next-line global-require
      app = require('../../src/app');

      authRoutes(app);

      const res = await chai.request(app).post(apiURL).send();

      expect(signInStub.notCalled).to.be.equal(true);
      expect(res.status).to.be.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('statusCode');
      expect(res.body.error).to.have.property('message');
      expect(res.body.error.message).to.be.contain(
        'Failed request payload validation',
      );
    });

    it('should call signin controller when middleware validation passed', async () => {
      sandbox
        .stub(validateRequest, 'validateBody')
        .callsFake(() => (req, res, next) => {
          next();
        });

      // eslint-disable-next-line global-require
      app = require('../../src/app');

      authRoutes(app);

      const res = await chai.request(app).post(apiURL).send(payload);

      expect(signInStub.calledOnce).to.be.equal(true);
      expect(res.status).to.be.equal(200);
      expect(res.body).to.have.property('text');
      expect(res.body.text).to.be.equal('test');
    });
  });
});
