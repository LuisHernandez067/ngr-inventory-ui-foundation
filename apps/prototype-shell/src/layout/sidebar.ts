// Módulo de la barra lateral de navegación — soporta desktop fijo y mobile offcanvas

/** Grupos de navegación disponibles en el sidebar */
export type NavGroup = 'top' | 'inventario' | 'movimientos' | 'administracion';

/** Elemento de navegación del sidebar */
export interface NavItem {
  /** Identificador único del módulo */
  id: string;
  /** Etiqueta visible en el menú */
  label: string;
  /** Clase de Bootstrap Icons */
  icon: string;
  /** Hash de la ruta, e.g. '#/productos' */
  hash: string;
  /** Grupo al que pertenece el ítem */
  group: NavGroup;
}

/** Lista completa de ítems de navegación de los 16 módulos NGR Inventory */
export const NAV_ITEMS: NavItem[] = [
  // Nivel superior
  { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', hash: '#/', group: 'top' },

  // Grupo Inventario
  {
    id: 'productos',
    label: 'Productos',
    icon: 'bi-box-seam',
    hash: '#/productos',
    group: 'inventario',
  },
  {
    id: 'categorias',
    label: 'Categorías',
    icon: 'bi-tag',
    hash: '#/categorias',
    group: 'inventario',
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: 'bi-truck',
    hash: '#/proveedores',
    group: 'inventario',
  },
  {
    id: 'almacenes',
    label: 'Almacenes',
    icon: 'bi-building',
    hash: '#/almacenes',
    group: 'inventario',
  },
  {
    id: 'ubicaciones',
    label: 'Ubicaciones',
    icon: 'bi-geo-alt',
    hash: '#/ubicaciones',
    group: 'inventario',
  },

  // Grupo Movimientos
  {
    id: 'movimientos',
    label: 'Movimientos',
    icon: 'bi-arrow-left-right',
    hash: '#/movimientos',
    group: 'movimientos',
  },
  { id: 'stock', label: 'Stock', icon: 'bi-layers', hash: '#/stock', group: 'movimientos' },
  {
    id: 'kardex',
    label: 'Kardex',
    icon: 'bi-journal-text',
    hash: '#/kardex',
    group: 'movimientos',
  },
  {
    id: 'conteos',
    label: 'Conteos',
    icon: 'bi-clipboard-check',
    hash: '#/conteos',
    group: 'movimientos',
  },

  // Grupo Administración
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: 'bi-people',
    hash: '#/usuarios',
    group: 'administracion',
  },
  {
    id: 'roles',
    label: 'Roles y Permisos',
    icon: 'bi-shield-check',
    hash: '#/roles',
    group: 'administracion',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'bi-bar-chart',
    hash: '#/reportes',
    group: 'administracion',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    icon: 'bi-clock-history',
    hash: '#/auditoria',
    group: 'administracion',
  },

  // Auth — separado
  { id: 'auth', label: 'Login', icon: 'bi-box-arrow-in-right', hash: '#/auth', group: 'top' },
];

/** Etiquetas legibles para cada grupo de navegación */
const GROUP_LABELS: Record<NavGroup, string> = {
  top: '',
  inventario: 'Inventario',
  movimientos: 'Movimientos',
  administracion: 'Administración',
};

/**
 * Renderiza un ítem de navegación individual.
 */
function renderNavItem(item: NavItem): string {
  return `
    <li class="nav-item">
      <a class="nav-link" href="${item.hash}" data-hash="${item.hash}">
        <i class="bi ${item.icon}"></i> ${item.label}
      </a>
    </li>
  `;
}

/**
 * Renderiza la lista de ítems de un grupo.
 */
function renderGroup(group: NavGroup): string {
  const items = NAV_ITEMS.filter((item) => item.group === group && item.id !== 'auth');
  if (items.length === 0) return '';

  const label = GROUP_LABELS[group];
  const navLinks = items.map(renderNavItem).join('');

  if (group === 'top') {
    return `<ul class="nav flex-column">${navLinks}</ul>`;
  }

  return `
    <div class="sidebar-group">
      <span class="sidebar-group-label">${label}</span>
      <ul class="nav flex-column">${navLinks}</ul>
    </div>
  `;
}

/**
 * Renderiza el HTML completo de la barra lateral.
 * Compatible con Bootstrap offcanvas-lg: actúa como offcanvas en mobile
 * y como sidebar fija en desktop (lg+).
 */
export function render(): string {
  const authItem = NAV_ITEMS.find((item) => item.id === 'auth');
  const authLink = authItem
    ? `
      <div class="mt-auto p-2 border-top">
        <a class="nav-link" href="${authItem.hash}" data-hash="${authItem.hash}">
          <i class="bi ${authItem.icon}"></i> ${authItem.label}
        </a>
      </div>
    `
    : '';

  return `
    <aside
      id="sidebar"
      class="sidebar offcanvas-lg offcanvas-start"
      tabindex="-1"
      aria-label="Navegación lateral"
    >
      <!-- Encabezado del offcanvas — solo visible en mobile -->
      <div class="offcanvas-header d-lg-none">
        <h5 class="offcanvas-title">NGR Inventory</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="offcanvas"
          data-bs-target="#sidebar"
          aria-label="Cerrar"
        ></button>
      </div>

      <!-- Cuerpo de la navegación -->
      <div class="offcanvas-body d-flex flex-column p-0">
        <nav class="sidebar-nav flex-grow-1 p-2" aria-label="Módulos del sistema">
          ${renderGroup('top')}
          ${renderGroup('inventario')}
          ${renderGroup('movimientos')}
          ${renderGroup('administracion')}
        </nav>
        ${authLink}
      </div>
    </aside>
  `;
}

/**
 * Actualiza el estado activo de los enlaces del sidebar según el hash actual.
 * Elimina la clase 'active' de todos y la agrega solo al enlace que coincide.
 */
export function setActive(hash: string): void {
  // Normalizar: si no tiene '/' después de '#', agregar para match consistente
  const normalizedHash = hash || '#/';

  const links = document.querySelectorAll<HTMLAnchorElement>('.sidebar .nav-link[data-hash]');
  links.forEach((link) => {
    const linkHash = link.getAttribute('data-hash') ?? '';
    if (linkHash === normalizedHash) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * Inicializa los listeners del sidebar: reacciona a cambios de hash y teclado.
 * Debe llamarse después de que el HTML del sidebar esté en el DOM.
 */
export function init(root: HTMLElement): void {
  // Activar enlace correspondiente a la ruta inicial
  setActive(window.location.hash || '#/');

  // Reaccionar a cambios de ruta (hash navigation)
  window.addEventListener('hashchange', () => {
    setActive(window.location.hash || '#/');
  });

  // Soporte de teclado: Enter y Space en links del sidebar
  const nav = root.querySelector<HTMLElement>('.sidebar-nav');
  if (nav) {
    nav.addEventListener('keydown', (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' && (event.key === 'Enter' || event.key === ' ')) {
        if (event.key === ' ') {
          event.preventDefault();
          target.click();
        }
      }
    });
  }
}
