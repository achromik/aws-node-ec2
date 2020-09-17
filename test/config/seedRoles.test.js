const { expect } = require('chai');
const sinon = require('sinon');
require('mongoose');
require('sinon-mongoose');

const seedRoles = require('../../src/config/seedRoles');
const db = require('../../src/models');
const AppLogger = require('../../src/config/logger');

const Role = db.role;

describe('seedRole()', () => {
  const userRole = ['foo', 'bar', 'baz'];

  let mockRoleEstimatedDocumentCount;
  let mockRoleSave;

  beforeEach(() => {
    mockRoleEstimatedDocumentCount = sinon
      .mock(Role)
      .expects('estimatedDocumentCount');

    mockRoleSave = sinon.stub(Role.prototype, 'save');
  });

  afterEach(() => {
    Role.estimatedDocumentCount.restore();
    Role.prototype.save.restore();
  });

  it('should seedRoles into DB when roles are not stored in DB (count=0)', async () => {
    mockRoleEstimatedDocumentCount.withArgs({}).resolves(0);

    mockRoleSave.resolves();

    await seedRoles(userRole);

    expect(mockRoleEstimatedDocumentCount.calledOnce).to.be.equal(true);
    expect(mockRoleSave.callCount).to.be.equal(userRole.length);
  });

  it('should not seed roles into DB when roles already are stored in DB', async () => {
    mockRoleEstimatedDocumentCount.withArgs({}).resolves(3);

    mockRoleSave.resolves();

    await seedRoles(userRole);

    expect(mockRoleEstimatedDocumentCount.calledOnce).to.be.equal(true);
    expect(mockRoleSave.callCount).to.be.equal(0);
  });

  it('should log an error when saving into database fail', async () => {
    const error = new Error('Database fails');
    mockRoleEstimatedDocumentCount.withArgs({}).resolves(0);
    mockRoleSave.throws(error);

    const logSpy = sinon.spy(AppLogger.log, 'error').withArgs({ err: error });

    await seedRoles(userRole);

    expect(mockRoleEstimatedDocumentCount.calledOnce).to.be.equal(true);
    expect(mockRoleSave.callCount).to.be.equal(3);
    expect(logSpy.callCount).to.be.equal(3);
  });
});
