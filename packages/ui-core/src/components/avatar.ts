// Componente Avatar — representación visual de un usuario con iniciales o imagen
import type { ComponentProps, Size } from '../types';

/** Props para el componente Avatar */
export interface NgrAvatarProps extends ComponentProps {
  /** Nombre del usuario — se usan las iniciales si no hay imagen */
  name: string;
  /** Tamaño del avatar (por defecto 'md') */
  size?: Size;
  /** URL de imagen — si se proporciona, se muestra en lugar de las iniciales */
  src?: string;
}

/**
 * Calcula las iniciales a partir del nombre.
 * Usa la primera letra del primer y último nombre (si existe).
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Calcula el índice de color (0-7) a partir del nombre.
 * Usa la suma de códigos de caracteres módulo 8 para determinismo.
 */
function getColorIndex(name: string): number {
  return name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8;
}

/**
 * Renderiza el HTML de un avatar con iniciales o imagen.
 * El color de fondo es determinístico según el nombre.
 * Incluye aria-label para accesibilidad.
 */
export function render(props: NgrAvatarProps): string {
  const { name, size = 'md', src, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const colorIndex = getColorIndex(name) + 1; // índices 1-8
  const bgStyle = `background-color:var(--ngr-avatar-${colorIndex})`;

  if (src) {
    // Renderizar con imagen
    return `<div${idAttr} class="ngr-avatar ngr-avatar-${size}${extraClass}" style="${bgStyle}" aria-label="${name}"><img src="${src}" alt="${name}" class="ngr-avatar-img" /></div>`;
  }

  // Renderizar con iniciales
  const initials = getInitials(name);
  return `<div${idAttr} class="ngr-avatar ngr-avatar-${size}${extraClass}" style="${bgStyle}" aria-label="${name}">${initials}</div>`;
}

/**
 * Inicializa el avatar — no requiere listeners adicionales.
 * Incluida por consistencia con el patrón render/init.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — el avatar es solo visual
}
