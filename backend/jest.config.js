module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  moduleNameMapper: {
    "^@admin/(.*)$": "<rootDir>/admin/$1",
    "^@portfolio/(.*)$": "<rootDir>/portfolio/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
    "^@common/(.*)$": "<rootDir>/common/$1",
  },
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};