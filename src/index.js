#!/usr/bin/env node

const { validateArgs } = require('./validations/args-validation');
const { validateConfig } = require('./validations/config-validation');

const { readFile } = require('./services/fs-service');
const { addMissingTmpDir, addMissingTmpFiles } = require('./services/tmp-service');
const { enrichCommands } = require('./services/config-service');
const { performChecks } = require('./services/check-service');
const { performCommands } = require('./services/command-service');
const { watchBlockFile, blockContainers, unblockContainers } = require('./services/block-service');
const { logMsg, logNewline } = require('./services/log-service');

const defaultConfig = require('./default-config');

const run = () => {
  /* Throws error if args or config are not valid */
  validateArgs(process.argv);

  const configPath = process.argv[2];
  validateConfig(configPath);

  const config = { ...defaultConfig, ...JSON.parse(readFile(configPath)) };
  const { masterPackage, packageNameKey, projectRoot } = config;
  const currentPackage = process.env[packageNameKey];

  if (masterPackage && currentPackage !== masterPackage) {
    watchBlockFile(projectRoot);
    return;
  }

  addMissingTmpDir(projectRoot);
  masterPackage && blockContainers(projectRoot);

  const { commands } = config;
  const enrichedCommands = enrichCommands(projectRoot, commands);

  addMissingTmpFiles(projectRoot, enrichedCommands);
  logNewline();

  const commandsToPerform = performChecks(enrichedCommands);
  if (commandsToPerform.length === 0) {
    logMsg('Everything is up to date!');
    masterPackage && unblockContainers(projectRoot);
    return;
  }

  performCommands(commandsToPerform);

  masterPackage && unblockContainers(projectRoot);
};

/* Run program */
run();
