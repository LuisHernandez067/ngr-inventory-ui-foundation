// Patrón TableToolbar — barra de herramientas compuesta (búsqueda + filtros + acciones)
import type { TableToolbarProps } from '../types';

import { render as renderFilterChips, init as initFilterChips } from './filter-chips';
import { render as renderSearchBar, init as initSearchBar } from './search-bar';

/**
 * Renderiza el HTML de la barra de herramientas de tabla.
 * Compone SearchBar y FilterChips en un flex row responsivo.
 */
export function render(props: TableToolbarProps): string {
  const { showSearch = true, searchPlaceholder, filters = [], actions = '', id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  const searchHtml = showSearch
    ? `<div class="ngr-toolbar-search flex-grow-1">` +
      renderSearchBar({
        ...(searchPlaceholder !== undefined ? { placeholder: searchPlaceholder } : {}),
      }) +
      `</div>`
    : '';

  const filtersHtml =
    filters.length > 0
      ? `<div class="ngr-toolbar-filters">` + renderFilterChips({ filters }) + `</div>`
      : '';

  const actionsHtml = actions
    ? `<div class="ngr-toolbar-actions d-flex gap-2">${actions}</div>`
    : '';

  return (
    `<div${idAttr} class="ngr-table-toolbar${extraClass}">` +
    searchHtml +
    filtersHtml +
    actionsHtml +
    `</div>`
  );
}

/**
 * Inicializa la barra de herramientas y sus componentes hijos.
 * Los eventos ngr:search y ngr:filter-remove burbujean naturalmente.
 */
export function init(root: HTMLElement): void {
  // Inicializar SearchBar si está presente
  const searchRoot = root.querySelector<HTMLElement>('.ngr-toolbar-search .ngr-search-bar');
  if (searchRoot) {
    initSearchBar(searchRoot);
  }

  // Inicializar FilterChips si está presente
  const filtersRoot = root.querySelector<HTMLElement>('.ngr-toolbar-filters .ngr-filter-chips');
  if (filtersRoot) {
    initFilterChips(filtersRoot);
  }
}
