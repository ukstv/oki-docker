const { execSync } = require('child_process');
const { updateTmpFiles } = require('./tmp-service');

const __buildPerformReason = (dirtyCheck) => {
  const { trigger, fullPath } = dirtyCheck;

  switch (trigger) {
    case 'diff': return `- ${fullPath} was changed`;
    case 'empty': return `- ${fullPath} is empty or not exists`;
    default: return false;
  }
};

const __buildPerformReasons = (dirtyChecks) => {
  return dirtyChecks.map(__buildPerformReason).join('\n');
};

const performCommands = (commandsToPerform) => {
  commandsToPerform.forEach((commandItem) => {
    const { command, dirtyChecks } = commandItem;
    const performReason = __buildPerformReasons(dirtyChecks);

    console.log(`Running ${command}, because:\n${performReason}\n`);
    try {
      const commandOutput = execSync(command, { encoding: 'utf8' });
      console.log(commandOutput);
    } catch (error) {
      console.log(`Failed to run ${command}`);
      throw error;
    }

    updateTmpFiles(dirtyChecks);
    console.log();
  });
};

module.exports = {
  performCommands,
};
