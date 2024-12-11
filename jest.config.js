import tsJest from 'ts-jest';
import tsconfig from './tsconfig.json' with { type: 'json' };

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: tsJest.pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/src' }),
};