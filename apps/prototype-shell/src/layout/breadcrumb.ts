// Módulo de breadcrumb — actualiza dinámicamente según la ruta activa
import { NAV_ITEMS } from './sidebar';

/**
 * Renderiza el contenedor del breadcrumb.
 * El contenido se actualiza dinámicamente mediante update(hash).
 */
export function render(): string {
  return `
    <nav aria-label="Ruta de navegación" class="breadcrumb-wrapper">
      <ol class="breadcrumb" id="breadcrumb-list">
        <li class="breadcrumb-item active" aria-current="page">Dashboard</li>
      </ol>
    </nav>
  `;
}

/**
 * Actualiza el breadcrumb según el hash de ruta activo.
 * Soporta rutas de detalle (e.g. '#/productos/1') generando una ruta jerárquica:
 *   Productos > Detalle
 */
export function update(hash: string): void {
  const breadcrumbList = document.getElementById('breadcrumb-list');
  if (!breadcrumbList) return;

  const normalizedHash = hash || '#/';

  // Detectar si es una ruta de detalle (más de un segmento después de '#/')
  const withoutHash = normalizedHash.replace(/^#/, ''); // '/productos/1'
  const segments = withoutHash.split('/').filter(Boolean); // ['productos', '1']

  if (segments.length > 1) {
    // Ruta de detalle — construir breadcrumb jerárquico con link al padre
    const parentHash = `#/${segments[0] ?? ''}`;
    const parentItem = NAV_ITEMS.find((item) => item.hash === parentHash);
    const parentLabel = parentItem?.label ?? segments[0] ?? 'Detalle';

    breadcrumbList.innerHTML = `
      <li class="breadcrumb-item">
        <a href="${parentHash}">${parentLabel}</a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Detalle</li>
    `;
    return;
  }

  // Ruta directa — buscar el ítem correspondiente al hash
  const activeItem = NAV_ITEMS.find((item) => item.hash === normalizedHash);
  const label = activeItem?.label ?? 'Dashboard';

  // Actualizar el contenido del breadcrumb
  breadcrumbList.innerHTML = `
    <li class="breadcrumb-item active" aria-current="page">${label}</li>
  `;
}
