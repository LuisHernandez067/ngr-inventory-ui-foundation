import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// Configuración Vitest para packages/ui-core
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
      setupFiles: ['src/test-setup.ts'],
    },
  })
);
