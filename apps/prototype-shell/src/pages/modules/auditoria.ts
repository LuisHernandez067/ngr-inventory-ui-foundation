// Página de Auditoría — implementación personalizada con 5 filtros y vista de solo lectura
import type { AuditoriaEntry, PaginatedResponse, Usuario } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Estado de los filtros activos */
let filterAccion = '';
let filterModulo = '';
let filterUsuarioId = '';
let filterFechaDesde = '';
let filterFechaHasta = '';

/** Mapa de colores Bootstrap por tipo de acción */
const accionColorMap: Record<string, string> = {
  crear: 'bg-success',
  actualizar: 'bg-info text-dark',
  editar: 'bg-info text-dark',
  eliminar: 'bg-danger',
  login: 'bg-primary',
  logout: 'bg-secondary',
  exportar: 'bg-warning text-dark',
  toggle: 'bg-warning text-dark',
};

/**
 * Construye la URL con los filtros activos para la petición de auditoría.
 */
function buildAuditoriaUrl(): string {
  let url = '/api/auditoria?page=1&pageSize=50';
  if (filterAccion) url += '&accion=' + encodeURIComponent(filterAccion);
  if (filterModulo) url += '&modulo=' + encodeURIComponent(filterModulo);
  if (filterUsuarioId) url += '&usuarioId=' + encodeURIComponent(filterUsuarioId);
  if (filterFechaDesde) url += '&fechaDesde=' + encodeURIComponent(filterFechaDesde);
  if (filterFechaHasta) url += '&fechaHasta=' + encodeURIComponent(filterFechaHasta);
  return url;
}

/**
 * Trunca un texto a la cantidad máxima de caracteres indicada, añadiendo "…" si es necesario.
 */
function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/**
 * Formatea una fecha ISO a fecha+hora legible en es-AR.
 */
function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Renderiza las filas de la tabla de auditoría.
 */
function buildTableRows(entries: AuditoriaEntry[]): string {
  if (entries.length === 0) {
    return `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          No se encontraron registros de auditoría con los filtros aplicados.
        </td>
      </tr>
    `;
  }

  return entries
    .map(
      (e) => `<tr>
        <td style="white-space:nowrap;">${formatFechaHora(e.fecha)}</td>
        <td>${e.usuarioEmail}</td>
        <td>
          <span class="badge ${accionColorMap[e.accion] ?? 'bg-secondary'}">
            ${e.accion}
          </span>
        </td>
        <td>${e.modulo}</td>
        <td>${e.entidadTipo ?? '<span class="text-muted">—</span>'}</td>
        <td title="${e.descripcion}">${truncate(e.descripcion, 60)}</td>
      </tr>`
    )
    .join('');
}

/**
 * Actualiza el contador de resultados en la UI.
 */
function updateResultCount(total: number): void {
  const el = rootContainer?.querySelector<HTMLElement>('#result-count');
  if (!el) return;
  el.textContent = `${String(total)} registro${total !== 1 ? 's' : ''}`;
}

/**
 * Renderiza el spinner de carga en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#auditoria-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-4">
        <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
        Cargando...
      </td>
    </tr>
  `;
  const countEl = rootContainer?.querySelector<HTMLElement>('#result-count');
  if (countEl) countEl.textContent = '';
}

/**
 * Muestra un mensaje de error en la tabla.
 */
function showTableError(message: string): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#auditoria-tbody');
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
 * Carga y renderiza las entradas de auditoría con los filtros activos.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<AuditoriaEntry>>(buildAuditoriaUrl(), { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#auditoria-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data);
      updateResultCount(response.total);
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg =
        error instanceof Error ? error.message : 'Error al cargar el registro de auditoría.';
      showTableError(msg);
    });
}

/**
 * Rellena el select de usuarios en la barra de filtros.
 */
function populateUsuariosFilter(usuarios: Usuario[]): void {
  const select = rootContainer?.querySelector<HTMLSelectElement>('#usuario-filter');
  if (!select) return;

  const options = usuarios
    .map(
      (u) =>
        `<option value="${u.id}" ${filterUsuarioId === u.id ? 'selected' : ''}>${u.nombre} ${u.apellido}</option>`
    )
    .join('');

  select.innerHTML = `<option value="">Todos los usuarios</option>${options}`;
}

/**
 * Renderiza el layout completo de la página de auditoría.
 */
function renderPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">
          <i class="bi bi-journal-text me-2" aria-hidden="true"></i>
          Auditoría
        </h1>
        <span id="result-count" class="text-muted small" aria-live="polite" aria-atomic="true"></span>
      </div>

      <!-- Barra de filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">

            <!-- Filtro: Acción -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label for="accion-filter" class="form-label small mb-1">Acción</label>
              <select id="accion-filter" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="crear"      ${filterAccion === 'crear' ? 'selected' : ''}>crear</option>
                <option value="actualizar" ${filterAccion === 'actualizar' ? 'selected' : ''}>actualizar</option>
                <option value="eliminar"   ${filterAccion === 'eliminar' ? 'selected' : ''}>eliminar</option>
                <option value="login"      ${filterAccion === 'login' ? 'selected' : ''}>login</option>
                <option value="logout"     ${filterAccion === 'logout' ? 'selected' : ''}>logout</option>
                <option value="exportar"   ${filterAccion === 'exportar' ? 'selected' : ''}>exportar</option>
              </select>
            </div>

            <!-- Filtro: Módulo -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label for="modulo-filter" class="form-label small mb-1">Módulo</label>
              <select id="modulo-filter" class="form-select form-select-sm">
                <option value="">Todos</option>
                <option value="auth"         ${filterModulo === 'auth' ? 'selected' : ''}>auth</option>
                <option value="usuarios"     ${filterModulo === 'usuarios' ? 'selected' : ''}>usuarios</option>
                <option value="roles"        ${filterModulo === 'roles' ? 'selected' : ''}>roles</option>
                <option value="productos"    ${filterModulo === 'productos' ? 'selected' : ''}>productos</option>
                <option value="categorias"   ${filterModulo === 'categorias' ? 'selected' : ''}>categorías</option>
                <option value="almacenes"    ${filterModulo === 'almacenes' ? 'selected' : ''}>almacenes</option>
                <option value="movimientos"  ${filterModulo === 'movimientos' ? 'selected' : ''}>movimientos</option>
                <option value="conteos"      ${filterModulo === 'conteos' ? 'selected' : ''}>conteos</option>
                <option value="reportes"     ${filterModulo === 'reportes' ? 'selected' : ''}>reportes</option>
              </select>
            </div>

            <!-- Filtro: Usuario (se rellena dinámicamente) -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <label for="usuario-filter" class="form-label small mb-1">Usuario</label>
              <select id="usuario-filter" class="form-select form-select-sm">
                <option value="">Todos los usuarios</option>
              </select>
            </div>

            <!-- Filtro: Fecha desde -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label for="fecha-desde-filter" class="form-label small mb-1">Fecha desde</label>
              <input
                type="date"
                id="fecha-desde-filter"
                class="form-control form-control-sm"
                value="${filterFechaDesde}"
                aria-label="Filtrar desde fecha"
              />
            </div>

            <!-- Filtro: Fecha hasta -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <label for="fecha-hasta-filter" class="form-label small mb-1">Fecha hasta</label>
              <input
                type="date"
                id="fecha-hasta-filter"
                class="form-control form-control-sm"
                value="${filterFechaHasta}"
                aria-label="Filtrar hasta fecha"
              />
            </div>

            <!-- Botón Filtrar -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-1 d-flex align-items-end">
              <button type="button" id="btn-filtrar" class="btn btn-primary btn-sm w-100">
                <i class="bi bi-funnel-fill me-1" aria-hidden="true"></i>
                Filtrar
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Tabla de auditoría -->
      <div class="table-responsive">
        <table class="table table-hover table-sm">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Módulo</th>
              <th>Entidad</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody id="auditoria-tbody">
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

  // Wiring: botón Filtrar
  container.querySelector<HTMLButtonElement>('#btn-filtrar')?.addEventListener('click', () => {
    filterAccion = container.querySelector<HTMLSelectElement>('#accion-filter')?.value ?? '';
    filterModulo = container.querySelector<HTMLSelectElement>('#modulo-filter')?.value ?? '';
    filterUsuarioId = container.querySelector<HTMLSelectElement>('#usuario-filter')?.value ?? '';
    filterFechaDesde =
      container.querySelector<HTMLInputElement>('#fecha-desde-filter')?.value ?? '';
    filterFechaHasta =
      container.querySelector<HTMLInputElement>('#fecha-hasta-filter')?.value ?? '';
    fetchAndRender();
  });

  // Carga dinámica de usuarios para el filtro de usuarioId
  apiFetch<PaginatedResponse<Usuario>>('/api/usuarios?pageSize=100')
    .then((response) => {
      populateUsuariosFilter(response.data);
    })
    .catch(() => {
      // Si falla la carga de usuarios, el filtro queda solo con "Todos los usuarios"
    });
}

/** Módulo de página de auditoría */
export const auditoriaPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;
    filterAccion = '';
    filterModulo = '';
    filterUsuarioId = '';
    filterFechaDesde = '';
    filterFechaHasta = '';

    renderPage(container);
    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
