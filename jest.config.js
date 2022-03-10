const tsConfig = require('./tsconfig.base.json');

const currentPaths = Object.entries(tsConfig.compilerOptions.paths);

const moduleNameMapper = {};

for (const [key, value] of currentPaths) {
  moduleNameMapper[key] = `<rootDir>/${value}`;
}

module.exports = {
  moduleNameMapper,
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/out*',
    '<rootDir>/memebox-streamdeck',
    '<rootDir>/cypress'
  ],
  rootDir: __dirname,
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
