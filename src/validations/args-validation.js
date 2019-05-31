const validateArgs = (scriptArgs) => {
  if (scriptArgs.length !== 3) {
    throw new Error('Please, pass config: oki {config_file_path}');
  }
};

module.exports = { validateArgs };
