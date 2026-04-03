import { setupServer } from 'msw/node';

import { handlers } from './handlers';

// Configuración del servidor MSW para entornos Node.js (Vitest)
// Intercepta requests HTTP durante los tests unitarios
export const server = setupServer(...handlers);
