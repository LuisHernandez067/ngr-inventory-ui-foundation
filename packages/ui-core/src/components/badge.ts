// Componente Badge — etiqueta de estado y categorización
import type { ComponentProps, BadgeVariant } from '../types';

/** Props para el componente Badge */
export interface NgrBadgeProps extends ComponentProps {
  /** Variante de color Bootstrap */
  variant: BadgeVariant;
  /** Texto a mostrar en el badge */
  text: string;
  /** Muestra como indicador circular sin texto (por defecto false) */
  dot?: boolean;
  /** Aplica bordes redondeados tipo píldora (por defecto false) */
  pill?: boolean;
}

/**
 * Renderiza el HTML de un badge.
 * En modo dot: pequeño círculo sin texto, con clase ngr-badge-dot.
 * En modo normal: span con texto y variante de color.
 */
export function render(props: NgrBadgeProps): string {
  const { variant, text, dot = false, pill = false, id, className } = props;
  const idAttr = id ? ` id="${id}"` : '';
  const pillClass = pill ? ' rounded-pill' : '';
  const dotClass = dot ? ' ngr-badge-dot' : '';
  const extraClass = className ? ` ${className}` : '';
  const content = dot ? '&nbsp;' : text;

  return `<span${idAttr} class="badge bg-${variant}${pillClass}${dotClass}${extraClass}">${content}</span>`;
}

/**
 * Inicializa el badge — no requiere listeners adicionales.
 * Incluida por consistencia con el patrón render/init.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — el badge es solo visual
}
