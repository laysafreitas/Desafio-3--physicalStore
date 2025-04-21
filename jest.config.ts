
import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/testes'], 
  testMatch: ['**/*.spec.ts'], 
  moduleFileExtensions: ['js', 'json', 'ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
};

export default config;
