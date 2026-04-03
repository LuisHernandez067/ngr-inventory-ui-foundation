// Página de lista de Movimientos — módulo personalizado con filtros tipo/estado/search y navegación
import type {
  Movimiento,
  PaginatedResponse,
  TipoMovimiento,
  EstadoMovimiento,
} from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Término de búsqueda actual (número, notas) */
let searchQuery = '';

/** Filtro de tipo seleccionado */
let selectedTipo: TipoMovimiento | '' = '';

/** Filtro de estado seleccionado */
let selectedEstado: EstadoMovimiento | '' = '';

/** Filtro de fecha desde seleccionado */
let selectedFechaDesde = '';

/** Filtro de fecha hasta seleccionado */
let selectedFechaHasta = '';

const tipoColorMap: Record<TipoMovimiento, string> = {
  entrada: 'bg-success',
  salida: 'bg-danger',
  transferencia: 'bg-info text-dark',
  ajuste: 'bg-warning text-dark',
  devolucion: 'bg-secondary',
};

/** Mapa de colores Bootstrap para el estado del movimiento */
const estadoColorMap: Record<EstadoMovimiento, string> = {
  borrador: 'bg-light text-dark border',
  pendiente: 'bg-warning text-dark',
  aprobado: 'bg-info text-dark',
  ejecutado: 'bg-success',
  anulado: 'bg-danger',
};

/**
 * Construye la URL para la petición de movimientos con los filtros activos.
 */
function buildMovimientosUrl(): string {
  let url = '/api/movimientos?page=1&pageSize=50';
  if (searchQuery) {
    url += '&search=' + encodeURIComponent(searchQuery);
  }
  if (selectedTipo) {
    url += '&tipo=' + encodeURIComponent(selectedTipo);
  }
  if (selectedEstado) {
    url += '&estado=' + encodeURIComponent(selectedEstado);
  }
  if (selectedFechaDesde) {
    url += '&fechaDesde=' + encodeURIComponent(selectedFechaDesde);
  }
  if (selectedFechaHasta) {
    url += '&fechaHasta=' + encodeURIComponent(selectedFechaHasta);
  }
  return url;
}

/**
 * Renderiza las filas de la tabla de movimientos.
 */
function buildTableRows(movimientos: Movimiento[]): string {
  if (movimientos.length === 0) {
    return `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">Sin movimientos registrados</td>
      </tr>
    `;
  }

  return movimientos
    .map((m) => {
      const tipoClass = tipoColorMap[m.tipo];
      const estadoClass = estadoColorMap[m.estado];
      const fecha = m.fechaEjecucion
        ? new Date(m.fechaEjecucion).toLocaleDateString('es-CO')
        : '<span class="text-muted">—</span>';
      const almacen =
        m.almacenDestinoNombre ?? m.almacenOrigenNombre ?? '<span class="text-muted">—</span>';
      const totalItems = m.items.length;
      const totalValor = m.items.reduce(
        (acc, item) => acc + item.cantidad * item.precioUnitario,
        0
      );

      return `<tr class="cursor-pointer" style="cursor:pointer;" data-id="${m.id}">
        <td>${m.numero}</td>
        <td><span class="badge ${tipoClass}">${m.tipo}</span></td>
        <td><span class="badge ${estadoClass}">${m.estado}</span></td>
        <td>${fecha}</td>
        <td>${almacen}</td>
        <td>${String(totalItems)}</td>
        <td>${totalValor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</td>
      </tr>`;
    })
    .join('');
}

/**
 * Renderiza el spinner de carga en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#movimientos-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
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
  const tableBody = rootContainer?.querySelector<HTMLElement>('#movimientos-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="7">
        <div class="alert alert-danger d-flex align-items-center gap-2 m-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Carga y renderiza los movimientos con los filtros activos.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<Movimiento>>(buildMovimientosUrl(), { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#movimientos-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data);

      // Wiring de clic en filas para navegación al detalle
      tableBody.querySelectorAll<HTMLElement>('tr[data-id]').forEach((row) => {
        const id = row.getAttribute('data-id');
        if (id) {
          row.addEventListener('click', () => {
            window.location.hash = '#/movimientos/' + id;
          });
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar movimientos.';
      showTableError(msg);
    });
}

/**
 * Renderiza el layout completo de la página de movimientos con filtros.
 */
function renderPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado con título y botón crear -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Movimientos</h1>
        <button type="button" class="btn btn-primary" id="btn-nuevo-movimiento">
          <i class="bi bi-plus-lg" aria-hidden="true"></i>
          Nuevo Movimiento
        </button>
      </div>

      <!-- Barra de filtros -->
      <div class="d-flex flex-wrap gap-3 mb-3 align-items-end" id="filter-bar">
        <!-- Búsqueda libre -->
        <div>
          <label for="movimientos-search" class="form-label small mb-1">Buscar</label>
          <input id="movimientos-search" type="search" class="form-control form-control-sm"
            placeholder="Buscar por número, notas..." value="${searchQuery}" style="min-width:220px;">
        </div>

        <!-- Filtro por tipo -->
        <div>
          <label for="tipo-filter" class="form-label small mb-1">Tipo</label>
          <select id="tipo-filter" class="form-select form-select-sm">
            <option value="">Todos los tipos</option>
            <option value="entrada" ${selectedTipo === 'entrada' ? 'selected' : ''}>Entrada</option>
            <option value="salida" ${selectedTipo === 'salida' ? 'selected' : ''}>Salida</option>
            <option value="transferencia" ${selectedTipo === 'transferencia' ? 'selected' : ''}>Transferencia</option>
            <option value="ajuste" ${selectedTipo === 'ajuste' ? 'selected' : ''}>Ajuste</option>
            <option value="devolucion" ${selectedTipo === 'devolucion' ? 'selected' : ''}>Devolución</option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div>
          <label for="estado-filter" class="form-label small mb-1">Estado</label>
          <select id="estado-filter" class="form-select form-select-sm">
            <option value="">Todos los estados</option>
            <option value="borrador" ${selectedEstado === 'borrador' ? 'selected' : ''}>Borrador</option>
            <option value="pendiente" ${selectedEstado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="aprobado" ${selectedEstado === 'aprobado' ? 'selected' : ''}>Aprobado</option>
            <option value="ejecutado" ${selectedEstado === 'ejecutado' ? 'selected' : ''}>Ejecutado</option>
            <option value="anulado" ${selectedEstado === 'anulado' ? 'selected' : ''}>Anulado</option>
          </select>
        </div>

        <!-- Filtro por fecha desde -->
        <div>
          <label for="fecha-desde" class="form-label small mb-1">Desde</label>
          <input type="date" id="fecha-desde" class="form-control form-control-sm"
            value="${selectedFechaDesde}" />
        </div>

        <!-- Filtro por fecha hasta -->
        <div>
          <label for="fecha-hasta" class="form-label small mb-1">Hasta</label>
          <input type="date" id="fecha-hasta" class="form-control form-control-sm"
            value="${selectedFechaHasta}" />
        </div>
      </div>

      <!-- Tabla de movimientos -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Almacén</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="movimientos-tbody">
            <tr>
              <td colspan="7" class="text-center py-4">
                <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
                Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wiring del botón "Nuevo Movimiento"
  const btnNuevo = container.querySelector<HTMLButtonElement>('#btn-nuevo-movimiento');
  btnNuevo?.addEventListener('click', () => {
    window.location.hash = '#/movimientos/nuevo';
  });

  // Wiring de búsqueda libre
  const searchInput = container.querySelector<HTMLInputElement>('#movimientos-search');
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value;
    fetchAndRender();
  });

  // Wiring del filtro de tipo
  const tipoFilter = container.querySelector<HTMLSelectElement>('#tipo-filter');
  tipoFilter?.addEventListener('change', () => {
    selectedTipo = (tipoFilter.value as TipoMovimiento | '') || '';
    fetchAndRender();
  });

  // Wiring del filtro de estado
  const estadoFilter = container.querySelector<HTMLSelectElement>('#estado-filter');
  estadoFilter?.addEventListener('change', () => {
    selectedEstado = (estadoFilter.value as EstadoMovimiento | '') || '';
    fetchAndRender();
  });

  // Wiring del filtro de fecha desde
  const fechaDesdeInput = container.querySelector<HTMLInputElement>('#fecha-desde');
  fechaDesdeInput?.addEventListener('change', () => {
    selectedFechaDesde = fechaDesdeInput.value;
    fetchAndRender();
  });

  // Wiring del filtro de fecha hasta
  const fechaHastaInput = container.querySelector<HTMLInputElement>('#fecha-hasta');
  fechaHastaInput?.addEventListener('change', () => {
    selectedFechaHasta = fechaHastaInput.value;
    fetchAndRender();
  });
}

/** Módulo de página de listado de movimientos */
export const movimientosPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;
    searchQuery = '';
    selectedTipo = '';
    selectedEstado = '';
    selectedFechaDesde = '';
    selectedFechaHasta = '';

    renderPage(container);
    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
