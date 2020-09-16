const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const httpMocks = require('node-mocks-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('sinon-mongoose');
// require('sinon-as-promised');

const conn = require('../../src/config/db');
const db = require('../../src/models');
const controller = require('../../src/controllers/auth.controller');

const Role = db.role;
const User = db.user;

const mockUser = {
  username: 'Arthur Griffith',
  email: 'zef@lobzihiz.rs',
};

const mockUserRoles = ['admin', 'user'];

const mockRoles = [
  {
    _id: '5f5e5d7241f8dd517537c1fb',
    name: 'user',
  },
  {
    _id: '5f5e5d6d120a8bdf0aadda5e',
    name: 'admin',
  },
];

describe('auth controller', () => {
  before(async () => {
    await conn.connectDB();
  });

  after(async () => {
    await conn.close();
  });

  describe('signUp()', () => {
    let next;

    beforeEach(() => {
      sinon.stub(bcrypt, 'hashSync').callsFake(arg => arg);
      next = sinon.stub().callsFake(() => true);
    });

    afterEach(() => {
      bcrypt.hashSync.restore();
    });

    it('should create user with multi roles', async () => {
      const payload = {
        ...mockUser,
        password: 'pa$$w0rd',
        roles: mockUserRoles,
      };

      sinon.stub(Role, 'find').resolves(mockRoles);

      const req = httpMocks.createRequest({ body: payload });
      const res = httpMocks.createResponse();

      await controller.signUp(req, res, next);

      expect(res.statusCode).to.be.equal(201);
      expect(res._getData()).to.have.property('_id');
      expect(res._getData()).to.have.property('username');
      expect(res._getData()).to.have.property('email');
      expect(res._getData()).to.have.property('password');
      expect(res._getData()).to.have.property('roles');
      expect(res._getData().roles).to.be.instanceOf(Array);
      expect(res._getData().roles.length).to.be.equal(req.body.roles.length);
      expect(next.notCalled).to.be.equal(true);

      Role.find.restore();
    });

    it('should create user with one role', async () => {
      const payload = {
        ...mockUser,
        password: 'pa$$w0rd',
        roles: [mockUserRoles[0]],
      };

      sinon.stub(Role, 'find').resolves([mockRoles[1]]);

      const req = httpMocks.createRequest({ body: payload });
      const res = httpMocks.createResponse();

      await controller.signUp(req, res, next);

      expect(res.statusCode).to.be.equal(201);
      expect(res._getData()).to.have.property('_id');
      expect(res._getData()).to.have.property('username');
      expect(res._getData()).to.have.property('email');
      expect(res._getData()).to.have.property('password');
      expect(res._getData()).to.have.property('roles');
      expect(res._getData().roles).to.be.instanceOf(Array);
      expect(res._getData().roles.length).to.be.equal(req.body.roles.length);
      expect(next.notCalled).to.be.equal(true);

      Role.find.restore();
    });

    it('should create user with one user role when no payload roles passed', async () => {
      const payload = {
        ...mockUser,
        password: 'pa$$w0rd',
      };

      sinon.stub(Role, 'findOne').resolves(mockUserRoles[0]);

      const req = httpMocks.createRequest({ body: payload });
      const res = httpMocks.createResponse();

      await controller.signUp(req, res, next);

      expect(res.statusCode).to.be.equal(201);
      expect(res._getData()).to.have.property('_id');
      expect(res._getData()).to.have.property('username');
      expect(res._getData()).to.have.property('email');
      expect(res._getData()).to.have.property('password');
      expect(res._getData()).to.have.property('roles');
      expect(res._getData().roles).to.be.instanceOf(Array);
      expect(res._getData().roles.length).to.be.equal(1);
      expect(res._getData().roles[0]).to.be.equal(mockUserRoles[0]._id);
      expect(next.notCalled).to.be.equal(true);

      Role.findOne.restore();
    });

    it('should call next with error status 400 when user data is incomplete', async () => {
      const payload = {
        ...mockUser,
      };

      const req = httpMocks.createRequest({ body: payload });
      const res = httpMocks.createResponse();

      await controller.signUp(req, res, next);

      expect(next.calledOnce).to.be.equal(true);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0]).to.have.property('message');
      expect(next.args[0][0]).to.have.property('status');
      expect(next.args[0][0].message).to.be.equal('Missing user data');
      expect(next.args[0][0].status).to.be.equal(400);
    });

    it('should call next with error status 500 when database thrown an error', async () => {
      const payload = {
        ...mockUser,
        password: 'pa$$w0rd',
      };

      sinon.stub(Role, 'findOne').throws(new Error('Database fails'));

      const req = httpMocks.createRequest({ body: payload });
      const res = httpMocks.createResponse();

      await controller.signUp(req, res, next);

      expect(next.called).to.be.equal(true);

      expect(next.calledOnce).to.be.equal(true);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0]).to.have.property('message');
      expect(next.args[0][0]).to.have.property('status');
      expect(next.args[0][0].message).to.be.equal('Database fails');
      expect(next.args[0][0].status).to.be.equal(500);

      Role.findOne.restore();
    });
  });

  describe('signin()', () => {
    const mockUserFromDB = {
      _id: '5f5e5d1283f636ac2b6eeb32',
      ...mockUser,
      roles: mockRoles,
    };
    const mockBody = { username: 'Misty', password: 'pa$$w0rd' };

    let UserMock;
    let next;
    let bcryptStub;

    beforeEach(() => {
      UserMock = sinon.mock(User);
      bcryptStub = sinon.stub(bcrypt, 'compare').callsFake(() => true);
      next = sinon.stub().callsFake(() => true);
    });

    afterEach(() => {
      bcrypt.compare.restore();
      UserMock.restore();
    });

    it('should return 404 when passed user does not found', async () => {
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      UserMock.expects('findOne')
        .withArgs({ username: req.body.username })
        .chain('populate', 'roles', '-__v')
        .resolves();

      await controller.signIn(req, res, next);

      expect(res.statusCode).to.be.equal(404);
    });

    it('should return 401 when give password is invalid', async () => {
      const req = httpMocks.createRequest({
        body: mockBody,
      });
      const res = httpMocks.createResponse();

      bcryptStub.callsFake(() => false);

      UserMock.expects('findOne')
        .withArgs({ username: req.body.username })
        .chain('populate', 'roles', '-__v')
        .resolves(mockUserFromDB);

      await controller.signIn(req, res, next);

      expect(res.statusCode).to.be.equal(401);
    });

    it('should return 500 when database fails', async () => {
      const req = httpMocks.createRequest({ body: mockBody });
      const res = httpMocks.createResponse();

      UserMock.expects('findOne')
        .withArgs({ username: req.body.username })
        .chain('populate', 'roles', '-__v')
        .rejects(new Error('Database fails'));

      await controller.signIn(req, res, next);

      expect(next.calledOnce).to.be.equal(true);
      expect(next.args[0][0]).to.be.instanceOf(Error);
      expect(next.args[0][0]).to.have.property('message');
      expect(next.args[0][0]).to.have.property('status');
      expect(next.args[0][0].message).to.be.equal('Database fails');
      expect(next.args[0][0].status).to.be.equal(500);
    });

    it('should return user data with accessToken when given username and password are valid', async () => {
      const req = httpMocks.createRequest({ body: mockBody });
      const res = httpMocks.createResponse();

      UserMock.expects('findOne')
        .withArgs({ username: req.body.username })
        .chain('populate', 'roles', '-__v')
        .resolves(mockUserFromDB);

      sinon.stub(jwt, 'sign').callsFake((...args) => {
        expect(args[0].id).to.be.equal(mockUserFromDB._id);

        return 'access_token';
      });

      await controller.signIn(req, res, next);

      const resBody = res._getData();

      expect(res.statusCode).to.be.equal(200);
      expect(resBody).to.have.property('id');
      expect(resBody).to.have.property('username');
      expect(resBody).to.have.property('email');
      expect(resBody).to.have.property('accessToken');
      expect(resBody).to.have.property('roles');
      expect(resBody.roles.every(role => role.includes('ROLE_'))).to.be.equal(
        true
      );

      jwt.sign.restore();
    });
  });
});
