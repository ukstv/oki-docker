#!/usr/bin/env node

const { validateArgs } = require('./validations/args-validation');
const { validateConfig } = require('./validations/config-validation');

const { readFile } = require('./services/fs-service');
const { addMissingTmpDir, addMissingTmpFiles } = require('./services/tmp-service');
const { enrichCommands } = require('./services/config-service');
const { performChecks } = require('./services/check-service');
const { performCommands } = require('./services/command-service');
const defaultConfig = require('./default-config');

/* Throws error if args or config are not valid */
validateArgs(process.argv);

const configPath = process.argv[2];
validateConfig(configPath);

const config = { ...defaultConfig, ...JSON.parse(readFile(configPath)) };
const { masterPackage, packageNameKey } = config;
const currentPackage = process.env[packageNameKey];

if (masterPackage && currentPackage !== masterPackage) {
  console.log('Yarn is blocked, waiting for unlock');
  process.exit(0);
} else {
  const { projectRoot, commands } = config;
  const enrichedCommands = enrichCommands(projectRoot, commands);

  addMissingTmpDir(projectRoot);
  addMissingTmpFiles(projectRoot, enrichedCommands);
  console.log();

  const commandsToPerform = performChecks(enrichedCommands);
  if (commandsToPerform.length === 0) {
    console.log('Everything is up to date! Passing control to container');
    process.exit(0);
  }

  performCommands(commandsToPerform);
}
