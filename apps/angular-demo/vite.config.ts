import { resolve } from 'path';

import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, type PluginOption } from 'vite';

// Configuración Vite para apps/angular-demo
export default defineConfig({
  plugins: [angular() as PluginOption],
  resolve: {
    alias: {
      '@ngr-inventory/design-tokens': resolve(__dirname, '../../packages/design-tokens/src'),
      '@ngr-inventory/bootstrap-theme': resolve(__dirname, '../../packages/bootstrap-theme/src'),
      '@ngr-inventory/ui-core': resolve(__dirname, '../../packages/ui-core/src'),
      '@ngr-inventory/ui-patterns': resolve(__dirname, '../../packages/ui-patterns/src'),
      '@ngr-inventory/api-contracts': resolve(__dirname, '../../packages/api-contracts/src'),
      '@ngr-inventory/api-mocks': resolve(__dirname, '../../packages/api-mocks/src'),
    },
  },
  optimizeDeps: {
    exclude: ['msw/node'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
        quietDeps: true,
        loadPaths: [resolve(__dirname, '../../node_modules')],
      },
    },
  },
  server: {
    port: 5175,
    open: true,
  },
});
