const webpack = require('webpack');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: ['./src/index.js'],
  output: {
    filename: 'index.js'
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
};
