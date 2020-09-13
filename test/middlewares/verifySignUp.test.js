const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

const { verifySignUp } = require('../../src/middlewares');
const { common, userRole } = require('../../src/config/constants');

describe('middleware verifySignUp', () => {
  describe('checkRoleExisted()', () => {
    it("should call next when no user's roles was passed", () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'Foo Bar',
          roles: [],
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

    it("should call next when valid user's roles was passed", () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'Foo Bar',
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

    it('should response when invalid user role was passed', () => {
      const req = httpMocks.createRequest({
        body: {
          username: 'Foo Bar',
          roles: ['foobaz', 'bar'],
        },
      });

      const res = httpMocks.createResponse();
      const resSpy = sinon.spy(res, 'send');

      const next = sinon.stub().callsFake(() => true);

      const result = verifySignUp.checkRoleExisted(req, res, next);

      expect(result).to.be.equal(null);
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
