const { expect } = require('chai');
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const { responseWithError } = require('../../src/util/responseWithError');

describe('responseWithError', () => {
  it('should return response function', () => {
    const message = 'test message';
    const status = 500;

    const result = responseWithError(status, message);

    expect(result).to.be.instanceOf(Function);
  });

  it('should return response function with passed arguments', () => {
    const message = 'test message';
    const status = 500;

    const res = httpMocks.createResponse();
    const resSpy = sinon.spy(res, 'send');

    responseWithError(status, message)(res);

    expect(res.statusCode).to.be.equal(500);
    expect(resSpy.calledOnce).to.be.equal(true);
    expect(res._getData()).to.have.property('error');
    expect(res._getData().error).to.have.property('statusCode');
    expect(res._getData().error).to.have.property('message');
    expect(res._getData().error.statusCode).to.be.equal(500);
    expect(res._getData().error.message).to.be.equal('test message');
  });
});
