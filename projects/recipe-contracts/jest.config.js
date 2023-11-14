const baseConfig = require('../../jest.config.js');

module.exports = {
  ...baseConfig,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/projects/recipe-contracts/tsconfig.spec.json'
    }
  }
};
