const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const httpMocks = require('node-mocks-http');

const conn = require('../../src/config/db');
const db = require('../../src/models');
const controller = require('../../src/controllers/auth.controller');

const Role = db.role;

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
      sinon.stub(bcrypt, 'hashSync').callsFake((arg) => arg);
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

  xdescribe('signin()', () => {
    //   const apiURL = '/auth/signin';
    //   // let app;
    //   before((done) => {
    //     conn
    //       .connectDB()
    //       .then(() => done())
    //       .catch((err) => done(err));
    //   });
    //   after((done) => {
    //     conn
    //       .close()
    //       .then(() => done())
    //       .catch((err) => done(err));
    //   });
    //   xit('should response with 401 when passed invalid password', async () => {
    //     const mockDbUser = {
    //       __id: '5f5e5d1283f636ac2b6eeb32',
    //       username: 'Logan Palmer',
    //       email: 'zef@lobzihiz.rs',
    //       password: 'invalispassword',
    //       roles: [
    //         {
    //           _id: '5f5e5d7241f8dd517537c1fb',
    //           name: 'user',
    //         },
    //         {
    //           _id: '5f5e5d6d120a8bdf0aadda5e',
    //           name: 'admin',
    //         },
    //       ],
    //     };
    //     const findOneUserStub = sinon.stub(User, 'findOne').returns(mockDbUser);
    //     const result = await User.findOne.restore();
    //   });
    //   xit('should return 500 when database fails', async () => {
    //     const findOneUserStub = sinon
    //       .stub(User, 'findOne')
    //       .throws(new Error('Database fails'));
    //     const res = await chai.request(app).post(apiURL).send();
    //     expect(res.status).to.be.equal(500);
    //     expect(res.body).to.have.property('error');
    //     expect(res.body.error).to.have.property('statusCode');
    //     expect(res.body.error).to.have.property('message');
    //     expect(res.body.error.message).to.be.equal('Database fails');
    //     User.findOne.restore();
    //   });
  });
});
