import { defineConfig } from 'vite';
import { getViteAliases, getScssOptions } from './config/vite-aliases';

// Configuración Vite para apps/prototype-shell
export default defineConfig({
  resolve: {
    alias: getViteAliases(__dirname),
  },
  css: {
    preprocessorOptions: getScssOptions(__dirname),
  },
  server: {
    port: 5173,
    open: true,
  },
});
