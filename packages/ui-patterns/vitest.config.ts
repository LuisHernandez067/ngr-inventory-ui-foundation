import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// Configuración Vitest para packages/ui-patterns
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  })
);
