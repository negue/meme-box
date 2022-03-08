module.exports = {
  displayName: 'server',
  preset: '../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/server/tsconfig.serve.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/projects/server'
};
