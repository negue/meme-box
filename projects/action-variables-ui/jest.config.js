const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/projects/action-variables-ui/tsconfig.spec.json',
    },
  },
};
