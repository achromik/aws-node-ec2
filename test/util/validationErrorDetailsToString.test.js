const { expect } = require('chai');
const validationErrorDetailsToString = require('../../src/util/validationErrorDetailsToString');

describe('validationErrorDetailsToString()', () => {
  details = [
    {
      message: '"a" must be a string',
      path: ['a'],
      type: 'string.base',
      context: { value: 1, key: 'a', label: 'a' },
    },
    {
      message: '"b" must be a number',
      path: ['b'],
      type: 'number.base',
      context: { key: 'b', label: 'b' },
    },
  ];

  it('should change double quotes to single quote in result string', () => {
    const result = validationErrorDetailsToString(details);

    expect(result).to.not.contain('"');
    expect(result).to.contain("'a'");
    expect(result).to.contain("'b'");
  });

  it('should return validation errors messages as string', () => {
    const result = validationErrorDetailsToString(details);

    expect(typeof result).to.be.equal('string');
  });

  it('should throw an error when the passed argument is not array', () => {
    try {
      const result = validationErrorDetailsToString('string');
    } catch (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.be.equal('Invalid argument. Should be an array');
    }
  });

  it('should throw an error when no argument passed', () => {
    try {
      const result = validationErrorDetailsToString();
    } catch (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.be.equal('Missing argument');
    }
  });
});
