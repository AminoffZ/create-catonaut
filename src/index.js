#!/usr/bin/env node
const { program } = require('commander');
const fsExtra = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');
const { clone } = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs/promises');
const chalk = require('chalk');

// Emoji constants
const CHECK_MARK = '✅';
const CROSS_MARK = '❌';
const WARNING = '⚠️';

program
  .version('1.0.0')
  .description('A command-line tool for starting new catonaut apps.')
  .arguments('[appName]')
  .action(createProject);

program.parse(process.argv);

function cloneRepository(repositoryUrl, destinationPath) {
  console.log('Creating a new app...');

  return clone({
    fs,
    http,
    url: repositoryUrl,
    dir: destinationPath,
  })
    .then(() => {
      console.log(
        chalk.green(
          CHECK_MARK +
            ' Successfully created a new app: ' +
            path.basename(destinationPath)
        )
      );
    })
    .catch((error) => {
      console.error(
        chalk.red(CROSS_MARK + ' Error cloning repository: ' + error.message)
      );
      process.exit(1);
    });
}

function updatePackageName(destinationPath) {
  const packageJsonPath = path.join(destinationPath, 'package.json');

  return fsExtra
    .ensureDir(destinationPath)
    .then(() => fsExtra.readJson(packageJsonPath))
    .then((packageJson) => {
      packageJson.name = path.basename(destinationPath);
      return fsExtra.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    })
    .then(() => {
      console.log(
        chalk.green(
          CHECK_MARK +
            ' Updated package.json for ' +
            path.basename(destinationPath)
        )
      );
    })
    .catch((error) => {
      console.error(
        chalk.red(CROSS_MARK + ' Error updating package.json: ' + error.message)
      );
      process.exit(1);
    });
}

function createProject(appName) {
  if (!appName) {
    return inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter a name for your app:',
          validate: (input) => !!input.trim() || 'Please enter a valid name.',
        },
      ])
      .then(({ name }) => {
        appName = name.trim();

        if (!appName) {
          console.error(
            chalk.red(CROSS_MARK + ' App name cannot be empty. Exiting.')
          );
          process.exit(1);
        }
      });
  }

  const repositoryUrl = 'https://github.com/AminoffZ/catonaut.git';
  const destinationPath = path.join(process.cwd(), appName);
  return cloneRepository(repositoryUrl, destinationPath)
    .then(() => updatePackageName(destinationPath))
    .then(() => {
      console.log(
        chalk.magenta(
          '🎉 Your new app is ready in ' + path.basename(destinationPath)
        )
      );
    })
    .catch((error) => {
      console.error(chalk.red(WARNING + ' ' + error.message));
      process.exit(1);
    });
}
