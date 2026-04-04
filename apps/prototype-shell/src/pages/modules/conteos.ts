// Página de lista de Conteos físicos — implementación personalizada con filtros estado/almacén y navegación
import type {
  Almacen,
  Conteo,
  EstadoConteo,
  PaginatedResponse,
} from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Filtro de estado seleccionado */
let selectedEstado: EstadoConteo | '' = '';

/** Filtro de almacén seleccionado */
let selectedAlmacenId = '';

/** Mapa de clases Bootstrap para el badge de estado del conteo */
const ESTADO_BADGE_CLASS: Record<EstadoConteo, string> = {
  planificado: 'bg-secondary',
  en_curso: 'bg-primary',
  pausado: 'bg-warning',
  completado: 'bg-success',
  anulado: 'bg-danger',
};

/**
 * Construye la URL para la petición de conteos con los filtros activos.
 */
function buildConteosUrl(): string {
  let url = '/api/conteos?page=1&pageSize=50';
  if (selectedEstado) {
    url += '&estado=' + encodeURIComponent(selectedEstado);
  }
  if (selectedAlmacenId) {
    url += '&almacenId=' + encodeURIComponent(selectedAlmacenId);
  }
  return url;
}

/**
 * Verifica si hay al menos un filtro activo.
 */
function hasActiveFilters(): boolean {
  return selectedEstado !== '' || selectedAlmacenId !== '';
}

/**
 * Renderiza las filas de la tabla de conteos.
 */
function buildTableRows(conteos: Conteo[]): string {
  if (conteos.length === 0) {
    const clearFiltersLink = hasActiveFilters()
      ? `<br><button type="button" class="btn btn-link btn-sm p-0 mt-2" id="btn-clear-filters">
          Limpiar filtros
        </button>`
      : '';
    return `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          Sin conteos registrados${clearFiltersLink}
        </td>
      </tr>
    `;
  }

  return conteos
    .map((c) => {
      const estadoClass = ESTADO_BADGE_CLASS[c.estado];
      const fechaInicio = c.fechaInicio
        ? new Date(c.fechaInicio).toLocaleDateString('es-AR')
        : '<span class="text-muted">—</span>';
      const fechaCreacion = c.createdAt
        ? new Date(c.createdAt).toLocaleDateString('es-AR')
        : '<span class="text-muted">—</span>';

      return `<tr class="cursor-pointer" style="cursor:pointer;" data-id="${c.id}">
        <td>${c.numero}</td>
        <td>${c.descripcion}</td>
        <td>${c.almacenNombre}</td>
        <td><span class="badge ${estadoClass}">${c.estado}</span></td>
        <td>${fechaInicio}</td>
        <td>${fechaCreacion}</td>
      </tr>`;
    })
    .join('');
}

/**
 * Renderiza el spinner de carga en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#conteos-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-4">
        <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
        Cargando...
      </td>
    </tr>
  `;
}

/**
 * Muestra un mensaje de error en la tabla.
 */
function showTableError(message: string): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#conteos-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="6">
        <div class="alert alert-danger d-flex align-items-center gap-2 m-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Carga y renderiza los conteos con los filtros activos.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<Conteo>>(buildConteosUrl(), { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#conteos-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data);

      // Wiring del botón "Limpiar filtros" en el estado vacío (si está presente)
      const btnClearFilters = tableBody.querySelector<HTMLButtonElement>('#btn-clear-filters');
      if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
          selectedEstado = '';
          selectedAlmacenId = '';

          // Resetear los selects de filtro en la UI
          const estadoFilter = rootContainer?.querySelector<HTMLSelectElement>('#estado-filter');
          if (estadoFilter) estadoFilter.value = '';
          const almacenFilter = rootContainer?.querySelector<HTMLSelectElement>('#almacen-filter');
          if (almacenFilter) almacenFilter.value = '';

          fetchAndRender();
        });
      }

      // Wiring de clic en filas para navegación al detalle
      tableBody.querySelectorAll<HTMLElement>('tr[data-id]').forEach((row) => {
        const id = row.getAttribute('data-id');
        if (id) {
          row.addEventListener('click', () => {
            window.location.hash = '#/conteos/' + id;
          });
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar conteos.';
      showTableError(msg);
    });
}

/**
 * Rellena el select de almacenes en la barra de filtros.
 */
function populateAlmacenesFilter(almacenes: Almacen[]): void {
  const select = rootContainer?.querySelector<HTMLSelectElement>('#almacen-filter');
  if (!select) return;

  const options = almacenes
    .map(
      (a) =>
        `<option value="${a.id}" ${selectedAlmacenId === a.id ? 'selected' : ''}>${a.nombre}</option>`
    )
    .join('');

  select.innerHTML = `<option value="">Todos los almacenes</option>${options}`;
}

/**
 * Renderiza el layout completo de la página de conteos con filtros.
 */
function renderPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado con título y botón crear -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Conteos físicos</h1>
        <button type="button" class="btn btn-primary" id="btn-nuevo-conteo">
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
          Nuevo Conteo
        </button>
      </div>

      <!-- Barra de filtros -->
      <div class="d-flex flex-wrap gap-3 mb-3 align-items-end" id="filter-bar">
        <!-- Filtro por estado -->
        <div>
          <label for="estado-filter" class="form-label small mb-1">Estado</label>
          <select id="estado-filter" class="form-select form-select-sm">
            <option value="">Todos los estados</option>
            <option value="planificado" ${selectedEstado === 'planificado' ? 'selected' : ''}>Planificado</option>
            <option value="en_curso" ${selectedEstado === 'en_curso' ? 'selected' : ''}>En curso</option>
            <option value="pausado" ${selectedEstado === 'pausado' ? 'selected' : ''}>Pausado</option>
            <option value="completado" ${selectedEstado === 'completado' ? 'selected' : ''}>Completado</option>
            <option value="anulado" ${selectedEstado === 'anulado' ? 'selected' : ''}>Anulado</option>
          </select>
        </div>

        <!-- Filtro por almacén (se rellena dinámicamente) -->
        <div>
          <label for="almacen-filter" class="form-label small mb-1">Almacén</label>
          <select id="almacen-filter" class="form-select form-select-sm">
            <option value="">Todos los almacenes</option>
          </select>
        </div>
      </div>

      <!-- Tabla de conteos -->
      <div class="table-responsive" tabindex="0">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Número</th>
              <th>Descripción</th>
              <th>Almacén</th>
              <th>Estado</th>
              <th>Fecha planificada</th>
              <th>Fecha creación</th>
            </tr>
          </thead>
          <tbody id="conteos-tbody">
            <tr>
              <td colspan="6" class="text-center py-4">
                <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
                Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wiring del botón "Nuevo Conteo"
  const btnNuevo = container.querySelector<HTMLButtonElement>('#btn-nuevo-conteo');
  btnNuevo?.addEventListener('click', () => {
    window.location.hash = '#/conteos/nuevo';
  });

  // Wiring del filtro de estado
  const estadoFilter = container.querySelector<HTMLSelectElement>('#estado-filter');
  estadoFilter?.addEventListener('change', () => {
    selectedEstado = (estadoFilter.value as EstadoConteo | '') || '';
    fetchAndRender();
  });

  // Wiring del filtro de almacén
  const almacenFilter = container.querySelector<HTMLSelectElement>('#almacen-filter');
  almacenFilter?.addEventListener('change', () => {
    selectedAlmacenId = almacenFilter.value;
    fetchAndRender();
  });

  // Carga dinámica de almacenes para el filtro
  apiFetch<PaginatedResponse<Almacen>>('/api/almacenes?pageSize=100')
    .then((response) => {
      populateAlmacenesFilter(response.data);
    })
    .catch(() => {
      // Si falla la carga de almacenes, el filtro queda solo con "Todos los almacenes"
    });
}

/** Módulo de página de listado de conteos físicos */
export const conteosPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;
    selectedEstado = '';
    selectedAlmacenId = '';

    renderPage(container);
    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
