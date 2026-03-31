import { defineConfig } from 'vitest/config';

// Configuración base de Vitest — extendida por cada paquete vía mergeConfig
// La cobertura usa V8 (proveedor nativo, no requiere Istanbul)
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
