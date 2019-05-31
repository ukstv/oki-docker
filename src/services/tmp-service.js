const { exists, mkdir, readFile, writeFile } = require('./fs-service');

const buildTmpFilePath = (projectRoot, path) => {
  const tmpFilename = path.replace(`${projectRoot}/`, '').replace(/\//g, '-');
  return `${projectRoot}/tmp/oki/${tmpFilename}.tmp`;
};

const addMissingTmpDir = (projectRoot) => {
  if (!exists(`${projectRoot}/tmp`)) {
    mkdir(`${projectRoot}/tmp`);
    console.log(`Created ${projectRoot}/tmp`);
  }

  if (!exists(`${projectRoot}/tmp/oki`)) {
    mkdir(`${projectRoot}/tmp/oki`);
    console.log(`Created ${projectRoot}/tmp/oki`);
  }
};

const addMissingTmpFiles = (projectRoot, commands) => {
  commands.forEach((commandItem) => {
    const { checks } = commandItem;

    checks.forEach(({ tmpPath, fullPath }) => {
      if (!tmpPath || exists(tmpPath)) {
        return;
      }

      writeFile(tmpPath, '');
      console.log(`Created ${tmpPath} as a dump of ${fullPath}`);
    });
  });
};

const updateTmpFiles = (dirtyChecks) => {
  dirtyChecks.forEach((dirtyCheck) => {
    const { fullPath, tmpPath, meta } = dirtyCheck;
    if (meta.isDir || !meta.exists) {
      return;
    }

    writeFile(tmpPath, readFile(fullPath));
    console.log(`Updated ${tmpPath} according with ${fullPath}`);
  });
};

module.exports = {
  buildTmpFilePath,
  addMissingTmpDir,
  addMissingTmpFiles,
  updateTmpFiles,
};
