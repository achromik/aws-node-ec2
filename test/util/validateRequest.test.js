const { expect } = require('chai');
const httpMocks = require('node-mocks-http');
const Joi = require('joi');

const validateRequest = require('../../src/util/validateRequest');

const schema = Joi.object({
  text: Joi.string().min(3).required(),
  number: Joi.number().required(),
});

describe('validateRequest', () => {
  it('should return validate request body payload', async () => {
    const payload = {
      text: 'vpG29wOa7J',
      number: 326878381,
    };

    const req = httpMocks.createRequest({ body: payload });

    const value = await validateRequest.body(req, schema);

    expect(value).to.be.deep.equal(payload);
  });

  it('should return validate request body payload with omitted unknown props ', async () => {
    const payload = {
      text: 'vpG29wOa7J',
      number: 326878381,
      unknownProp: 'xbVekkbIGFddlpG',
    };

    const req = httpMocks.createRequest({ body: payload });

    const value = await validateRequest.body(req, schema);

    expect(value).to.have.property('text');
    expect(value.text).to.be.equal(payload.text);
    expect(value).to.have.property('number');
    expect(value.number).to.be.equal(payload.number);
    expect(value).to.not.have.property('unknownProp');
  });

  it('should throw an error when request body payload validation fails', async () => {
    const payload = {
      text: 'ab',
      number: '326878381a',
      unknownProp: 'foo_bar_baz',
    };

    const req = httpMocks.createRequest({ body: payload });

    try {
      await validateRequest.body(req, schema);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.contain('number');
      expect(error.message).to.contain('text');
      expect(error.message).to.not.contain('unknownProp');
    }
  });
});
