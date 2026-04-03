import { defineConfig } from 'vite';

import { getViteAliases } from './config/vite-aliases';

// Configuración Vite para apps/prototype-shell
export default defineConfig({
  resolve: {
    alias: getViteAliases(__dirname),
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
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
