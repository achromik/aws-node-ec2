const { expect } = require('chai');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { authValidator } = require('../../src/validators');
const { userRole } = require('../../src/config/constants');

describe('auth request validators', () => {
  let next;
  let res;

  beforeEach(() => {
    res = httpMocks.createResponse();
    next = sinon.stub().callsFake(() => true);
  });

  describe('singup', () => {
    it('should return true and call next when request body payload is valid', async () => {
      const validPayload = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
        roles: ['admin'],
      };

      const req = httpMocks.createRequest({ body: validPayload });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(true);
    });

    it('should return true and call next when request body payload is missing roles', async () => {
      const validPayload = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
      };

      const req = httpMocks.createRequest({ body: validPayload });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(true);
    });

    it('should return true, remove additional fields and call next when request body payload has additional fields', async () => {
      const payloadWithAdditionalFiled = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
        roles: ['admin'],
        additional: 'additional',
      };

      const req = httpMocks.createRequest({
        body: payloadWithAdditionalFiled,
      });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(true);
      expect(req.body).to.be.deep.equal({
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
        roles: ['admin'],
      });
    });

    it('should return false and call next with an error when request body payload has unsupported role', async () => {
      const payloadWithUnsupportedRole = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
        roles: ['unsupported_role'],
      };

      const req = httpMocks.createRequest({ body: payloadWithUnsupportedRole });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain(
        Object.values(userRole).join(', ')
      );
    });

    it('should return false and call next with an error when request body payload is missing username', async () => {
      const payloadWithoutUsername = {
        username: undefined,
        email: 'cedrick77@example.net',
        password: 'pa$$word',
        roles: ['admin'],
      };
      const req = httpMocks.createRequest({ body: payloadWithoutUsername });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('username');
    });

    it('should return false and call next with an error when request body payload is missing email', async () => {
      const payloadWithoutEmail = {
        username: 'Marlon',
        email: undefined,
        password: 'pa$$word',
        roles: ['admin'],
      };
      const req = httpMocks.createRequest({ body: payloadWithoutEmail });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('email');
    });

    it('should return false and call next with an error when request body payload is missing password', async () => {
      const payloadWithoutPassword = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: undefined,
        roles: ['admin'],
      };
      const req = httpMocks.createRequest({ body: payloadWithoutPassword });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('password');
    });

    it('should return false and call next with an error when request body payload has two missing fields', async () => {
      const payloadWithTwoMissingFields = {
        username: undefined,
        email: 'cedrick77@example.net',
        password: undefined,
        roles: ['admin'],
      };
      const req = httpMocks.createRequest({
        body: payloadWithTwoMissingFields,
      });

      const result = await authValidator.signup(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('username');
      expect(next.args[0][0].message).to.contain('password');
    });
  });

  describe('singip', () => {
    it('should return true and call next when request body payload is valid', async () => {
      const validPayload = {
        username: 'Marlon',
        password: 'pa$$word',
      };

      const req = httpMocks.createRequest({ body: validPayload });

      const result = await authValidator.signin(req, res, next);

      expect(result).to.be.equal(true);
    });

    it('should return true, remove additional fields and call next when request body payload has additional fields', async () => {
      const validPayload = {
        username: 'Marlon',
        email: 'cedrick77@example.net',
        password: 'pa$$word',
      };

      const req = httpMocks.createRequest({ body: validPayload });

      const result = await authValidator.signin(req, res, next);

      expect(result).to.be.equal(true);
      expect(req.body).to.be.deep.equal({
        username: 'Marlon',
        password: 'pa$$word',
      });
    });

    it('should return false and call next with an error when request body payload is missing username', async () => {
      const payloadWithoutUsername = {
        username: undefined,
        password: 'pa$$word',
      };
      const req = httpMocks.createRequest({ body: payloadWithoutUsername });

      const result = await authValidator.signin(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('username');
    });

    it('should return false and call next with an error when request body payload is missing password', async () => {
      const payloadWithoutPassword = {
        username: 'Marlon',
      };
      const req = httpMocks.createRequest({ body: payloadWithoutPassword });

      const result = await authValidator.signin(req, res, next);

      expect(result).to.be.equal(false);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0].message).to.contain('password');
    });
  });
});
