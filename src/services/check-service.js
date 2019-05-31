const { filesAreEqual, dirIsEmpty } = require('./fs-service');

const __getCheckIsDirty = (check) => {
  const { trigger, fullPath, tmpPath, meta } = check;

  switch (trigger) {
    case 'diff': return meta.exists ? !filesAreEqual(fullPath, tmpPath) : true;
    case 'empty': return meta.exists ? dirIsEmpty(fullPath) : true;
    default: return false;
  }
};

const performChecks = (commands) => {
  return commands.reduce((memo, commandItem) => {
    const { checks, command } = commandItem;
    const performedChecks = checks.map(check => ({
      ...check,
      isDirty: __getCheckIsDirty(check),
    }));
    const dirtyChecks = performedChecks.filter(({ isDirty }) => isDirty);
    const checksAreClean = dirtyChecks.length === 0;

    if (checksAreClean) {
      return memo;
    }

    return [...memo, { command, dirtyChecks }];
  }, []);
};

module.exports = {
  performChecks,
};
