// Página de lista de Usuarios — implementación personalizada con filtros rol/activo y navegación al detalle
import type { PaginatedResponse, Rol, Usuario } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Filtro de rolId seleccionado */
let selectedRolId = '';

/** Filtro de activo seleccionado */
let selectedActivo = '';

/**
 * Construye la URL para la petición de usuarios con los filtros activos.
 */
function buildUsuariosUrl(): string {
  let url = '/api/usuarios?page=1&pageSize=50';
  if (selectedRolId) {
    url += '&rolId=' + encodeURIComponent(selectedRolId);
  }
  if (selectedActivo) {
    url += '&activo=' + encodeURIComponent(selectedActivo);
  }
  return url;
}

/**
 * Verifica si hay al menos un filtro activo.
 */
function hasActiveFilters(): boolean {
  return selectedRolId !== '' || selectedActivo !== '';
}

/**
 * Renderiza las filas de la tabla de usuarios.
 */
function buildTableRows(usuarios: Usuario[]): string {
  if (usuarios.length === 0) {
    const clearFiltersLink = hasActiveFilters()
      ? `<br><button type="button" class="btn btn-link btn-sm p-0 mt-2" id="btn-clear-filters">
          Limpiar filtros
        </button>`
      : '';
    return `
      <tr>
        <td colspan="4" class="text-center text-muted py-4">
          Sin usuarios registrados${clearFiltersLink}
        </td>
      </tr>
    `;
  }

  return usuarios
    .map(
      (u) => `<tr class="cursor-pointer" style="cursor:pointer;" data-id="${u.id}">
        <td>${u.nombre} ${u.apellido}</td>
        <td>${u.email}</td>
        <td>${u.rolNombre}</td>
        <td>
          <span class="badge ${u.activo ? 'bg-success' : 'bg-secondary'}">
            ${u.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>
      </tr>`
    )
    .join('');
}

/**
 * Renderiza el spinner de carga en el cuerpo de la tabla.
 */
function showTableSpinner(): void {
  const tableBody = rootContainer?.querySelector<HTMLElement>('#usuarios-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="text-center py-4">
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
  const tableBody = rootContainer?.querySelector<HTMLElement>('#usuarios-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="4">
        <div class="alert alert-danger d-flex align-items-center gap-2 m-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Carga y renderiza los usuarios con los filtros activos.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<Usuario>>(buildUsuariosUrl(), { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#usuarios-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data);

      // Wiring del botón "Limpiar filtros" en el estado vacío (si está presente)
      const btnClearFilters = tableBody.querySelector<HTMLButtonElement>('#btn-clear-filters');
      if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
          selectedRolId = '';
          selectedActivo = '';

          // Resetear los selects de filtro en la UI
          const rolFilter = rootContainer?.querySelector<HTMLSelectElement>('#rol-filter');
          if (rolFilter) rolFilter.value = '';
          const activoFilter = rootContainer?.querySelector<HTMLSelectElement>('#activo-filter');
          if (activoFilter) activoFilter.value = '';

          fetchAndRender();
        });
      }

      // Wiring de clic en filas para navegación al detalle
      tableBody.querySelectorAll<HTMLElement>('tr[data-id]').forEach((row) => {
        const id = row.getAttribute('data-id');
        if (id) {
          row.addEventListener('click', () => {
            window.location.hash = '#/usuarios/' + id;
          });
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar usuarios.';
      showTableError(msg);
    });
}

/**
 * Rellena el select de roles en la barra de filtros.
 */
function populateRolesFilter(roles: Rol[]): void {
  const select = rootContainer?.querySelector<HTMLSelectElement>('#rol-filter');
  if (!select) return;

  const options = roles
    .map(
      (r) =>
        `<option value="${r.id}" ${selectedRolId === r.id ? 'selected' : ''}>${r.nombre}</option>`
    )
    .join('');

  select.innerHTML = `<option value="">Todos los roles</option>${options}`;
}

/**
 * Renderiza el layout completo de la página de usuarios con filtros.
 */
function renderPage(container: HTMLElement): void {
  const canGestionar = authService.hasPermission('usuarios.gestionar');

  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado con título y botón crear (gateado por permiso) -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Usuarios</h1>
        ${
          canGestionar
            ? `<button type="button" class="btn btn-primary" id="btn-nuevo-usuario">
                <i class="bi bi-plus-lg" aria-hidden="true"></i>
                Nuevo Usuario
              </button>`
            : ''
        }
      </div>

      <!-- Barra de filtros -->
      <div class="d-flex flex-wrap gap-3 mb-3 align-items-end" id="filter-bar">
        <!-- Filtro por rol (se rellena dinámicamente) -->
        <div>
          <label for="rol-filter" class="form-label small mb-1">Rol</label>
          <select id="rol-filter" class="form-select form-select-sm" style="min-width:180px;">
            <option value="">Todos los roles</option>
          </select>
        </div>

        <!-- Filtro por estado activo -->
        <div>
          <label for="activo-filter" class="form-label small mb-1">Estado</label>
          <select id="activo-filter" class="form-select form-select-sm" style="min-width:160px;">
            <option value="">Todos</option>
            <option value="true" ${selectedActivo === 'true' ? 'selected' : ''}>Activos</option>
            <option value="false" ${selectedActivo === 'false' ? 'selected' : ''}>Inactivos</option>
          </select>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Nombre completo</th>
              <th>Email</th>
              <th style="width:160px;">Rol</th>
              <th style="width:100px;">Estado</th>
            </tr>
          </thead>
          <tbody id="usuarios-tbody">
            <tr>
              <td colspan="4" class="text-center py-4">
                <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
                Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wiring del botón "Nuevo Usuario" (solo si está presente)
  const btnNuevo = container.querySelector<HTMLButtonElement>('#btn-nuevo-usuario');
  btnNuevo?.addEventListener('click', () => {
    window.location.hash = '#/usuarios/nuevo';
  });

  // Wiring del filtro de rol
  const rolFilter = container.querySelector<HTMLSelectElement>('#rol-filter');
  rolFilter?.addEventListener('change', () => {
    selectedRolId = rolFilter.value;
    fetchAndRender();
  });

  // Wiring del filtro de activo
  const activoFilter = container.querySelector<HTMLSelectElement>('#activo-filter');
  activoFilter?.addEventListener('change', () => {
    selectedActivo = activoFilter.value;
    fetchAndRender();
  });

  // Carga dinámica de roles para el filtro
  apiFetch<PaginatedResponse<Rol>>('/api/roles?pageSize=100')
    .then((response) => {
      populateRolesFilter(response.data);
    })
    .catch(() => {
      // Si falla la carga de roles, el filtro queda solo con "Todos los roles"
    });
}

/** Módulo de página de listado de usuarios */
export const usuariosPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;
    selectedRolId = '';
    selectedActivo = '';

    renderPage(container);
    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
