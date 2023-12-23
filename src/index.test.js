// index.test.js ngl chatgpt wrote this i'm not that good with test code
const { expect } = require('chai');
const { beforeEach, describe, it } = require('mocha');
const sinon = require('sinon');
const { createProject } = require('./index.js');

describe('createProject function', () => {
  let consoleLogSpy;
  let inquirerPromptStub;

  beforeEach(() => {
    consoleLogSpy = sinon.spy(console, 'log');
    inquirerPromptStub = sinon.stub().resolves({ name: 'testApp' });
  });

  afterEach(() => {
    consoleLogSpy.restore();
    sinon.restore(); // Restore all stubs after each test
  });

  it('should throw an error if no app name is provided', async () => {
    await expect(createProject()).to.be.rejectedWith(
      'App name cannot be empty'
    );
  });

  it('should create a new app when provided with a valid app name', async () => {
    const appName = 'testApp';

    // Mock the cloneRepository and updatePackageName functions
    const cloneRepositoryStub = sinon.stub().resolves();
    const updatePackageNameStub = sinon.stub().resolves();

    // Stub the import statements
    sinon
      .stub(import('inquirer'), 'then')
      .resolves({ prompt: inquirerPromptStub });
    sinon
      .stub(import('fs-extra'), 'then')
      .resolves({ ensureDir: sinon.stub().resolves() });

    await createProject.call(
      {
        cloneRepository: cloneRepositoryStub,
        updatePackageName: updatePackageNameStub,
      },
      appName
    );

    expect(
      consoleLogSpy.calledWith(
        '\x1b[35m\u0021 Your new app is ready in',
        appName,
        '\x1b[0m'
      )
    ).to.be.true;
  });

  it('should handle errors during project creation', async () => {
    const appName = 'testApp';

    // Mock the cloneRepository function to simulate an error
    const cloneRepositoryStub = sinon
      .stub()
      .rejects(new Error('Mocked clone error'));

    // Stub the import statements
    sinon
      .stub(import('inquirer'), 'then')
      .resolves({ prompt: inquirerPromptStub });
    sinon.stub(import('fs-extra'), 'then').resolves({});

    await expect(
      createProject.call({ cloneRepository: cloneRepositoryStub }, appName)
    ).to.be.rejectedWith('Mocked clone error');
  });
});
