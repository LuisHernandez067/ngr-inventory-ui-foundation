// Componente Spinner — indicador de carga accesible
import type { ComponentProps, Size, Variant } from '../types';

/** Props para el componente Spinner */
export interface NgrSpinnerProps extends ComponentProps {
  /** Tamaño del spinner (por defecto 'md') */
  size?: Size;
  /** Texto oculto visualmente para lectores de pantalla (por defecto 'Cargando...') */
  label?: string;
  /** Variante de color Bootstrap (por defecto 'primary') */
  variant?: Variant;
}

/**
 * Mapeo de tamaños a clases Bootstrap.
 * sm → spinner-border-sm, md → nada extra, lg → estilo inline
 */
function getSizeClass(size: Size): string {
  if (size === 'sm') return ' spinner-border-sm';
  return '';
}

/**
 * Renderiza el HTML de un spinner de carga accesible.
 * Incluye role="status" y texto oculto para lectores de pantalla.
 */
export function render(props: NgrSpinnerProps): string {
  const size = props.size ?? 'md';
  const label = props.label ?? 'Cargando...';
  const variant = props.variant ?? 'primary';
  const sizeClass = getSizeClass(size);
  const lgStyle = size === 'lg' ? ' style="width:3rem;height:3rem"' : '';
  const idAttr = props.id ? ` id="${props.id}"` : '';
  const extraClass = props.className ? ` ${props.className}` : '';

  return `<div${idAttr} class="spinner-border${sizeClass} text-${variant}${extraClass}" role="status"${lgStyle}><span class="visually-hidden">${label}</span></div>`;
}

/**
 * Inicializa el spinner — no requiere listeners adicionales.
 * Incluida por consistencia con el patrón render/init.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — el spinner es solo visual
}
