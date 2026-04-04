// Patrón DataTable — tabla de datos con ordenamiento, estado vacío y overlay de carga
import { Spinner, EmptyState } from '@ngr-inventory/ui-core';

import type { DataTableProps, ColumnDef } from '../types';

import * as LoadingOverlay from './loading-overlay';

/** Estado de ordenamiento por instancia de tabla */
interface SortState {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

// WeakMap para aislar el estado de ordenamiento por instancia de tabla
const sortStates = new WeakMap<HTMLElement, SortState>();

/**
 * Renderiza el HTML de la cabecera de tabla.
 */
function renderHeader<T>(columns: ColumnDef<T>[]): string {
  const cells = columns
    .map((col) => {
      const sortableAttr = col.sortable ? ` data-sortable="${col.key}" aria-sort="none"` : '';
      const widthStyle = col.width ? ` style="width:${col.width}"` : '';
      return `<th scope="col"${sortableAttr}${widthStyle}>${col.header}</th>`;
    })
    .join('');
  return `<thead><tr>${cells}</tr></thead>`;
}

/**
 * Renderiza el cuerpo de la tabla con las filas de datos.
 * Si no hay filas, muestra el EmptyState en un colspan completo.
 */
function renderBody<T>(rows: T[], columns: ColumnDef<T>[], onRowClick?: (row: T) => void): string {
  if (!rows.length) {
    return `<tbody><tr><td colspan="${String(columns.length)}" class="p-0 border-0"></td></tr></tbody>`;
  }

  const rowsHtml = rows
    .map((row) => {
      const rowRecord = row as Record<string, unknown>;
      const clickClass = onRowClick ? ' cursor-pointer' : '';
      const cells = columns
        .map((col) => {
          const value = rowRecord[col.key];
          const cellContent = col.render
            ? col.render(value, row)
            : value === null || value === undefined
              ? ''
              : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                ? String(value)
                : '';
          return `<td>${cellContent}</td>`;
        })
        .join('');
      return `<tr class="${clickClass.trim()}" data-row-idx>${cells}</tr>`;
    })
    .join('');

  return `<tbody>${rowsHtml}</tbody>`;
}

/**
 * Renderiza el HTML completo del DataTable.
 */
export function render<T = Record<string, unknown>>(props: DataTableProps<T>): string {
  const {
    columns,
    rows,
    loading = false,
    emptyIcon = 'inbox',
    emptyTitle = 'Sin resultados',
    emptyDescription = 'No se encontraron registros para mostrar.',
    onRowClick,
    id,
    className,
    ariaLabel,
  } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  // Estado vacío — EmptyState fuera de la tabla para mejor semántica
  const emptyHtml =
    !loading && !rows.length
      ? EmptyState.render({ icon: emptyIcon, title: emptyTitle, description: emptyDescription })
      : '';

  // Estado de carga — Spinner placeholder (LoadingOverlay se agrega imperativamenteinit)
  const spinnerPlaceholder = loading
    ? `<div class="text-center py-4">${Spinner.render({ size: 'lg' })}</div>`
    : '';

  const tableHtml = !loading
    ? `<table class="table table-hover mb-0"${ariaLabel !== undefined ? ` aria-label="${ariaLabel}"` : ''}>` +
      renderHeader(columns) +
      renderBody(rows, columns, onRowClick) +
      `</table>`
    : '';

  return (
    `<div${idAttr} class="ngr-datatable-wrapper position-relative${extraClass}">` +
    spinnerPlaceholder +
    tableHtml +
    emptyHtml +
    `</div>`
  );
}

/**
 * Actualiza el cuerpo de la tabla sin re-renderizar la cabecera.
 */
export function updateRows<T = Record<string, unknown>>(
  root: HTMLElement,
  rows: T[],
  columns: ColumnDef<T>[]
): void {
  const tbody = root.querySelector('tbody');
  if (!tbody) return;

  const onRowClickFn = (root as HTMLElement & { _onRowClick?: (row: T) => void })._onRowClick;
  const newTbody = document.createElement('tbody');
  newTbody.innerHTML = renderBody(rows, columns, onRowClickFn).replace(
    /^<tbody>(.*)<\/tbody>$/s,
    '$1'
  );
  tbody.replaceWith(newTbody);
}

/**
 * Inicializa los listeners del DataTable.
 * Maneja ordenamiento por columnas y clic en filas.
 */
export function init<T = Record<string, unknown>>(
  root: HTMLElement,
  props?: Pick<DataTableProps<T>, 'columns' | 'rows' | 'onRowClick'>
): void {
  // Inicializar estado de ordenamiento para esta instancia
  if (!sortStates.has(root)) {
    sortStates.set(root, { key: null, direction: null });
  }

  // Almacenar callback de clic en filas
  if (props?.onRowClick) {
    (root as HTMLElement & { _onRowClick?: (row: T) => void })._onRowClick = props.onRowClick;
  }

  // Listener de clic en cabeceras ordenables
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const th = target.closest<HTMLElement>('th[data-sortable]');

    if (th) {
      const key = th.getAttribute('data-sortable') ?? '';
      const state = sortStates.get(root) ?? { key: null, direction: null };

      // Ciclo de ordenamiento: none → ascending → descending → none
      let nextDirection: 'asc' | 'desc' | null;
      if (state.key !== key || state.direction === null) {
        nextDirection = 'asc';
      } else if (state.direction === 'asc') {
        nextDirection = 'desc';
      } else {
        nextDirection = null;
      }

      // Actualizar estado de todas las columnas
      const allTh = root.querySelectorAll<HTMLElement>('th[data-sortable]');
      allTh.forEach((header) => {
        header.setAttribute('aria-sort', 'none');
      });

      // Actualizar aria-sort en la columna clicada
      if (nextDirection !== null) {
        th.setAttribute('aria-sort', nextDirection === 'asc' ? 'ascending' : 'descending');
      }

      // Guardar nuevo estado
      sortStates.set(root, { key: nextDirection ? key : null, direction: nextDirection });

      // Emitir evento de cambio de ordenamiento
      root.dispatchEvent(
        new CustomEvent('ngr:sort-change', {
          bubbles: true,
          detail: { key, direction: nextDirection },
        })
      );
    }

    // Listener de clic en filas
    const tr = target.closest<HTMLElement>('tr.cursor-pointer');
    if (tr && props?.rows) {
      const rows = root.querySelectorAll('tbody tr');
      const idx = Array.from(rows).indexOf(tr);
      if (idx >= 0 && props.rows[idx] !== undefined) {
        props.onRowClick?.(props.rows[idx]);
      }
    }
  });
}

// Re-exportar LoadingOverlay para uso conveniente en DataTable
export { LoadingOverlay };
