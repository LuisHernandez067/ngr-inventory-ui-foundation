import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

// Configuración Vite para apps/react-demo
export default defineConfig({
  plugins: [react() as PluginOption],
  resolve: {
    alias: {
      '@tokens': resolve(__dirname, '../../packages/design-tokens/src'),
      '@theme': resolve(__dirname, '../../packages/bootstrap-theme/src'),
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
    port: 5174,
    open: true,
  },
});
