const { expect } = require('chai');
const sinon = require('sinon');
const Joi = require('joi');
const httpMocks = require('node-mocks-http');

const { validateRequest } = require('../../src/middlewares');

const bodySchema = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
});

describe('middleware validateRequest()', () => {
  let next;

  beforeEach(() => {
    next = sinon.stub().returns(true);
  });

  it('should return a middleware validator function', () => {
    const validator = validateRequest.validateBody({}, '');

    expect(validator).to.be.instanceOf(Function);
  });

  it('should middleware validator return true and call next if request body is valid ', async () => {
    const bodyMock = {
      name: 'James',
      email: 'james@example.net',
    };
    const req = httpMocks.createRequest({ body: bodyMock });
    const res = httpMocks.createResponse();

    const validator = validateRequest.validateBody(bodySchema);

    const result = await validator(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
    expect(result).to.be.equal(true);
  });

  it('should middleware validator return false and call next with an error if request body is invalid ', async () => {
    const bodyMock = {
      username: 'James',
    };
    const req = httpMocks.createRequest({ body: bodyMock });
    const res = httpMocks.createResponse();

    const validator = validateRequest.validateBody(bodySchema);

    const result = await validator(req, res, next);

    expect(next.calledOnce).to.be.equal(true);
    expect(next.args[0][0]).to.be.instanceOf(Error);
    expect(next.args[0][0].message).to.be.contains('name');
    expect(next.args[0][0].message).to.be.contains('email');
    expect(result).to.be.equal(false);
  });
});
