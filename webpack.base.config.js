const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: false,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.join(__dirname, 'tsconfig.base.json'),
      }),
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  target: 'node',
  externals: ['aws-sdk'],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `swc-loader`
      // exclude *.spec.ts; integration tests are named *.it.js and won't be picked up by ts-loader
      {
        test: /(?!:spec)\.tsx?$/,
        loader: 'ts-loader',
        exclude: /\.d\.ts$/,
      },
    ],
  },
};
