const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Caminho base para a aplicação Next.js
  dir: './',
});

// Configurações customizadas do Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Mapeamento do alias '@/...' para 'src/...'
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
  ],
};

module.exports = createJestConfig(customJestConfig);
