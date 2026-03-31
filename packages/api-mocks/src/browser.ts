import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Configuración del Service Worker de MSW para entornos de navegador
// Inicializa el worker con todos los handlers registrados
export const worker = setupWorker(...handlers);

/**
 * Inicia el Service Worker de MSW en el navegador.
 * Debe llamarse solo en modo desarrollo antes de montar la app.
 */
export async function startWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'warn',
  });
}
