// Registro de rutas de la aplicación — conecta paths con módulos de página
// Todas las importaciones son lazy (dinámicas) para code splitting óptimo
import { Router } from './router';

/**
 * Registra todas las rutas de la aplicación en el router dado.
 * Usa lazy imports para que cada módulo de página se cargue solo cuando
 * el usuario navega a esa ruta — optimiza el bundle inicial.
 *
 * @param router - Instancia del Router donde se registran las rutas
 */
export function registerRoutes(router: Router): void {
  // ─── Rutas de autenticación (no protegidas) ───────────────────────────────

  router.register('/auth', {
    factory: () => import('../pages/auth/login').then((m) => m.loginPage),
    breadcrumb: 'Login',
    guarded: false,
  });

  // ─── Dashboard ────────────────────────────────────────────────────────────

  router.register('/dashboard', {
    factory: () => import('../pages/dashboard/dashboard').then((m) => m.dashboardPage),
    breadcrumb: 'Dashboard',
  });

  // ─── Páginas de error (no protegidas) ────────────────────────────────────

  router.register('/401', {
    factory: () => import('../pages/errors/page401').then((m) => m.page401),
    breadcrumb: 'No Autorizado',
    guarded: false,
  });

  router.register('/403', {
    factory: () => import('../pages/errors/page403').then((m) => m.page403),
    breadcrumb: 'Acceso Prohibido',
    guarded: false,
  });

  router.register('/404', {
    factory: () => import('../pages/errors/page404').then((m) => m.page404),
    breadcrumb: 'No Encontrado',
    guarded: false,
  });

  router.register('/500', {
    factory: () => import('../pages/errors/page500').then((m) => m.page500),
    breadcrumb: 'Error del Servidor',
    guarded: false,
  });

  // ─── Módulos de Inventario ────────────────────────────────────────────────

  router.register('/productos', {
    factory: () => import('../pages/modules/productos').then((m) => m.productosPage),
    breadcrumb: 'Productos',
  });

  router.register('/productos/:id', {
    factory: () => import('../pages/modules/productos-detail').then((m) => m.productosDetailPage),
    breadcrumb: 'Detalle de Producto',
  });

  router.register('/categorias', {
    factory: () => import('../pages/modules/categorias').then((m) => m.categoriasPage),
    breadcrumb: 'Categorías',
  });

  router.register('/proveedores', {
    factory: () => import('../pages/modules/proveedores').then((m) => m.proveedoresPage),
    breadcrumb: 'Proveedores',
  });

  router.register('/proveedores/:id', {
    factory: () =>
      import('../pages/modules/proveedores-detail').then((m) => m.proveedoresDetailPage),
    breadcrumb: 'Detalle de Proveedor',
  });

  router.register('/almacenes', {
    factory: () => import('../pages/modules/almacenes').then((m) => m.almacenesPage),
    breadcrumb: 'Almacenes',
  });

  router.register('/ubicaciones', {
    factory: () => import('../pages/modules/ubicaciones').then((m) => m.ubicacionesPage),
    breadcrumb: 'Ubicaciones',
  });

  // ─── Módulos de Movimientos ───────────────────────────────────────────────

  router.register('/movimientos', {
    factory: () => import('../pages/modules/movimientos').then((m) => m.movimientosPage),
    breadcrumb: 'Movimientos',
  });

  router.register('/stock', {
    factory: () => import('../pages/modules/stock').then((m) => m.stockPage),
    breadcrumb: 'Stock',
  });

  router.register('/kardex', {
    factory: () => import('../pages/modules/kardex').then((m) => m.kardexPage),
    breadcrumb: 'Kardex',
  });

  router.register('/conteos', {
    factory: () => import('../pages/modules/conteos').then((m) => m.conteosPage),
    breadcrumb: 'Conteos',
  });

  // ─── Módulos de Administración ────────────────────────────────────────────

  router.register('/usuarios', {
    factory: () => import('../pages/modules/usuarios').then((m) => m.usuariosPage),
    breadcrumb: 'Usuarios',
  });

  router.register('/roles', {
    factory: () => import('../pages/modules/roles').then((m) => m.rolesPage),
    breadcrumb: 'Roles y Permisos',
  });

  router.register('/reportes', {
    factory: () => import('../pages/modules/reportes').then((m) => m.reportesPage),
    breadcrumb: 'Reportes',
  });

  router.register('/auditoria', {
    factory: () => import('../pages/modules/auditoria').then((m) => m.auditoriaPage),
    breadcrumb: 'Auditoría',
  });
}
