export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./dbnode/index.test.js'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
};