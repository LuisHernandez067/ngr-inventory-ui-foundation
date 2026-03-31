// Componente PageHeader — encabezado de página con título, subtítulo y acciones
import type { ComponentProps } from '../types';

/** Props para el componente PageHeader */
export interface NgrPageHeaderProps extends ComponentProps {
  /** Título principal de la página */
  title: string;
  /** Subtítulo descriptivo opcional */
  subtitle?: string;
  /** HTML con los botones de acción del encabezado (opcional) */
  actions?: string;
  /** HTML para el breadcrumb de navegación (opcional) */
  breadcrumb?: string;
}

/**
 * Renderiza el HTML de un encabezado de página landmark.
 * Usa la etiqueta <header> semántica con título h1, subtítulo y slot de acciones.
 */
export function render(props: NgrPageHeaderProps): string {
  const { title, subtitle, actions, breadcrumb, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  const subtitleHtml = subtitle ? `<p class="text-muted mb-0 mt-1">${subtitle}</p>` : '';
  const breadcrumbHtml = breadcrumb ? `<nav aria-label="breadcrumb">${breadcrumb}</nav>` : '';
  const actionsHtml = actions ? `<div class="ngr-page-header-actions">${actions}</div>` : '';

  return `<header${idAttr} class="ngr-page-header d-flex align-items-center justify-content-between mb-4${extraClass}"><div><h1 class="h3 mb-0">${title}</h1>${subtitleHtml}${breadcrumbHtml}</div>${actionsHtml}</header>`;
}

/**
 * Inicializa el encabezado de página — no requiere listeners adicionales.
 * Los consumidores inicializan sus botones de acción por separado.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — los consumidores manejan sus acciones
}
