module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testMatch: ['**/*.test.ts'],
  verbose: true,
  testTimeout: 30000, // Aumentar para 30s para testes mais longos
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/index.ts',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage'
};