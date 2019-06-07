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

const buildArgs = (args) => {
  const arg = args[0];
  const installedCheck = arg === '--installed';
  const configPath = !installedCheck && arg;

  return {
    installedCheck,
    configPath,
  };
}

const run = () => {
  /* Throws error if args or config are not valid */
  validateArgs(process.argv);

  const args = buildArgs(process.argv.slice(2));
  if (args.installedCheck) {
    console.log('true');
    process.exit(0);
  }

  validateConfig(args.configPath);

  const config = { ...defaultConfig, ...JSON.parse(readFile(args.configPath)) };
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
