// Página de Stock Consolidado — totales por producto en todos los almacenes
// Read-only: stock se gestiona mediante movimientos (phase-15)
import type { PaginatedResponse, StockConsolidado } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/**
 * Devuelve un badge HTML con tres niveles según estado de stock consolidado.
 * - cantidadTotal === 0 → peligro (sin stock)
 * - bajoMinimo === true → advertencia (bajo mínimo)
 * - else → éxito (disponible)
 */
function consolidadoBadge(item: StockConsolidado): string {
  if (item.cantidadTotal === 0) {
    return '<span class="badge bg-danger">Sin stock</span>';
  }
  if (item.bajoMinimo) {
    return '<span class="badge bg-warning text-dark">Bajo mínimo</span>';
  }
  return '<span class="badge bg-success">Disponible</span>';
}

/**
 * Renderiza las filas de la tabla de stock consolidado.
 */
function buildTableRows(items: StockConsolidado[]): string {
  if (items.length === 0) {
    return `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">Sin registros de stock consolidado</td>
      </tr>
    `;
  }

  return items
    .map(
      (s) => `<tr data-producto-id="${s.productoId}">
        <td>${s.productoCodigo}</td>
        <td>${s.productoNombre}</td>
        <td class="text-end">${String(s.cantidadTotal)}</td>
        <td>${consolidadoBadge(s)}</td>
        <td>
          <a href="#/stock?productoId=${encodeURIComponent(s.productoId)}"
             class="btn btn-sm btn-outline-secondary ver-detalle-btn">
            Ver detalle
          </a>
        </td>
      </tr>`
    )
    .join('');
}

/**
 * Muestra spinner en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tbody = rootContainer?.querySelector<HTMLElement>('#consolidado-tbody');
  if (!tbody) return;
  tbody.innerHTML = `
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
  const tbody = rootContainer?.querySelector<HTMLElement>('#consolidado-tbody');
  if (!tbody) return;
  tbody.innerHTML = `
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
 * Carga y renderiza el stock consolidado.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<StockConsolidado>>('/api/stock/consolidado?page=1&pageSize=50', {
    signal,
  })
    .then((response) => {
      const tbody = rootContainer?.querySelector<HTMLElement>('#consolidado-tbody');
      if (!tbody) return;
      tbody.innerHTML = buildTableRows(response.data);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar el stock consolidado.';
      showTableError(msg);
    });
}

/** Módulo de página de stock consolidado por producto */
export const stockConsolidadoPage: PageModule = {
  render(container: HTMLElement, _params?: Record<string, string>): void {
    rootContainer = container;

    container.innerHTML = `
      <div class="p-4">
        <!-- Encabezado -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Stock Consolidado</h1>
          <a href="#/stock" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left" aria-hidden="true"></i>
            Volver
          </a>
        </div>

        <!-- Tabla de stock consolidado -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width:130px;">Código</th>
                <th>Producto</th>
                <th style="width:110px;" class="text-end">Total</th>
                <th style="width:130px;">Estado</th>
                <th style="width:110px;"></th>
              </tr>
            </thead>
            <tbody id="consolidado-tbody">
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

    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
