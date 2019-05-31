const logNewline = () => console.log();
const logStdout = (msg) => console.log(msg);
const logMsg = (msg) => console.log(`[Oki] ${msg}`);
const logObj = (msg) => console.log('[Oki]', msg);

module.exports = {
  logNewline,
  logStdout,
  logMsg,
  logObj,
};
