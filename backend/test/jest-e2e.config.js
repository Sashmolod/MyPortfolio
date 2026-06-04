module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  moduleNameMapper: {
    "^@admin/(.*)$": "<rootDir>/src/admin/$1",
    "^@portfolio/(.*)$": "<rootDir>/src/portfolio/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1",
  },
  testRegex: 'e2e\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};