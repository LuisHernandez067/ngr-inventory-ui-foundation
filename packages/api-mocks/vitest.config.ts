import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// Configuración Vitest para packages/api-mocks
// Usa entorno node porque MSW server-side no necesita DOM
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  })
);
