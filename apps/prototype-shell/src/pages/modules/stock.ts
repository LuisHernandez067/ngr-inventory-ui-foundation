// Página de lista de Stock — PageModule personalizado con filtros y badges semánticos
// Read-only: stock se gestiona mediante movimientos (phase-15)
import type {
  Almacen,
  PaginatedResponse,
  StockItem,
  Ubicacion,
} from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Almacén seleccionado actualmente en el filtro */
let selectedAlmacenId = '';

/** Ubicación seleccionada actualmente en el filtro */
let selectedUbicacionId = '';

/** Estado seleccionado: '' | 'disponible' | 'sinstock' */
let selectedEstado = '';

/** Si está activo el filtro de bajo mínimo */
let bajoMinimo = false;

/** productoId pre-filtrado desde la URL hash (viene de stock-consolidado) */
let prefilterProductoId = '';

/** Todas las ubicaciones cargadas para filtrar por almacén */
let allUbicaciones: Ubicacion[] = [];

/**
 * Devuelve un badge HTML según la cantidad disponible.
 * Por-ubicación StockItem no tiene stockMinimo → solo 2 niveles.
 */
function availabilityBadge(cantidadDisponible: number): string {
  if (cantidadDisponible === 0) {
    return '<span class="badge bg-danger">Sin stock</span>';
  }
  return '<span class="badge bg-success">Disponible</span>';
}

/**
 * Construye la URL para la petición de stock con los filtros activos.
 */
function buildStockUrl(): string {
  let url = '/api/stock?page=1&pageSize=50';
  if (selectedAlmacenId) {
    url += '&almacenId=' + encodeURIComponent(selectedAlmacenId);
  }
  if (selectedUbicacionId) {
    url += '&ubicacionId=' + encodeURIComponent(selectedUbicacionId);
  }
  if (prefilterProductoId) {
    url += '&productoId=' + encodeURIComponent(prefilterProductoId);
  }
  if (bajoMinimo) {
    url += '&bajoMinimo=true';
  }
  return url;
}

/**
 * Devuelve las ubicaciones filtradas por el almacén seleccionado.
 */
function getUbicacionesFiltradas(): Ubicacion[] {
  if (!selectedAlmacenId) return allUbicaciones;
  return allUbicaciones.filter((u) => u.almacenId === selectedAlmacenId);
}

/**
 * Filtra localmente los ítems de stock por estado (disponible / sin stock).
 */
function filterByEstado(items: StockItem[]): StockItem[] {
  if (selectedEstado === 'disponible') {
    return items.filter((s) => s.cantidadDisponible > 0);
  }
  if (selectedEstado === 'sinstock') {
    return items.filter((s) => s.cantidadDisponible === 0);
  }
  return items;
}

/**
 * Renderiza las filas de la tabla de stock.
 */
function buildTableRows(items: StockItem[]): string {
  if (items.length === 0) {
    return `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">Sin registros de stock</td>
      </tr>
    `;
  }

  return items
    .map(
      (s) => `<tr data-id="${s.productoId}">
        <td>${s.productoNombre}</td>
        <td>${s.ubicacionNombre ?? '—'}</td>
        <td>${s.almacenNombre}</td>
        <td class="text-end">${String(s.cantidadDisponible)}</td>
        <td>${s.unidadMedida ?? '—'}</td>
        <td>${availabilityBadge(s.cantidadDisponible)}</td>
      </tr>`
    )
    .join('');
}

/**
 * Actualiza las opciones del select de ubicaciones con las filtradas por almacén.
 */
function updateUbicacionesSelect(): void {
  const ubicSelect = rootContainer?.querySelector<HTMLSelectElement>('#ubicacion-filter');
  if (!ubicSelect) return;

  const filtered = getUbicacionesFiltradas();
  const options = filtered
    .map(
      (u) =>
        `<option value="${u.id}" ${u.id === selectedUbicacionId ? 'selected' : ''}>${u.nombre}</option>`
    )
    .join('');

  ubicSelect.innerHTML = '<option value="">Todas las ubicaciones</option>' + options;
}

/**
 * Muestra spinner en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tbody = rootContainer?.querySelector<HTMLElement>('#stock-tbody');
  if (!tbody) return;
  tbody.innerHTML = `
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
  const tbody = rootContainer?.querySelector<HTMLElement>('#stock-tbody');
  if (!tbody) return;
  tbody.innerHTML = `
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
 * Actualiza el banner de productos sin stock.
 * Solo se muestra cuando hay ítems con cantidad === 0.
 */
function updateSinStockBanner(items: StockItem[]): void {
  const bannerContainer = rootContainer?.querySelector<HTMLElement>('#sin-stock-banner');
  if (!bannerContainer) return;
  const sinStockCount = items.filter((s) => s.cantidadDisponible === 0).length;
  if (sinStockCount > 0) {
    bannerContainer.innerHTML = `
      <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
        <span>⚠ ${String(sinStockCount)} producto${sinStockCount === 1 ? '' : 's'} sin stock</span>
      </div>
    `;
  } else {
    bannerContainer.innerHTML = '';
  }
}

/**
 * Carga y renderiza el stock con los filtros activos.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<StockItem>>(buildStockUrl(), { signal })
    .then((response) => {
      const tbody = rootContainer?.querySelector<HTMLElement>('#stock-tbody');
      if (!tbody) return;
      const items = filterByEstado(response.data);
      tbody.innerHTML = buildTableRows(items);
      updateSinStockBanner(response.data);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar el stock.';
      showTableError(msg);
    });
}

/**
 * Construye el HTML para las opciones de almacenes.
 */
function buildAlmacenOptions(almacenes: Almacen[]): string {
  const options = almacenes
    .map(
      (a) =>
        `<option value="${a.id}" ${a.id === selectedAlmacenId ? 'selected' : ''}>${a.nombre}</option>`
    )
    .join('');
  return '<option value="">Todos los almacenes</option>' + options;
}

/**
 * Renderiza el layout completo de la página de stock.
 */
function renderPage(container: HTMLElement, almacenes: Almacen[]): void {
  const almacenOptions = buildAlmacenOptions(almacenes);

  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Stock</h1>
        <a href="#/stock/consolidado" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-table" aria-hidden="true"></i>
          Ver consolidado
        </a>
      </div>

      <!-- Banner de productos sin stock -->
      <div id="sin-stock-banner"></div>

      <!-- Barra de filtros -->
      <div class="d-flex flex-wrap gap-3 mb-3 align-items-end" id="filter-bar">
        <!-- Filtro por almacén -->
        <div>
          <label for="almacen-filter" class="form-label small mb-1">Almacén</label>
          <select id="almacen-filter" class="form-select form-select-sm" style="min-width:200px;">
            ${almacenOptions}
          </select>
        </div>

        <!-- Filtro por ubicación -->
        <div>
          <label for="ubicacion-filter" class="form-label small mb-1">Ubicación</label>
          <select id="ubicacion-filter" class="form-select form-select-sm" style="min-width:200px;">
            <option value="">Todas las ubicaciones</option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div>
          <label for="estado-filter" class="form-label small mb-1">Estado</label>
          <select id="estado-filter" class="form-select form-select-sm" style="min-width:160px;">
            <option value="">Todos</option>
            <option value="disponible" ${selectedEstado === 'disponible' ? 'selected' : ''}>Disponible</option>
            <option value="sinstock" ${selectedEstado === 'sinstock' ? 'selected' : ''}>Sin stock</option>
          </select>
        </div>

        <!-- Checkbox bajo mínimo -->
        <div class="d-flex align-items-center gap-2 pb-1">
          <input type="checkbox" id="bajo-minimo-check" class="form-check-input" ${bajoMinimo ? 'checked' : ''}>
          <label for="bajo-minimo-check" class="form-check-label small">Bajo mínimo</label>
        </div>
      </div>

      <!-- Tabla de stock -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Ubicación</th>
              <th>Almacén</th>
              <th style="width:100px;" class="text-end">Disponible</th>
              <th style="width:100px;">Unidad</th>
              <th style="width:120px;">Estado</th>
            </tr>
          </thead>
          <tbody id="stock-tbody">
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

  // Wiring filtro almacén
  const almacenFilter = container.querySelector<HTMLSelectElement>('#almacen-filter');
  almacenFilter?.addEventListener('change', () => {
    selectedAlmacenId = almacenFilter.value;
    selectedUbicacionId = '';
    updateUbicacionesSelect();
    fetchAndRender();
  });

  // Wiring filtro ubicación
  const ubicFilter = container.querySelector<HTMLSelectElement>('#ubicacion-filter');
  ubicFilter?.addEventListener('change', () => {
    selectedUbicacionId = ubicFilter.value;
    fetchAndRender();
  });

  // Wiring filtro estado
  const estadoFilter = container.querySelector<HTMLSelectElement>('#estado-filter');
  estadoFilter?.addEventListener('change', () => {
    selectedEstado = estadoFilter.value;
    fetchAndRender();
  });

  // Wiring checkbox bajo mínimo
  const bajoMinimoCheck = container.querySelector<HTMLInputElement>('#bajo-minimo-check');
  bajoMinimoCheck?.addEventListener('change', () => {
    bajoMinimo = bajoMinimoCheck.checked;
    fetchAndRender();
  });
}

/** Módulo de página de stock por ubicación */
export const stockPage: PageModule = {
  render(container: HTMLElement, _params?: Record<string, string>): void {
    rootContainer = container;
    selectedAlmacenId = '';
    selectedUbicacionId = '';
    selectedEstado = '';
    bajoMinimo = false;
    allUbicaciones = [];

    // Leer productoId desde el query string del hash (ej: #/stock?productoId=xxx)
    const hashQuery = window.location.hash.split('?')[1] ?? '';
    prefilterProductoId = new URLSearchParams(hashQuery).get('productoId') ?? '';

    // Spinner de carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height:200px;">
        <span class="spinner-border" role="status" aria-label="Cargando..."></span>
      </div>
    `;

    // Mostrar el perfil (para compatibilidad con el módulo — stock es read-only para todos)
    authService.getProfile();

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Cargar almacenes y ubicaciones en paralelo para los filtros
    Promise.all([
      apiFetch<PaginatedResponse<Almacen>>('/api/almacenes?pageSize=100', { signal }),
      apiFetch<PaginatedResponse<Ubicacion>>('/api/ubicaciones?pageSize=100', { signal }),
    ])
      .then(([almacenesResp, ubicacionesResp]) => {
        allUbicaciones = ubicacionesResp.data;
        renderPage(container, almacenesResp.data);
        updateUbicacionesSelect();
        fetchAndRender();
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        // Si fallan los filtros, renderizar sin ellos
        renderPage(container, []);
        fetchAndRender();
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
    allUbicaciones = [];
  },
};
