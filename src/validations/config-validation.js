const { readFile, isFile, exists } = require('../services/fs-service');

const configIsReadable = (configPath) => {
  try {
    readFile(configPath);
    return true;
  } catch (e) {
    return false;
  }
}

const configIsJson = (configPath) => {
  try {
    JSON.parse(readFile(configPath));
    return true;
  } catch (e) {
    return false;
  }
}

const validateConfig = (configPath) => {
  if (!exists(configPath)) {
    throw new Error(`Passed config does not exist: ${configPath}`);
  }

  if (!isFile(configPath)) {
    throw new Error(`Passed config is not a file: ${configPath}`);
  }

  if (!configIsReadable(configPath)) {
    throw new Error('Passed config is not readable');
  }

  if (!configIsJson(configPath)) {
    throw new Error('Passed config is not a valid JSON');
  }
};

module.exports = { validateConfig };
