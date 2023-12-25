#!/usr/bin/env node
const { program } = require('commander');
const fsExtra = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const { clone } = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs/promises');

// Emoji constants
const CHECK_MARK = '✅';
const CROSS_MARK = '❌';
const WARNING = '⚠️';

// Color constants
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const MAGENTA = '\x1b[35m';
const RESET_COLOR = '\x1b[0m';

program
  .version('1.0.0')
  .arguments('[appName]')
  .description('Create a new catonaut app')
  .action(createProject);

program.parse(process.argv);

async function cloneRepository(repositoryUrl, destinationPath) {
  console.log('Creating a new app...');

  try {
    await clone({
      fs,
      http,
      url: repositoryUrl,
      dir: destinationPath,
    });

    console.log(
      `${GREEN}${CHECK_MARK} Successfully created a new app: ${path.basename(
        destinationPath
      )}${RESET_COLOR}`
    );
  } catch (error) {
    console.error(
      `${RED}${CROSS_MARK} Error cloning repository: ${error.message}${RESET_COLOR}`
    );
    process.exit(1);
  }
}

async function updatePackageName(destinationPath) {
  const packageJsonPath = path.join(destinationPath, 'package.json');

  try {
    await fsExtra.ensureDir(destinationPath); // Ensure the directory exists
    const packageJson = await fsExtra.readJson(packageJsonPath);
    packageJson.name = path.basename(destinationPath);
    await fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    console.log(
      `${GREEN}${CHECK_MARK} Updated package.json for ${path.basename(
        destinationPath
      )}${RESET_COLOR}`
    );
  } catch (error) {
    console.error(
      `${RED}${CROSS_MARK} Error updating package.json: ${error.message}${RESET_COLOR}`
    );
    process.exit(1);
  }
}

async function createProject(appName) {
  if (!appName) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for your app:',
        validate: (input) => !!input.trim() || 'Please enter a valid name.',
      },
    ]);

    appName = name.trim();

    if (!appName) {
      console.error(`${RED}${CROSS_MARK} App name cannot be empty. Exiting.${RESET_COLOR}`);
      process.exit(1);
    }
  }

  const repositoryUrl = 'https://github.com/AminoffZ/catonaut.git';
  const destinationPath = path.join(process.cwd(), appName);
  try {
    await cloneRepository(repositoryUrl, destinationPath);
    await updatePackageName(destinationPath);
    console.log(
      `${MAGENTA}🎉 Your new app is ready in ${path.basename(destinationPath)}${RESET_COLOR}`
    );
  } catch (error) {
    console.error(`${RED}${WARNING} ${error.message}${RESET_COLOR}`);
    process.exit(1);
  }
}
