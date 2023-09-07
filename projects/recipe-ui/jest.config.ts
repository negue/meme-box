/* eslint-disable */
const baseConfig = require('../../jest.config.js');

export default {
  ...baseConfig,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/projects/recipe-ui/tsconfig.spec.json'
    }
  }
};
