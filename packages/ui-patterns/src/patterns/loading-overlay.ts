// Patrón LoadingOverlay — overlay de carga imperativo sobre un elemento raíz
import { Spinner } from '@ngr-inventory/ui-core';

/** Atributo identificador del overlay — evita duplicados */
const OVERLAY_ATTR = 'data-ngr-overlay';

/**
 * Muestra el overlay de carga sobre el elemento raíz.
 * Inyecta el overlay con Spinner y establece aria-busy en el root.
 */
export function show(root: HTMLElement, message?: string): void {
  // Evitar duplicados si ya está visible
  if (root.querySelector(`[${OVERLAY_ATTR}]`)) return;

  // Asegurar position relative para que el overlay se posicione correctamente
  const currentPos = getComputedStyle(root).position;
  if (currentPos !== 'absolute' && currentPos !== 'fixed' && currentPos !== 'relative') {
    root.style.position = 'relative';
  }

  // Crear el elemento overlay
  const overlay = document.createElement('div');
  overlay.className = 'ngr-loading-overlay';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.setAttribute(OVERLAY_ATTR, '');
  overlay.innerHTML =
    Spinner.render({ size: 'lg', variant: 'primary' }) +
    `<span class="visually-hidden">${message ?? 'Cargando...'}</span>`;

  // Marcar el root como ocupado para lectores de pantalla
  root.setAttribute('aria-busy', 'true');
  root.appendChild(overlay);
}

/**
 * Oculta y remueve el overlay de carga del elemento raíz.
 */
export function hide(root: HTMLElement): void {
  const overlay = root.querySelector<HTMLElement>(`[${OVERLAY_ATTR}]`);
  overlay?.remove();
  root.removeAttribute('aria-busy');
}

/**
 * Renderiza el LoadingOverlay — devuelve string vacío porque el overlay es imperativo.
 * Incluido por consistencia con el patrón render/init.
 */
export function render(_props?: Record<string, never>): string {
  // El overlay se crea imperativamente mediante show() — no tiene renderizado declarativo
  return '';
}

/**
 * Inicializa el LoadingOverlay.
 * Sin comportamiento interactivo — la API es imperativa (show/hide).
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — usar show() y hide() directamente
}
