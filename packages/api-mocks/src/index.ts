// Punto de entrada del paquete api-mocks
// Re-exporta todos los entrypoints para facilitar el uso en apps y tests

export { handlers } from './handlers';
export { worker, startWorker } from './browser';

// Utilidades de escenarios para testing y Storybook
export { resolveScenario } from './scenarios/error-scenarios';
export { withLatency } from './scenarios/latency-scenarios';

// Fixtures — útiles para tests unitarios que necesitan datos de referencia
export { productoFixtures } from './fixtures/productos.fixtures';
export { categoriaFixtures } from './fixtures/categorias.fixtures';
export { proveedorFixtures } from './fixtures/proveedores.fixtures';
export { almacenFixtures } from './fixtures/almacenes.fixtures';
export { ubicacionFixtures } from './fixtures/ubicaciones.fixtures';
export { movimientoFixtures } from './fixtures/movimientos.fixtures';
export { stockItemFixtures, stockConsolidadoFixtures } from './fixtures/stock.fixtures';
export { kardexFixtures } from './fixtures/kardex.fixtures';
export { conteoFixtures } from './fixtures/conteos.fixtures';
export { usuarioFixtures } from './fixtures/usuarios.fixtures';
export { rolFixtures } from './fixtures/roles.fixtures';
export { reporteDefinicionFixtures } from './fixtures/reportes.fixtures';
