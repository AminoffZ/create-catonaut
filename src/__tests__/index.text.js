const { cloneRepository, updatePackageName } = require('../index');

describe('cloneRepository', () => {
  test('clones the repository', async () => {
    // mock implementation
    const mockClone = jest.fn();

    // import and mock isomorphic-git clone
    jest.mock('isomorphic-git', () => ({
      clone: mockClone,
      http: {
        node: jest.fn(),
      },
      fs: jest.fn(),
    }));

    const repoUrl = 'https://github.com/AminoffZ/catonaut.git';
    const destinationPath = '/tmp/new-app';

    await cloneRepository(repoUrl, destinationPath);

    expect(mockClone).toHaveBeenCalledWith({
      fs: expect.any(Object),
      http: expect.any(Object),
      url: repoUrl,
      dir: destinationPath,
    });
  });
});

describe('updatePackageName', () => {
  test('updates the package name in package.json', async () => {
    const originalPackageJson = {
      name: 'original-name',
    };

    const packageJsonPath = '/tmp/new-app/package.json';

    // mock implementation
    const mockReadJson = jest.fn(() => originalPackageJson);
    const mockWriteJson = jest.fn();

    jest.mock('fs-extra', () => ({
      ensureDir: jest.fn(),
      readJson: mockReadJson,
      writeJson: mockWriteJson,
    }));

    await updatePackageName(packageJsonPath);

    expect(mockReadJson).toHaveBeenCalledWith(packageJsonPath);
    expect(mockWriteJson).toHaveBeenCalledWith(
      packageJsonPath,
      expect.objectContaining({ name: path.basename('/tmp/new-app') }),
      { spaces: 2 }
    );
  });
});
