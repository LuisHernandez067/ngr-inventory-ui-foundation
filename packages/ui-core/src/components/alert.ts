// Componente Alert — mensajes de retroalimentación con soporte de íconos y cierre
import type { ComponentProps, AlertVariant } from '../types';

/** Props para el componente Alert */
export interface NgrAlertProps extends ComponentProps {
  /** Variante de color del alert */
  variant: AlertVariant;
  /** Mensaje a mostrar en el alert */
  message: string;
  /** Permite cerrar el alert con un botón (por defecto false) */
  dismissible?: boolean;
  /** Muestra un ícono correspondiente a la variante (por defecto false) */
  showIcon?: boolean;
}

/**
 * Mapeo de variantes a clases de Bootstrap Icons.
 */
const ICON_MAP: Record<AlertVariant, string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
  primary: 'bi-bell-fill',
  secondary: 'bi-bell-fill',
  light: 'bi-bell-fill',
  dark: 'bi-bell-fill',
};

/**
 * Renderiza el HTML de un alert de Bootstrap.
 * Si es dismissible, incluye botón de cierre y atributos de accesibilidad.
 * Si showIcon, prepende el ícono de la variante.
 */
export function render(props: NgrAlertProps): string {
  const { variant, message, dismissible = false, showIcon = false, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const dismissibleClass = dismissible ? ' alert-dismissible fade show' : '';
  const roleAttr = ' role="alert"';
  const ariaLive = dismissible ? ' aria-live="polite"' : '';

  const iconHtml = showIcon
    ? `<i class="bi ${ICON_MAP[variant]} me-2" aria-hidden="true"></i>`
    : '';

  const closeButton = dismissible
    ? `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>`
    : '';

  return `<div${idAttr} class="alert alert-${variant}${dismissibleClass}${extraClass}"${roleAttr}${ariaLive}>${iconHtml}${message}${closeButton}</div>`;
}

/**
 * Inicializa el alert — el botón de cierre usa data-bs-dismiss="alert" de Bootstrap
 * que es self-initializing. No se requieren listeners adicionales.
 */
export function init(_root: HTMLElement): void {
  // El cierre automático lo maneja Bootstrap via data-bs-dismiss="alert"
}
