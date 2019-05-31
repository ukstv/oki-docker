const { buildTmpFilePath } = require('./tmp-service');
const { isFile, isDir, exists } = require('./fs-service');

const __buildCheckMeta = (fullPath) => {
  const srcExists = exists(fullPath);
  const srcIsFile = srcExists && isFile(fullPath);
  const srcIsDir = srcExists && isDir(fullPath);

  return {
    exists: srcExists,
    isFile: srcIsFile,
    isDir: srcIsDir,
  };
};

const __enrichCheck = (projectRoot, check) => {
  const fullPath = `${projectRoot}/${check.path}`;
  const meta = { ...__buildCheckMeta(fullPath), ...check.meta };
  const tmpPath = meta.isDir ? null : buildTmpFilePath(projectRoot, check.path);

  return {
    ...check,
    fullPath,
    tmpPath,
    meta,
  };
};

const __buildCheckForPackageJson = (projectRoot, checkPackageJson) => {
  if (!checkPackageJson) {
    return [];
  }

  return [
    __enrichCheck(projectRoot, {
      path: 'package.json',
      trigger: 'diff',
      meta: {
        isFile: true,
      },
    }),
  ];
};

const __buildCheckForNodeModules = (projectRoot, checkNodeModules) => {
  if (!checkNodeModules) {
    return [];
  }

  return [
    __enrichCheck(projectRoot, {
      path: 'node_modules',
      trigger: 'empty',
      meta: {
        isDir: true,
      },
    }),
  ];
};

const __buildChecksFromPackages = (projectRoot, packages) => {
  if (!packages) {
    return [];
  }

  return packages.reduce((memo, packagePath) => ([
    ...memo,
    __enrichCheck(projectRoot, {
      path: `${packagePath}/package.json`,
      trigger: 'diff',
    }),
  ]), []);
};

const __buildCustomChecks = (projectRoot, checks) => {
  if (!checks) {
    return [];
  }

  return checks.map(check => __enrichCheck(projectRoot, check));
};

const enrichCommands = (projectRoot, commands) => {
  return commands.map((commandItem) => {
    const {
      command, packages, checks,
      checkNodeModules, checkPackageJson,
    } = commandItem;

    return {
      command,
      checks: [
        ...__buildCheckForPackageJson(projectRoot, checkPackageJson),
        ...__buildCheckForNodeModules(projectRoot, checkNodeModules),
        ...__buildChecksFromPackages(projectRoot, packages),
        ...__buildCustomChecks(projectRoot, checks),
      ],
    }
  });
};

module.exports = {
  enrichCommands,
};
