const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/projects/state-components/tsconfig.spec.json',
    },
  },
};
