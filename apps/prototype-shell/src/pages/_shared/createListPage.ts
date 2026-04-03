// Factory que crea módulos de página de lista con DataTable, Pagination y Toolbar.
// Cada instancia gestiona su propio estado de paginación, búsqueda y requests en vuelo.
import type { PaginatedResponse } from '@ngr-inventory/api-contracts';
import { DataTable, Pagination, TableToolbar, LoadingOverlay } from '@ngr-inventory/ui-patterns';
import type { ColumnDef as UiColumnDef } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';

import { apiFetch } from './apiFetch';

/**
 * Definición de columna para la tabla de lista.
 * Extiende el ColumnDef de ui-patterns con el tipo de fila fuertemente tipado.
 */
export interface ColumnDef<T> {
  /** Clave del campo en el objeto de datos */
  key: keyof T & string;
  /** Encabezado visible en la tabla */
  header: string;
  /** Ancho opcional de la columna */
  width?: string;
  /** Función de renderizado personalizado — recibe el valor y el objeto completo */
  render?: (value: T[keyof T], row: T) => string;
}

/**
 * Opciones de configuración del factory de página de lista.
 */
export interface ListPageOptions<T> {
  /** Título visible en el h1 */
  title: string;
  /** URL base del endpoint de MSW, ej. '/api/productos' */
  endpoint: string;
  /** Definición de columnas de la tabla */
  columns: ColumnDef<T>[];
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Ícono Bootstrap Icons para el botón de acción principal */
  actionIcon?: string;
  /** Texto del botón de acción principal */
  actionLabel?: string;
  /** Callback invocado al hacer clic en una fila — recibe el id del item */
  onRowClick?: (id: string) => void;
  /** Callback invocado al hacer clic en el botón de acción principal */
  onActionClick?: () => void;
  /**
   * Filtros adicionales que se adjuntan a la URL de fetch.
   * Backward-compatible: no afecta instancias existentes que no lo provean.
   * Valores vacíos ('') se omiten de la URL.
   */
  filters?: Record<string, string>;
}

/**
 * Crea un PageModule de lista con búsqueda, paginación y tabla de datos.
 * El estado (página actual, tamaño, búsqueda) es local a cada instancia creada.
 */
export function createListPage<T extends Record<string, unknown>>(
  options: ListPageOptions<T>
): PageModule {
  // ── Estado interno de la página ──────────────────────────────────────────────
  let currentPage = 1;
  const pageSize = 10;
  let searchQuery = '';
  let activeFilters: Record<string, string> = {};
  let abortController: AbortController | null = null;

  // Referencia al contenedor raíz — se establece en render()
  let rootContainer: HTMLElement | null = null;

  // ── Mapeo de columnas al formato que espera DataTable de ui-patterns ─────────
  function buildUiColumns(): UiColumnDef<T>[] {
    return options.columns.map((col) => {
      // Construir el objeto columna sin incluir propiedades opcionales como undefined
      // para satisfacer exactOptionalPropertyTypes: true del compilador
      const uiCol: UiColumnDef<T> = {
        key: col.key,
        header: col.header,
      };

      if (col.width !== undefined) {
        uiCol.width = col.width;
      }

      // Adaptar la firma de render: ui-patterns usa (unknown, T) — compatible
      if (col.render !== undefined) {
        const renderFn = col.render;
        uiCol.render = (value: unknown, row: T) => renderFn(value as T[keyof T], row);
      }

      return uiCol;
    });
  }

  // ── Renderiza el spinner de carga en #table-container ────────────────────────
  function showTableLoading(): void {
    const tableContainer = rootContainer?.querySelector<HTMLElement>('#table-container');
    if (!tableContainer) return;

    // Limpiar contenido anterior y mostrar spinner
    tableContainer.innerHTML = '';
    LoadingOverlay.show(tableContainer);
  }

  // ── Renderiza el mensaje de error en #table-container ───────────────────────
  function showTableError(message: string): void {
    const tableContainer = rootContainer?.querySelector<HTMLElement>('#table-container');
    if (!tableContainer) return;

    LoadingOverlay.hide(tableContainer);
    tableContainer.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
        <span>${message}</span>
      </div>
    `;
  }

  // ── Renderiza la tabla con los datos recibidos ───────────────────────────────
  function renderTable(response: PaginatedResponse<T>): void {
    const tableContainer = rootContainer?.querySelector<HTMLElement>('#table-container');
    const paginationContainer = rootContainer?.querySelector<HTMLElement>('#pagination-container');
    if (!tableContainer || !paginationContainer) return;

    // Quitar overlay de carga antes de pintar la tabla
    LoadingOverlay.hide(tableContainer);

    const uiColumns = buildUiColumns();

    // Construir callback de clic en fila si la opción fue provista
    // DataTable.init recibe el objeto completo — extraemos el id para el caller
    const rowClickHandler = options.onRowClick
      ? (row: T) => {
          const rowRecord = row as Record<string, unknown>;
          const rawId = rowRecord['id'];
          const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '';
          options.onRowClick?.(id);
        }
      : undefined;

    // Props base del DataTable — onRowClick solo se incluye si fue provisto
    // para satisfacer exactOptionalPropertyTypes: true del compilador
    const dataTableProps = {
      columns: uiColumns,
      rows: response.data,
      ariaLabel: `Lista de ${options.title}`,
      ...(rowClickHandler !== undefined ? { onRowClick: rowClickHandler } : {}),
    };

    // Renderizar DataTable con las filas recibidas
    tableContainer.innerHTML = DataTable.render<T>(dataTableProps);

    // Inicializar listeners de ordenamiento y clic en filas del DataTable
    const tableRoot = tableContainer.querySelector<HTMLElement>('.ngr-datatable-wrapper');
    if (tableRoot) {
      DataTable.init<T>(tableRoot, dataTableProps);

      // Soporte de teclado para filas navegables — agrega tabindex y keydown a cada fila clicable
      if (rowClickHandler !== undefined) {
        tableRoot.querySelectorAll<HTMLElement>('tr.cursor-pointer').forEach((tr) => {
          tr.setAttribute('tabindex', '0');
          tr.setAttribute('role', 'button');
          tr.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              tr.click(); // Reutiliza el handler de click existente
            }
          });
        });
      }
    }

    // Actualizar región live con el conteo de resultados — anuncia a lectores de pantalla
    const resultCountEl = rootContainer?.querySelector<HTMLElement>('#result-count-live');
    if (resultCountEl) {
      resultCountEl.textContent = `${String(response.data.length)} registros encontrados`;
    }

    // Actualizar paginación — solo mostrar si hay más de una página
    if (response.totalPages > 1) {
      paginationContainer.innerHTML = Pagination.render({
        currentPage: response.page,
        totalPages: response.totalPages,
      });

      // Inicializar listener de paginación si no fue inicializado antes
      const paginationRoot = paginationContainer.querySelector<HTMLElement>('.ngr-pagination');
      if (paginationRoot) {
        Pagination.init(paginationRoot);
      }
    } else {
      // Una sola página — ocultar paginación
      paginationContainer.innerHTML = '';
    }
  }

  // ── Cancelar request anterior y lanzar uno nuevo ─────────────────────────────
  function fetchData(): void {
    // Cancelar petición previa si está en vuelo
    abortController?.abort();
    abortController = new AbortController();

    // Mostrar estado de carga en la tabla
    showTableLoading();

    // Construir URL con parámetros de paginación y búsqueda
    const filterParams = Object.entries(activeFilters)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('');
    const url =
      `${options.endpoint}?page=${String(currentPage)}&pageSize=${String(pageSize)}` +
      (searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '') +
      filterParams;

    apiFetch<PaginatedResponse<T>>(url, { signal: abortController.signal })
      .then((response) => {
        renderTable(response);
      })
      .catch((error: unknown) => {
        // Ignorar errores de cancelación — son esperados al navegar
        if (error instanceof Error && error.name === 'AbortError') return;

        const message =
          error instanceof Error ? error.message : 'Error desconocido al cargar los datos.';
        showTableError(message);
      });
  }

  // ── Construye el HTML del botón de acción principal ──────────────────────────
  function buildActionsHtml(): string {
    if (!options.actionLabel) return '';

    const icon = options.actionIcon
      ? `<i class="bi bi-${options.actionIcon}" aria-hidden="true"></i> `
      : '';

    return `<button type="button" class="btn btn-primary ngr-action-btn">${icon}${options.actionLabel}</button>`;
  }

  // ── Implementación del PageModule ────────────────────────────────────────────
  return {
    render(container: HTMLElement): void {
      rootContainer = container;

      // Resetear estado al montar la página
      currentPage = 1;
      searchQuery = '';
      activeFilters = { ...(options.filters ?? {}) };

      // Estructura HTML principal de la página
      container.innerHTML = `
        <div class="p-4">
          <h1 class="h3 mb-4">${options.title}</h1>
          <div id="toolbar-container" class="mb-3"></div>
          <!-- Región live para anunciar el conteo de resultados a lectores de pantalla -->
          <div role="status" aria-live="polite" aria-atomic="true" class="visually-hidden" id="result-count-live"></div>
          <div id="table-container" class="position-relative" tabindex="0"></div>
          <div id="pagination-container" class="mt-3"></div>
        </div>
      `;

      // Inicializar TableToolbar con búsqueda y botón de acción
      const toolbarContainer = container.querySelector<HTMLElement>('#toolbar-container');
      if (toolbarContainer) {
        toolbarContainer.innerHTML = TableToolbar.render({
          showSearch: true,
          searchPlaceholder: options.searchPlaceholder ?? 'Buscar...',
          filters: [],
          actions: buildActionsHtml(),
        });

        // Inicializar listeners del toolbar (SearchBar y FilterChips internos)
        const toolbarRoot = toolbarContainer.querySelector<HTMLElement>('.ngr-table-toolbar');
        if (toolbarRoot) {
          TableToolbar.init(toolbarRoot);
        }

        // Suscribirse al evento de búsqueda que emite SearchBar con debounce
        toolbarContainer.addEventListener('ngr:search', (event: Event) => {
          const customEvent = event as CustomEvent<{ query: string }>;
          searchQuery = customEvent.detail.query;
          currentPage = 1;
          fetchData();
        });

        // Wiring del botón de acción principal — navega a la ruta de creación
        if (options.onActionClick) {
          const actionBtn = toolbarContainer.querySelector<HTMLButtonElement>('.ngr-action-btn');
          actionBtn?.addEventListener('click', () => {
            options.onActionClick?.();
          });
        }
      }

      // Suscribirse al evento de cambio de página que emite Pagination
      const paginationContainer = container.querySelector<HTMLElement>('#pagination-container');
      if (paginationContainer) {
        paginationContainer.addEventListener('ngr:page-change', (event: Event) => {
          const customEvent = event as CustomEvent<{ page: number }>;
          currentPage = customEvent.detail.page;
          fetchData();
        });
      }

      // Carga inicial de datos
      fetchData();
    },

    destroy(): void {
      // Cancelar cualquier request en vuelo al destruir la página
      abortController?.abort();
      abortController = null;
      rootContainer = null;
    },
  };
}
