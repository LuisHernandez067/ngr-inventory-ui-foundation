import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config';

// Configuración Vitest para packages/api-mocks
// Usa entorno node porque MSW server-side no necesita DOM
// setupFiles configura global.location para que MSW resuelva rutas relativas en Node
export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
      setupFiles: ['./src/vitest.setup.ts'],
    },
  })
);
