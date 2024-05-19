/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: '@happy-dom/jest-environment',
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageReporters: ["json-summary"]
};
