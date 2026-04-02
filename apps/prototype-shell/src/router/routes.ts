// Registro de rutas de la aplicación — conecta paths con módulos de página
// Todas las importaciones son lazy (dinámicas) para code splitting óptimo
import type { Router } from './router';

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

  router.register('/auth/forgot-password', {
    factory: () => import('../pages/auth/forgot-password').then((m) => m.forgotPasswordPage),
    breadcrumb: 'Recuperar Contraseña',
    guarded: false,
  });

  router.register('/auth/reset-password', {
    factory: () => import('../pages/auth/reset-password').then((m) => m.resetPasswordPage),
    breadcrumb: 'Nueva Contraseña',
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

  router.register('/productos/nuevo', {
    factory: () => import('../pages/modules/productos-form').then((m) => m.productosFormCreatePage),
    breadcrumb: 'Nuevo Producto',
  });

  router.register('/productos/:id/editar', {
    factory: () => import('../pages/modules/productos-form').then((m) => m.productosFormEditPage),
    breadcrumb: 'Editar Producto',
  });

  router.register('/productos/:id', {
    factory: () => import('../pages/modules/productos-detail').then((m) => m.productosDetailPage),
    breadcrumb: 'Detalle de Producto',
  });

  router.register('/categorias', {
    factory: () => import('../pages/modules/categorias').then((m) => m.categoriasPage),
    breadcrumb: 'Categorías',
  });

  router.register('/categorias/nuevo', {
    factory: () =>
      import('../pages/modules/categorias-form').then((m) => m.categoriasFormCreatePage),
    breadcrumb: 'Nueva Categoría',
  });

  router.register('/categorias/:id/editar', {
    factory: () => import('../pages/modules/categorias-form').then((m) => m.categoriasFormEditPage),
    breadcrumb: 'Editar Categoría',
  });

  router.register('/categorias/:id', {
    factory: () => import('../pages/modules/categorias-detail').then((m) => m.categoriasDetailPage),
    breadcrumb: 'Detalle de Categoría',
  });

  router.register('/proveedores', {
    factory: () => import('../pages/modules/proveedores').then((m) => m.proveedoresPage),
    breadcrumb: 'Proveedores',
  });

  router.register('/proveedores/nuevo', {
    factory: () =>
      import('../pages/modules/proveedores-form').then((m) => m.proveedoresFormCreatePage),
    breadcrumb: 'Nuevo Proveedor',
  });

  router.register('/proveedores/:id/editar', {
    factory: () =>
      import('../pages/modules/proveedores-form').then((m) => m.proveedoresFormEditPage),
    breadcrumb: 'Editar Proveedor',
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

  router.register('/almacenes/nuevo', {
    factory: () => import('../pages/modules/almacenes-form').then((m) => m.almacenesFormCreatePage),
    breadcrumb: 'Nuevo Almacén',
  });

  router.register('/almacenes/:id/editar', {
    factory: () => import('../pages/modules/almacenes-form').then((m) => m.almacenesFormEditPage),
    breadcrumb: 'Editar Almacén',
  });

  router.register('/almacenes/:id', {
    factory: () => import('../pages/modules/almacenes-detail').then((m) => m.almacenesDetailPage),
    breadcrumb: 'Detalle de Almacén',
  });

  router.register('/ubicaciones', {
    factory: () => import('../pages/modules/ubicaciones').then((m) => m.ubicacionesPage),
    breadcrumb: 'Ubicaciones',
  });

  router.register('/ubicaciones/nuevo', {
    factory: () =>
      import('../pages/modules/ubicaciones-form').then((m) => m.ubicacionesFormCreatePage),
    breadcrumb: 'Nueva Ubicación',
  });

  router.register('/ubicaciones/:id/editar', {
    factory: () =>
      import('../pages/modules/ubicaciones-form').then((m) => m.ubicacionesFormEditPage),
    breadcrumb: 'Editar Ubicación',
  });

  router.register('/ubicaciones/:id', {
    factory: () =>
      import('../pages/modules/ubicaciones-detail').then((m) => m.ubicacionesDetailPage),
    breadcrumb: 'Detalle de Ubicación',
  });

  // ─── Módulos de Movimientos ───────────────────────────────────────────────

  router.register('/movimientos', {
    factory: () => import('../pages/modules/movimientos').then((m) => m.movimientosPage),
    breadcrumb: 'Movimientos',
  });

  // Ruta estática /movimientos/nuevo debe registrarse ANTES de /movimientos/:id
  // para que el router la resuelva correctamente y no la trate como un id
  router.register('/movimientos/nuevo', {
    factory: () => import('../pages/modules/movimientos-form').then((m) => m.movimientosFormPage),
    breadcrumb: 'Nuevo Movimiento',
  });

  // Ruta /movimientos/:id/editar debe registrarse ANTES de /movimientos/:id
  // para que el router la resuelva correctamente con el segmento /editar
  router.register('/movimientos/:id/editar', {
    factory: () => import('../pages/modules/movimientos-form').then((m) => m.movimientosFormPage),
    breadcrumb: 'Editar Movimiento',
  });

  router.register('/movimientos/:id', {
    factory: () =>
      import('../pages/modules/movimientos-detail').then((m) => m.movimientosDetailPage),
    breadcrumb: 'Detalle de Movimiento',
  });

  router.register('/stock', {
    factory: () => import('../pages/modules/stock').then((m) => m.stockPage),
    breadcrumb: 'Stock',
  });

  router.register('/stock/consolidado', {
    factory: () => import('../pages/modules/stock-consolidado').then((m) => m.stockConsolidadoPage),
    breadcrumb: 'Stock Consolidado',
  });

  router.register('/kardex', {
    factory: () => import('../pages/modules/kardex').then((m) => m.kardexPage),
    breadcrumb: 'Kardex',
  });

  // ─── Módulos de Conteos ───────────────────────────────────────────────────

  // Ruta estática /conteos/nuevo debe registrarse ANTES de /conteos/:id
  // para que el router la resuelva correctamente y no la trate como un id
  router.register('/conteos/nuevo', {
    factory: () => import('../pages/modules/conteos-nuevo').then((m) => m.conteosNuevoPage),
    breadcrumb: 'Nuevo Conteo',
  });

  // Rutas /conteos/:id/carga y /conteos/:id/cierre deben registrarse ANTES de /conteos/:id
  // para que el router las resuelva con el segmento extra correctamente
  router.register('/conteos/:id/carga', {
    factory: () => import('../pages/modules/conteos-carga').then((m) => m.conteosCargaPage),
    breadcrumb: 'Cargar Cantidades',
  });

  router.register('/conteos/:id/cierre', {
    factory: () => import('../pages/modules/conteos-cierre').then((m) => m.conteosCierrePage),
    breadcrumb: 'Cierre de Conteo',
  });

  router.register('/conteos/:id', {
    factory: () => import('../pages/modules/conteos-detail').then((m) => m.conteosDetailPage),
    breadcrumb: 'Detalle de Conteo',
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
