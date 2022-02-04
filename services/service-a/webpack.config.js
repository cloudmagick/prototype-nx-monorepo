const config = require('../../webpack.base.config');

module.exports = {
  ...config,
  entry: './src/entrypoint.ts',
  output: {
    ...config.output,
    filename: 'entrypoint.js',
  },
};
