// Componente Tooltip — wrapper de Bootstrap Tooltip JS
import { Tooltip } from 'bootstrap';
import type { ComponentProps } from '../types';

/** Configuración para el componente Tooltip */
export interface NgrTooltipProps extends ComponentProps {
  /** Texto del tooltip */
  title: string;
  /** Posición del tooltip respecto al elemento (por defecto 'top') */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** HTML interno que se envuelve con el tooltip */
  content: string;
}

/**
 * Configuración simplificada solo para generar atributos de tooltip.
 */
export interface TooltipConfig {
  /** Texto del tooltip */
  text: string;
  /** Posición del tooltip (por defecto 'top') */
  placement?: 'top' | 'bottom' | 'start' | 'end';
}

/**
 * Genera los atributos data-* necesarios para activar un Bootstrap Tooltip.
 * Retorna un string con los atributos listos para insertar en un elemento HTML.
 */
export function createTooltipAttrs(config: TooltipConfig): string {
  const placement = config.placement ?? 'top';
  return `data-bs-toggle="tooltip" data-bs-placement="${placement}" title="${config.text}"`;
}

/**
 * Renderiza el HTML envolviendo el contenido en un span con atributos de tooltip.
 */
export function render(props: NgrTooltipProps): string {
  const { title, placement = 'top', content, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` class="${className}"` : '';

  return `<span${idAttr}${extraClass} data-bs-toggle="tooltip" data-bs-placement="${placement}" title="${title}">${content}</span>`;
}

/**
 * Inicializa todos los tooltips de Bootstrap dentro del elemento raíz.
 * Busca todos los elementos con [data-bs-toggle="tooltip"] y crea instancias Tooltip.
 */
export function initTooltips(root: HTMLElement): void {
  const tooltipElements = root.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipElements.forEach((el) => new Tooltip(el));
}

/**
 * Alias de initTooltips para mantener coherencia con el patrón render/init.
 */
export { initTooltips as init };
