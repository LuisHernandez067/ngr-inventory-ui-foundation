// Punto de entrada del paquete api-mocks
// Re-exporta todos los entrypoints para facilitar el uso en apps y tests

export { handlers } from './handlers';
export { worker, startWorker } from './browser';
export { server } from './server';
