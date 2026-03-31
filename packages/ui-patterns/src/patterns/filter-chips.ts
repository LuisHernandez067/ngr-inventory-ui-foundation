// Patrón FilterChips — chips dismissibles para filtros activos
import type { ComponentProps, FilterChip } from '../types';

/** Props para el componente FilterChips */
export interface FilterChipsProps extends ComponentProps {
  /** Lista de filtros activos a mostrar */
  filters: FilterChip[];
}

/**
 * Renderiza el HTML de los chips de filtros activos.
 * Cada chip incluye un botón de cierre con data-action="remove-filter".
 */
export function render(props: FilterChipsProps): string {
  const { filters, id, className } = props;

  if (!filters.length) return '';

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  const chips = filters
    .map(
      (filter) =>
        `<span class="badge bg-light text-dark border d-inline-flex align-items-center gap-1">` +
        `${filter.label}: <strong>${filter.value}</strong>` +
        `<button type="button" class="btn-close btn-close-dark ms-1" ` +
        `data-action="remove-filter" data-key="${filter.key}" data-value="${filter.value}" ` +
        `aria-label="Quitar filtro ${filter.label}" style="font-size:0.65em"></button>` +
        `</span>`
    )
    .join('');

  return `<div${idAttr} class="d-flex flex-wrap gap-1 ngr-filter-chips${extraClass}">${chips}</div>`;
}

/**
 * Inicializa los listeners de los chips de filtros.
 * Emite CustomEvent 'ngr:filter-remove' cuando el usuario descarta un filtro.
 */
export function init(root: HTMLElement): void {
  // Delegación de clic en botones de cierre
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-action="remove-filter"]');
    if (!button) return;

    const key = button.getAttribute('data-key') ?? '';
    const value = button.getAttribute('data-value') ?? '';

    // Emitir evento de remoción del filtro con bubbles para que suba al toolbar
    root.dispatchEvent(
      new CustomEvent('ngr:filter-remove', {
        bubbles: true,
        detail: { key, value },
      })
    );
  });
}
