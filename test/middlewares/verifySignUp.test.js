const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { verifySignUp } = require('../../src/middlewares');
const { common, userRole, middleware } = require('../../src/config/constants');

const db = require('../../src/models');

const User = db.user;
const Role = db.role;

const userPayload = {
  username: 'Logan Palmer',
  email: 'zef@lobzihiz.rs',
};

describe('middleware verifySignUp', () => {
  describe('checkDuplicateUsernameOrEmail()', () => {
    it('should response 500 when database fails', async () => {
      const findOneUserStub = sinon
        .stub(User, 'findOne')
        .throws(new Error('Database error'));

      const req = httpMocks.createRequest();

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = await verifySignUp.checkDuplicateUsernameOrEmail(
        req,
        res,
        next
      );
      // console.log(res._getData());

      expect(next.notCalled).to.be.equal(true);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(res.statusCode).to.be.equal(500);
      expect(res._getData()).to.have.property('error');
      expect(res._getData().error.message).to.contain('Database error');

      User.findOne.restore();
    });

    it('should response 400 when username exists', async () => {
      const req = httpMocks.createRequest({
        body: userPayload,
      });

      const findOneUserStub = sinon
        .stub(User, 'findOne')
        .withArgs({ username: userPayload.username })
        .returns(true)
        .withArgs({ email: userPayload.email })
        .returns(false);

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = await verifySignUp.checkDuplicateUsernameOrEmail(
        req,
        res,
        next
      );

      expect(next.notCalled).to.be.equal(true);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(res.statusCode).to.be.equal(400);
      expect(res._getData()).to.have.property('error');
      expect(res._getData().error.message).to.contain(
        middleware.verifySignUp.USERNAME_EXISTS
      );

      User.findOne.restore();
    });

    it('should response 400 when email exists', async () => {
      const req = httpMocks.createRequest({
        body: userPayload,
      });

      const findOneUserStub = sinon
        .stub(User, 'findOne')
        .withArgs({ username: userPayload.username })
        .returns(false)
        .withArgs({ email: userPayload.email })
        .returns(true);

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = await verifySignUp.checkDuplicateUsernameOrEmail(
        req,
        res,
        next
      );

      expect(next.notCalled).to.be.equal(true);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(res.statusCode).to.be.equal(400);
      expect(res._getData()).to.have.property('error');
      expect(res._getData().error.message).to.contain(
        middleware.verifySignUp.EMAIL_EXISTS
      );

      User.findOne.restore();
    });

    it('should call next() when username and email do not exists', async () => {
      const req = httpMocks.createRequest({
        body: userPayload,
      });

      const findOneUserStub = sinon
        .stub(User, 'findOne')
        .withArgs({ username: userPayload.username })
        .returns(false)
        .withArgs({ email: userPayload.email })
        .returns(false);

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = await verifySignUp.checkDuplicateUsernameOrEmail(
        req,
        res,
        next
      );

      expect(next.calledOnce).to.be.equal(true);
      expect(resSpy.notCalled).to.be.equal(true);

      User.findOne.restore();
    });
  });
  describe('checkRoleExisted()', () => {
    it("should call next when no user's roles was passed", () => {
      const req = httpMocks.createRequest({
        body: {
          ...userPayload,
          roles: [],
        },
      });

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      verifySignUp.checkRoleExisted(req, res, next);

      // expect(result).to.be.equal(true);
      expect(resSpy.notCalled).to.be.equal(true);
      expect(next.calledOnce).to.be.equal(true);
      expect(next.returnValues[0]).to.be.equal(true);

      res.send.restore();
    });

    it("should call next() when valid user's roles was passed", () => {
      const req = httpMocks.createRequest({
        body: {
          ...userPayload,
          roles: [userRole.ADMIN, userRole.MODERATOR],
        },
      });

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      verifySignUp.checkRoleExisted(req, res, next);

      expect(resSpy.notCalled).to.be.equal(true);
      expect(next.calledOnce).to.be.equal(true);
      expect(next.returnValues[0]).to.be.equal(true);

      res.send.restore();
    });

    it('should response and return true when invalid user role was passed', () => {
      const req = httpMocks.createRequest({
        body: {
          ...userPayload,
          roles: ['foobaz', 'bar'],
        },
      });

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = verifySignUp.checkRoleExisted(req, res, next);

      expect(result).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res.statusCode).to.be.equal(400);
      expect(res._getData()).to.have.property('error');
      expect(res._getData().error.message).to.contain(
        req.body.roles.join(', ')
      );
      expect(resSpy.calledOnce).to.be.equal(true);

      res.send.restore();
    });
  });
});
