// Página de Kardex de Movimientos — selector de producto + tabla de historial
import type { KardexEntry, PaginatedResponse, Producto } from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Colores Bootstrap para el badge de tipo de movimiento */
const TIPO_BADGE_CLASS: Record<string, string> = {
  entrada: 'bg-success',
  salida: 'bg-danger',
  ajuste: 'bg-warning text-dark',
  saldo_inicial: 'bg-info text-dark',
};

/**
 * Formatea un número como moneda COP con separadores de miles.
 * Es-CO / COP — sin decimales para valores de inventario.
 */
function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

/**
 * Formatea una fecha ISO a formato corto legible en es-CO.
 */
function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Construye la opción HTML de un select para un producto.
 */
function productoOption(producto: Producto): string {
  return `<option value="${producto.id}">${producto.codigo} — ${producto.nombre}</option>`;
}

/**
 * Renderiza las filas del tbody de la tabla de kardex.
 * Retorna HTML listo para insertar en el tbody.
 */
function renderKardexRows(entries: KardexEntry[]): string {
  if (entries.length === 0) {
    return `
      <tr id="kardex-empty-row">
        <td colspan="6" class="text-center text-muted fst-italic py-3">
          No hay movimientos para este producto en el período seleccionado
        </td>
      </tr>
    `;
  }

  return entries
    .map((entry) => {
      // Columnas monetarias formateadas en COP
      const entrada =
        entry.cantidadEntrada > 0
          ? `<span class="text-success">${formatCOP(entry.cantidadEntrada * entry.precioUnitario)}</span>`
          : `<span class="text-muted">—</span>`;

      const salida =
        entry.cantidadSalida > 0
          ? `<span class="text-danger">${formatCOP(entry.cantidadSalida * entry.precioUnitario)}</span>`
          : `<span class="text-muted">—</span>`;

      const saldo = formatCOP(entry.saldoActual * entry.precioUnitario);

      const badge = `<span class="badge ${TIPO_BADGE_CLASS[entry.tipo] ?? 'bg-secondary'}">${entry.tipo}</span>`;

      const referencia = entry.movimientoNumero ?? '—';

      return `
        <tr>
          <td>${formatFecha(entry.fecha)}</td>
          <td>${badge}</td>
          <td class="text-end">${entrada}</td>
          <td class="text-end">${salida}</td>
          <td class="text-end fw-semibold">${saldo}</td>
          <td>${referencia}</td>
        </tr>
      `;
    })
    .join('');
}

/**
 * Renderiza la tabla de kardex dentro del contenedor de resultados.
 * Reemplaza cualquier tabla o mensaje previo.
 */
function renderKardexTable(tableArea: HTMLElement, entries: KardexEntry[]): void {
  tableArea.innerHTML = `
    <div class="table-responsive mt-4">
      <table class="table table-sm table-hover table-bordered" id="kardex-table">
        <thead class="table-light">
          <tr>
            <th style="width: 110px;">Fecha</th>
            <th style="width: 120px;">Tipo</th>
            <th style="width: 130px;" class="text-end">Entrada</th>
            <th style="width: 130px;" class="text-end">Salida</th>
            <th style="width: 130px;" class="text-end">Saldo</th>
            <th>Referencia</th>
          </tr>
        </thead>
        <tbody id="kardex-tbody">
          ${renderKardexRows(entries)}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Renderiza un mensaje de error en el área de resultados.
 */
function renderTableError(tableArea: HTMLElement, message: string): void {
  tableArea.innerHTML = `
    <div class="alert alert-danger d-flex align-items-center gap-2 mt-4" role="alert" id="kardex-error">
      <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span>${message}</span>
    </div>
  `;
}

/**
 * Construye la URL de fetch del kardex con los parámetros disponibles.
 * Incluye fechaDesde y fechaHasta solo si están llenos.
 */
function buildKardexUrl(productoId: string, fechaDesde: string, fechaHasta: string): string {
  const params = new URLSearchParams({ productoId });
  if (fechaDesde) {
    params.set('fechaDesde', fechaDesde);
  }
  if (fechaHasta) {
    params.set('fechaHasta', fechaHasta);
  }
  return `/api/kardex?${params.toString()}`;
}

/**
 * Carga el kardex del producto seleccionado y actualiza el área de tabla.
 * Se cancela si el signal es abortado.
 */
function loadKardex(
  tableArea: HTMLElement,
  productoId: string,
  fechaDesde: string,
  fechaHasta: string,
  signal: AbortSignal
): void {
  // Mostrar spinner mientras carga
  tableArea.innerHTML = `
    <div class="d-flex justify-content-center align-items-center py-4 mt-4">
      ${Spinner.render({ size: 'md', label: 'Cargando kardex...' })}
    </div>
  `;

  const url = buildKardexUrl(productoId, fechaDesde, fechaHasta);

  apiFetch<PaginatedResponse<KardexEntry>>(url, { signal })
    .then((response) => {
      renderKardexTable(tableArea, response.data);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      renderTableError(tableArea, 'No se pudo cargar el kardex. Intente nuevamente.');
    });
}

/**
 * Renderiza la página de kardex completa con productos cargados.
 * Incluye el selector de producto y los filtros de fecha opcionales.
 */
function renderPage(container: HTMLElement, productos: Producto[], signal: AbortSignal): void {
  const productosOptions = productos.map((p) => productoOption(p)).join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 1000px;">
      <!-- Encabezado de la página -->
      <div class="mb-4">
        <h1 class="h3 mb-0" id="kardex-title">Kardex de Movimientos</h1>
      </div>

      <!-- Panel de filtros -->
      <div class="card mb-4">
        <div class="card-header fw-semibold">
          <i class="bi bi-funnel me-2" aria-hidden="true"></i>
          Filtros
        </div>
        <div class="card-body">
          <div class="row g-3 align-items-end">

            <!-- Selector de producto -->
            <div class="col-12 col-md-5">
              <label for="producto-select" class="form-label fw-semibold">
                Producto <span class="text-danger" aria-hidden="true">*</span>
              </label>
              <select id="producto-select" class="form-select">
                <option value="">Seleccioná un producto...</option>
                ${productosOptions}
              </select>
            </div>

            <!-- Fecha desde -->
            <div class="col-12 col-md-3">
              <label for="fecha-desde" class="form-label">Fecha desde</label>
              <input type="date" id="fecha-desde" class="form-control" />
            </div>

            <!-- Fecha hasta -->
            <div class="col-12 col-md-3">
              <label for="fecha-hasta" class="form-label">Fecha hasta</label>
              <input type="date" id="fecha-hasta" class="form-control" />
            </div>

          </div>
        </div>
      </div>

      <!-- Área de resultados (tabla o placeholder) -->
      <div id="kardex-table-area">
        <p class="text-muted fst-italic" id="kardex-placeholder">
          Seleccioná un producto para ver su kardex
        </p>
      </div>
    </div>
  `;

  const tableArea = container.querySelector<HTMLElement>('#kardex-table-area');
  if (!tableArea) return;

  const productoSelect = container.querySelector<HTMLSelectElement>('#producto-select');
  if (!productoSelect) return;

  // Wiring: cambio en el selector de producto → cargar kardex
  productoSelect.addEventListener('change', () => {
    const productoId = productoSelect.value;
    if (!productoId) return;

    const fechaDesdeInput = container.querySelector<HTMLInputElement>('#fecha-desde');
    const fechaHastaInput = container.querySelector<HTMLInputElement>('#fecha-hasta');
    const fechaDesde = fechaDesdeInput?.value ?? '';
    const fechaHasta = fechaHastaInput?.value ?? '';

    loadKardex(tableArea, productoId, fechaDesde, fechaHasta, signal);
  });

  // Wiring: cambio en la fecha desde → recargar kardex si hay producto seleccionado
  const fechaDesdeInput = container.querySelector<HTMLInputElement>('#fecha-desde');
  fechaDesdeInput?.addEventListener('change', () => {
    const productoId = productoSelect.value;
    if (!productoId) return;

    const fechaDesde = fechaDesdeInput.value;
    const fechaHastaInput = container.querySelector<HTMLInputElement>('#fecha-hasta');
    const fechaHasta = fechaHastaInput?.value ?? '';

    loadKardex(tableArea, productoId, fechaDesde, fechaHasta, signal);
  });

  // Wiring: cambio en la fecha hasta → recargar kardex si hay producto seleccionado
  const fechaHastaInput = container.querySelector<HTMLInputElement>('#fecha-hasta');
  fechaHastaInput?.addEventListener('change', () => {
    const productoId = productoSelect.value;
    if (!productoId) return;

    const fechaDesde = fechaDesdeInput?.value ?? '';
    const fechaHasta = fechaHastaInput.value;

    loadKardex(tableArea, productoId, fechaDesde, fechaHasta, signal);
  });
}

/**
 * Renderiza el estado de carga inicial.
 * Muestra un spinner mientras se obtienen los productos activos.
 */
function renderLoadingState(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando productos...' })}
    </div>
  `;
}

/**
 * Renderiza el estado de error al cargar productos.
 */
function renderLoadError(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4">
      <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
        <span>No se pudo cargar la página de kardex. Intente nuevamente.</span>
      </div>
    </div>
  `;
}

/** Módulo de página de Kardex de Movimientos */
export const kardexPage: PageModule = {
  render(container: HTMLElement): void {
    // Cancelar cualquier petición anterior
    abortController?.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    // Mostrar spinner mientras cargan los productos
    renderLoadingState(container);

    // Cargar productos activos para poblar el selector
    apiFetch<{ data: Producto[] }>('/api/productos?status=active&pageSize=100', { signal })
      .then((response) => {
        renderPage(container, response.data, signal);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        renderLoadError(container);
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
