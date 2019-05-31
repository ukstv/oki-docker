const fs = require('fs');
const { logMsg } = require('./log-service');
const { writeFile, deleteFile } = require('./fs-service');

const Messages = {
  Watch: 'Container is blocked (by master container), waiting for unblock',
  Unwatch: 'Container is unblocked, continue',
  Block: 'Block other containers',
  Unblock: 'Unblock other containers',
};

const __exists = stats => stats.isFile() && stats.birthtimeMs !== 0;
const __fileWasNotExisting = (curr, prev) => !__exists(curr) && !__exists(prev);
const __fileWasExisting = (curr, prev) => __exists(curr) && __exists(prev);
const __fileDeleted = (curr, prev) => !__exists(curr) && __exists(prev);
const __fileAdded = (curr, prev) => __exists(curr) && !__exists(prev);

const __buildBlockFile = projectRoot => `${projectRoot}/tmp/oki/.blocked`;

const __unwatchBlockFile = (path, msg) => {
  logMsg(msg);
  fs.unwatchFile(path);
  process.exit(0);
};

const watchBlockFile = (projectRoot) => {
  const blockFilePath = __buildBlockFile(projectRoot);

  let changeNum = -1;
  let autoUnwatchTimeout = null;
  const setAutoUnwatchTimer = () => {
    autoUnwatchTimeout = setTimeout(() => __unwatchBlockFile(blockFilePath, Messages.Unwatch), 10000);
  };
  const resetAutoUnwatchTimer = () => {
    clearTimeout(autoUnwatchTimeout);
  };

  logMsg(Messages.Watch);

  fs.watchFile(blockFilePath, { interval: 1000 }, (curr, prev) => {
    changeNum++;

    if (__fileWasExisting(curr, prev) || __fileAdded(curr, prev)) {
      resetAutoUnwatchTimer();
      return;
    }

    if (__fileDeleted(curr, prev)) {
      resetAutoUnwatchTimer();
      __unwatchBlockFile(blockFilePath, Messages.Unwatch);
      return;
    }

    const firstChange = changeNum === 0;
    if (firstChange && __fileWasNotExisting(curr, prev)) {
      setAutoUnwatchTimer();
      return;
    }

    logMsg('Something went wrong, try to restart docker-compose');
  });
};

const blockContainers = (projectRoot) => {
  const blockFilePath = __buildBlockFile(projectRoot);
  writeFile(blockFilePath);
  logMsg(Messages.Block);
};

const unblockContainers = (projectRoot) => {
  const blockFilePath = __buildBlockFile(projectRoot);
  deleteFile(blockFilePath);
  logMsg(Messages.Unblock);
};

module.exports = {
  watchBlockFile,
  blockContainers,
  unblockContainers,
};
