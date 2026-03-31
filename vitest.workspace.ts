import { defineWorkspace } from 'vitest/config';

// Workspace Vitest — descubre las configuraciones de test de cada paquete
// Cada paquete extiende vitest.config.ts con su propio entorno y rutas
export default defineWorkspace([
  'packages/ui-core/vitest.config.ts',
  'packages/ui-patterns/vitest.config.ts',
  'packages/api-mocks/vitest.config.ts',
  'apps/prototype-shell/vitest.config.ts',
]);
