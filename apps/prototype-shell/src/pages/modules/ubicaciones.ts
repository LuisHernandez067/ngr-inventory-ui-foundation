// Página de lista de Ubicaciones — PageModule personalizado con filtro por almacén
import type { Almacen, PaginatedResponse, Ubicacion } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Almacén seleccionado actualmente en el filtro */
let selectedAlmacenId = '';

/** Término de búsqueda actual */
let searchQuery = '';

/**
 * Construye la URL para la petición de ubicaciones con los filtros activos.
 */
function buildUbicacionesUrl(): string {
  let url = '/api/ubicaciones?page=1&pageSize=50';
  if (selectedAlmacenId) {
    url += '&almacenId=' + encodeURIComponent(selectedAlmacenId);
  }
  if (searchQuery) {
    url += '&search=' + encodeURIComponent(searchQuery);
  }
  return url;
}

/**
 * Renderiza las filas de la tabla de ubicaciones.
 */
function buildTableRows(ubicaciones: Ubicacion[], isConsulta: boolean): string {
  if (ubicaciones.length === 0) {
    return `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">Sin ubicaciones registradas</td>
      </tr>
    `;
  }

  return ubicaciones
    .map(
      (u) =>
        `<tr class="cursor-pointer" style="cursor:pointer;" data-id="${u.id}">
          <td>${u.codigo}</td>
          <td>${u.nombre}</td>
          <td>${u.almacenNombre}</td>
          <td>${u.tipo}</td>
          <td>
            <span class="badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}">
              ${u.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          ${
            isConsulta
              ? ''
              : `<td class="text-end">
              <button class="btn btn-sm btn-outline-danger ubicacion-delete-btn" title="Eliminar">
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
            </td>`
          }
        </tr>`
    )
    .join('');
}

/**
 * Renderiza las opciones del select de almacenes.
 */
function buildAlmacenOptions(almacenes: Almacen[], selectedId: string): string {
  const options = almacenes
    .map(
      (a) => `<option value="${a.id}" ${a.id === selectedId ? 'selected' : ''}>${a.nombre}</option>`
    )
    .join('');
  return `<option value="">Todos los almacenes</option>` + options;
}

/**
 * Renderiza el contenido de la tabla (spinner o filas) en el contenedor de tabla.
 */
function showTableSpinner(): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#ubicaciones-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
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
  const tableBody = rootContainer?.querySelector<HTMLElement>('#ubicaciones-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="5">
        <div class="alert alert-danger d-flex align-items-center gap-2 m-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Carga y renderiza las ubicaciones con los filtros actuales.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<Ubicacion>>(buildUbicacionesUrl(), { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#ubicaciones-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data, authService.getProfile() === 'consulta');

      // Wiring de clic en filas
      tableBody.querySelectorAll<HTMLElement>('tr[data-id]').forEach((row) => {
        const id = row.getAttribute('data-id');
        if (id) {
          row.addEventListener('click', () => {
            window.location.hash = '#/ubicaciones/' + id;
          });
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar ubicaciones.';
      showTableError(msg);
    });
}

/**
 * Maneja la eliminación de una ubicación con diálogo de confirmación.
 */
async function handleDelete(id: string): Promise<void> {
  const confirmed = await ConfirmDialog.confirm({
    title: 'Eliminar ubicación',
    message: '¿Estás seguro? Esta acción no se puede deshacer.',
  });

  if (!confirmed) return;

  try {
    await apiFetch<undefined>(`/api/ubicaciones/${id}`, {
      method: 'DELETE',
      signal: abortController?.signal ?? null,
    });
    fetchAndRender();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;
    showTableError('No se pudo eliminar la ubicación. Intente nuevamente.');
  }
}

/**
 * Renderiza el layout completo de la página de ubicaciones.
 * Carga el select de almacenes y luego las ubicaciones iniciales.
 */
function renderPage(container: HTMLElement, almacenes: Almacen[]): void {
  const isConsulta = authService.getProfile() === 'consulta';
  const almacenOptions = buildAlmacenOptions(almacenes, selectedAlmacenId);

  const createBtnHtml = isConsulta
    ? ''
    : `<a href="#/ubicaciones/nuevo" class="btn btn-primary">
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        Nueva ubicación
      </a>`;

  const deleteColHeader = isConsulta ? '' : '<th style="width:80px;"></th>';

  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado con título y botón crear -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Ubicaciones</h1>
        ${createBtnHtml}
      </div>

      <!-- Barra de filtros -->
      <div class="d-flex flex-wrap gap-3 mb-3 align-items-end" id="filter-bar">
        <!-- Filtro por almacén -->
        <div>
          <label for="almacen-filter" class="form-label small mb-1">Filtrar por almacén</label>
          <select id="almacen-filter" class="form-select form-select-sm" style="min-width:200px;">
            ${almacenOptions}
          </select>
        </div>

        <!-- Búsqueda libre -->
        <div>
          <label for="ubicaciones-search" class="form-label small mb-1">Buscar</label>
          <input id="ubicaciones-search" type="search" class="form-control form-control-sm"
            placeholder="Buscar ubicaciones..." value="${searchQuery}" style="min-width:200px;">
        </div>
      </div>

      <!-- Tabla de ubicaciones -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th style="width:110px;">Código</th>
              <th>Nombre</th>
              <th>Almacén</th>
              <th style="width:100px;">Tipo</th>
              <th style="width:100px;">Estado</th>
              ${deleteColHeader}
            </tr>
          </thead>
          <tbody id="ubicaciones-tbody">
            <tr>
              <td colspan="5" class="text-center py-4">
                <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
                Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wiring del filtro de almacén
  const almacenFilter = container.querySelector<HTMLSelectElement>('#almacen-filter');
  almacenFilter?.addEventListener('change', () => {
    selectedAlmacenId = almacenFilter.value;
    fetchAndRender();
  });

  // Wiring de búsqueda libre
  const searchInput = container.querySelector<HTMLInputElement>('#ubicaciones-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    fetchAndRender();
  });

  // Wiring de botones de eliminación (delegación de eventos en tbody)
  if (!isConsulta) {
    const tbody = container.querySelector<HTMLElement>('#ubicaciones-tbody');
    tbody?.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const deleteBtn = target.closest<HTMLElement>('.ubicacion-delete-btn');
      if (deleteBtn) {
        const row = deleteBtn.closest<HTMLElement>('tr[data-id]');
        const id = row?.getAttribute('data-id');
        if (id) {
          event.stopPropagation();
          void handleDelete(id);
        }
      }
    });
  }
}

/** Módulo de página de listado de ubicaciones */
export const ubicacionesPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;
    selectedAlmacenId = '';
    searchQuery = '';

    // Mostrar spinner de carga inicial mientras se cargan los almacenes
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height:200px;">
        <span class="spinner-border" role="status" aria-label="Cargando..."></span>
      </div>
    `;

    // Cargar almacenes para el filtro
    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    apiFetch<PaginatedResponse<Almacen>>('/api/almacenes?pageSize=100', { signal })
      .then((response) => {
        renderPage(container, response.data);
        fetchAndRender();
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        // Si falla la carga de almacenes, renderizar de todas formas sin el filtro
        renderPage(container, []);
        fetchAndRender();
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
