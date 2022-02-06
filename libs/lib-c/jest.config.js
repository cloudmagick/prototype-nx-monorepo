/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'lib-c',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      compiler: 'ttypescript',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/lib-c',
  setupFiles: ['<rootDir>tests/config.ts'],
};
