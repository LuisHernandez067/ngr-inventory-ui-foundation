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
 * Busca la etiqueta del módulo en NAV_ITEMS y actualiza el DOM.
 */
export function update(hash: string): void {
  const breadcrumbList = document.getElementById('breadcrumb-list');
  if (!breadcrumbList) return;

  const normalizedHash = hash || '#/';

  // Buscar el ítem correspondiente al hash
  const activeItem = NAV_ITEMS.find((item) => item.hash === normalizedHash);
  const label = activeItem?.label ?? 'Dashboard';

  // Actualizar el contenido del breadcrumb
  breadcrumbList.innerHTML = `
    <li class="breadcrumb-item active" aria-current="page">${label}</li>
  `;
}
