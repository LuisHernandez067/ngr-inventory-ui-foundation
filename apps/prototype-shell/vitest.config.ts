import { defineConfig, mergeConfig } from 'vitest/config';

import baseConfig from '../../vitest.config';

import { getViteAliases, getScssOptions } from './config/vite-aliases';

// Configuración Vitest para apps/prototype-shell
export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: getViteAliases(__dirname),
    },
    css: {
      preprocessorOptions: getScssOptions(__dirname),
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  })
);
