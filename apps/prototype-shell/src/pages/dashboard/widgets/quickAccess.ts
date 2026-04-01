// Widget de acceso rápido — muestra botones de acceso directo a módulos permitidos.
// Filtra los atajos disponibles según los módulos habilitados para el perfil activo.
import { authService } from '../../../services/authService';

// ── Configuración curada de accesos rápidos ───────────────────────────────────

/** Definición de un atajo de acceso rápido */
interface QuickAccessItem {
  /** Clave que debe coincidir con los módulos permitidos del perfil */
  key: string;
  /** Etiqueta visible del botón */
  label: string;
  /** Clase Bootstrap Icons para el ícono */
  icon: string;
  /** Ruta hash de navegación */
  route: string;
}

/** Lista curada de accesos rápidos — solo se muestran los permitidos por el perfil */
const QUICK_ACCESS_CONFIG: QuickAccessItem[] = [
  { key: 'productos', label: 'Productos', icon: 'bi-box-seam', route: '#/productos' },
  { key: 'movimientos', label: 'Movimientos', icon: 'bi-arrow-left-right', route: '#/movimientos' },
  { key: 'stock', label: 'Stock', icon: 'bi-layers', route: '#/stock' },
  { key: 'categorias', label: 'Categorías', icon: 'bi-tag', route: '#/categorias' },
  { key: 'almacenes', label: 'Almacenes', icon: 'bi-building', route: '#/almacenes' },
  { key: 'ubicaciones', label: 'Ubicaciones', icon: 'bi-geo-alt', route: '#/ubicaciones' },
  { key: 'conteos', label: 'Conteos', icon: 'bi-clipboard-check', route: '#/conteos' },
  { key: 'reportes', label: 'Reportes', icon: 'bi-bar-chart-line', route: '#/reportes' },
  { key: 'kardex', label: 'Kardex', icon: 'bi-journal-text', route: '#/kardex' },
  { key: 'proveedores', label: 'Proveedores', icon: 'bi-truck', route: '#/proveedores' },
  { key: 'usuarios', label: 'Usuarios', icon: 'bi-people', route: '#/usuarios' },
  { key: 'roles', label: 'Roles', icon: 'bi-shield-check', route: '#/roles' },
  { key: 'auditoria', label: 'Auditoría', icon: 'bi-search', route: '#/auditoria' },
];

// ── Renderizado individual de botón de acceso rápido ─────────────────────────

/** Genera el HTML de un botón de acceso rápido */
function renderQuickAccessButton(item: QuickAccessItem): string {
  return `
    <a href="${item.route}" class="btn btn-outline-secondary d-flex flex-column align-items-center gap-1 p-3">
      <i class="bi ${item.icon} fs-4" aria-hidden="true"></i>
      <span class="small">${item.label}</span>
    </a>
  `.trim();
}

// ── Función exportada del widget ──────────────────────────────────────────────

/**
 * Renderiza el widget de acceso rápido dentro del contenedor dado.
 * Filtra los atajos según los módulos permitidos para el perfil activo.
 * Para el perfil admin (que tiene acceso 'all') se muestran todos los atajos.
 *
 * @param container - Elemento HTML donde se montará el widget
 */
export function renderQuickAccess(container: HTMLElement): void {
  const allowedModules = authService.getAllowedModules();

  // Filtrar atajos — 'all' significa que el admin tiene acceso a todo
  const visibleItems =
    allowedModules === 'all'
      ? QUICK_ACCESS_CONFIG
      : QUICK_ACCESS_CONFIG.filter((item) => allowedModules.includes(item.key));

  if (visibleItems.length === 0) {
    container.innerHTML = `<p class="text-muted text-center py-3">Sin accesos rápidos disponibles.</p>`;
    return;
  }

  const buttons = visibleItems.map(renderQuickAccessButton).join('');
  container.innerHTML = `
    <div class="d-flex flex-wrap gap-2">
      ${buttons}
    </div>
  `.trim();
}

// Exportamos la config para que los tests puedan verificar la lista curada
export { QUICK_ACCESS_CONFIG };
