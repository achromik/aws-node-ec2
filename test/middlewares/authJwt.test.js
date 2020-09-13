const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');

const responseWithError = require('../../src/util/responseWithError');
const { authJwt } = require('../../src/middlewares');
const { userRole, middleware, common } = require('../../src/config/constants');
const authConfig = require('../../src/config/auth.config');

const db = require('../../src/models');
const e = require('express');
const User = db.user;
const Role = db.role;

const userPayload = {
  username: 'Logan Palmer',
  email: 'zef@lobzihiz.rs',
};
const userId = '5f5e5d1283f636ac2b6eeb32';

const mockUser = {
  ...userPayload,
  _id: '5f5e5d1283f636ac2b6eeb32',
  roles: ['5f5e5d7241f8dd517537c1fb'],
};

const mockUserRoles = [
  {
    _id: '5f5e5d7241f8dd517537c1fb',
    name: 'user',
  },
];

const mockAdminRoles = [
  {
    _id: '5f5e5d7241f8dd517537c1fb',
    name: 'user',
  },
  {
    _id: '5f5e5d6d120a8bdf0aadda5e',
    name: 'admin',
  },
];

const mockModeratorRoles = [
  {
    _id: '5f5e5d7241f8dd517537c1fb',
    name: 'moderator',
  },
  {
    _id: '5f5e5d6d120a8bdf0aadda5e',
    name: 'admin',
  },
];

describe('authJwt', () => {
  describe('verifyToke()', () => {
    it('should response 403 when no token provided', () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = authJwt.verifyToken(req, res, next);

      expect(res.statusCode).to.be.equal(403);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res._getData().error.message).to.be.equal(
        middleware.authJwt.NO_TOKEN_PROVIDED
      );
    });

    it('should response 401 when token is invalid', () => {
      authConfig.secret = 'top_secret';

      const invalidToken = jwt.sign({ id: userId }, 'invalid_secret', {
        expiresIn: 86400,
      });

      const req = httpMocks.createRequest({
        headers: {
          'x-access-token': invalidToken,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.stub().callsFake(() => true);

      authJwt.verifyToken(req, res, next);

      expect(next.calledOnce).to.be.equal(false);
      expect(req.userId).to.be.equal(undefined);
    });

    it('should call next() and put userId to request object when token is valid', () => {
      authConfig.secret = 'top_secret';

      const invalidToken = jwt.sign({ id: userId }, authConfig.secret, {
        expiresIn: 86400,
      });

      const req = httpMocks.createRequest({
        headers: {
          'x-access-token': invalidToken,
        },
      });
      const res = httpMocks.createResponse();
      const next = sinon.stub().callsFake(() => true);

      authJwt.verifyToken(req, res, next);

      expect(next.calledOnce).to.be.equal(true);
      expect(req.userId).to.be.equal(userId);
    });
  });

  describe('hasRole()', () => {
    afterEach(() => {
      Role.find.restore();
      User.findById.restore();
    });

    it('should response with 500 when database fails', async () => {
      const findByIdUserStub = sinon
        .stub(User, 'findById')
        .returns({ roles: [userRole.ADMIN] });

      const findRoleStub = sinon
        .stub(Role, 'find')
        .throws(new Error('Database error'));

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.hasRole(userRole.ADMIN)(req, res, next);

      expect(result).to.be.equal(false);
      expect(res.statusCode).to.be.equal(500);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res._getData().error.message).to.be.equal('Database error');
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.calledOnce).to.be.equal(true);
    });

    it('should response with 503 when user does not have admin role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockUserRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.hasRole(userRole.ADMIN)(req, res, next);

      expect(result).to.be.equal(false);
      expect(res.statusCode).to.be.equal(403);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res._getData().error.message).to.be.equal(
        `${common.REQUIRED_ROLE}: ${userRole.ADMIN}`
      );
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });

    it('should return true and call next() when user have admin role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockAdminRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.hasRole(userRole.ADMIN)(req, res, next);

      expect(resSpy.notCalled).to.be.equal(true);
      expect(next.calledOnce).to.be.equal(true);
      expect(result).to.be.equal(true);
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });
  });

  describe('isAdmin()', () => {
    afterEach(() => {
      Role.find.restore();
      User.findById.restore();
    });

    it('should response with 503 when user does not have admin role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockUserRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.isAdmin(req, res, next);

      expect(result).to.be.equal(false);
      expect(res.statusCode).to.be.equal(403);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res._getData().error.message).to.be.equal(
        `${common.REQUIRED_ROLE}: ${userRole.ADMIN}`
      );
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });

    it('should return true and call next() when user have admin role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockAdminRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.isAdmin(req, res, next);

      expect(resSpy.notCalled).to.be.equal(true);
      expect(next.calledOnce).to.be.equal(true);
      expect(result).to.be.equal(true);
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });
  });

  describe('isModerator()', () => {
    afterEach(() => {
      Role.find.restore();
      User.findById.restore();
    });

    it('should response with 503 when user does not have moderator role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockUserRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.hasRole(userRole.MODERATOR)(req, res, next);

      expect(result).to.be.equal(false);
      expect(res.statusCode).to.be.equal(403);
      expect(resSpy.calledOnce).to.be.equal(true);
      expect(next.notCalled).to.be.equal(true);
      expect(res._getData().error.message).to.be.equal(
        `${common.REQUIRED_ROLE}: ${userRole.MODERATOR}`
      );
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });

    it('should return true and call next() when user have moderator role', async () => {
      const findByIdUserStub = sinon.stub(User, 'findById').returns(mockUser);

      const findRoleStub = sinon.stub(Role, 'find').returns(mockModeratorRoles);

      const req = httpMocks.createRequest({ userId });
      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');
      const next = sinon.stub().callsFake(() => true);

      const result = await authJwt.isModerator(req, res, next);

      expect(resSpy.notCalled).to.be.equal(true);
      expect(next.calledOnce).to.be.equal(true);
      expect(result).to.be.equal(true);
      expect(findByIdUserStub.calledOnce).to.be.equal(true);
      expect(findByIdUserStub.args[0][0]).to.be.equal(userId);
      expect(findRoleStub.calledOnce).to.be.equal(true);
      expect(findRoleStub.args[0][0]).to.be.deep.equal({
        _id: { $in: mockUser.roles },
      });
    });
  });
});
