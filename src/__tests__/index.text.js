import { cloneRepository, updatePackageName } from '../index';

describe('cloneRepository', () => {
  test('clones the repository', async () => {
    // mock implementation
    const mockClone = jest.fn();

    // import and mock git clone
    jest.mock('git-clone', () => ({
      clone: mockClone,
    }));

    const repoUrl = 'https://github.com/AminoffZ/catonaut.git';
    const destinationPath = '/tmp/new-app';

    await cloneRepository(repoUrl, destinationPath);

    expect(mockClone).toHaveBeenCalledWith(repoUrl, destinationPath, {
      recursive: true,
    });
  });
});

describe('updatePackageName', () => {
  test('updates the package name in package.json', () => {
    const originalPackageJson = {
      name: 'original-name',
    };

    const newPackageName = 'new-name';
    const packageJsonPath = '/tmp/new-app/package.json';

    // mock implementation
    const mockWriteFile = jest.fn();

    jest.mock('fs', () => ({
      promises: {
        readFile: jest.fn(() => JSON.stringify(originalPackageJson)),
        writeFile: mockWriteFile,
      },
    }));

    return updatePackageName(packageJsonPath, newPackageName).then(() => {
      expect(mockWriteFile).toHaveBeenCalledWith(
        packageJsonPath,
        JSON.stringify({
          ...originalPackageJson,
          name: newPackageName,
        })
      );
    });
  });
});
