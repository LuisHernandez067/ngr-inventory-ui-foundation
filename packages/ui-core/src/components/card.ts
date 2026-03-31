// Componente Card — contenedor con encabezado, cuerpo y pie opcionales
import type { ComponentProps } from '../types';

/** Props para el componente Card */
export interface NgrCardProps extends ComponentProps {
  /** Título mostrado en el encabezado (opcional) */
  title?: string;
  /** HTML para el pie de la tarjeta (opcional) */
  footer?: string;
  /** Clases CSS adicionales para el cuerpo de la tarjeta */
  bodyClass?: string;
  /** HTML para el slot de acciones del encabezado (opcional) */
  headerActions?: string;
}

/**
 * Renderiza el HTML de una tarjeta con slots opcionales de encabezado, cuerpo y pie.
 * El cuerpo recibe el contenido como segundo parámetro (patrón slot).
 */
export function render(props: NgrCardProps, bodyContent: string): string {
  const { title, footer, bodyClass, headerActions, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const bodyClassAttr = bodyClass ? ` ${bodyClass}` : '';

  // Encabezado: solo si hay título o acciones en el header
  const headerHtml =
    title || headerActions
      ? `<div class="card-header d-flex align-items-center justify-content-between">${title ? `<span>${title}</span>` : ''}${headerActions ? `<div class="card-header-actions">${headerActions}</div>` : ''}</div>`
      : '';

  // Pie de tarjeta
  const footerHtml = footer ? `<div class="card-footer">${footer}</div>` : '';

  return `<div${idAttr} class="card${extraClass}">${headerHtml}<div class="card-body${bodyClassAttr}">${bodyContent}</div>${footerHtml}</div>`;
}

/**
 * Inicializa la tarjeta — no requiere listeners adicionales por defecto.
 * Los consumidores inicializan su propio contenido dentro del cuerpo.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — los consumidores manejan su contenido
}
