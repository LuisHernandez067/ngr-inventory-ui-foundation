// Página de lista de Roles — implementación personalizada con navegación al detalle y acción gateada
import type { PaginatedResponse, Rol } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/**
 * Renderiza las filas de la tabla de roles.
 */
function buildTableRows(roles: Rol[]): string {
  if (roles.length === 0) {
    return `
      <tr>
        <td colspan="3" class="text-center text-muted py-4">
          Sin roles registrados
        </td>
      </tr>
    `;
  }

  return roles
    .map(
      (r) => `<tr class="cursor-pointer" style="cursor:pointer;" data-id="${r.id}">
        <td class="fw-semibold">${r.nombre}</td>
        <td>${r.descripcion ?? '<span class="text-muted">—</span>'}</td>
        <td class="text-center">
          <span class="badge bg-info text-dark" aria-label="${String(r.permisos.length)} permisos">
            ${String(r.permisos.length)}
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
  const tableBody = rootContainer?.querySelector<HTMLElement>('#roles-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-4">
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
  const tableBody = rootContainer?.querySelector<HTMLElement>('#roles-tbody');
  if (!tableBody) return;
  tableBody.innerHTML = `
    <tr>
      <td colspan="3">
        <div class="alert alert-danger d-flex align-items-center gap-2 m-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Carga y renderiza los roles.
 */
function fetchAndRender(): void {
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  showTableSpinner();

  apiFetch<PaginatedResponse<Rol>>('/api/roles?page=1&pageSize=50', { signal })
    .then((response) => {
      const tableBody = rootContainer?.querySelector<HTMLElement>('#roles-tbody');
      if (!tableBody) return;
      tableBody.innerHTML = buildTableRows(response.data);

      // Wiring de clic en filas para navegación al detalle
      tableBody.querySelectorAll<HTMLElement>('tr[data-id]').forEach((row) => {
        const id = row.getAttribute('data-id');
        if (id) {
          row.addEventListener('click', () => {
            window.location.hash = '#/roles/' + id;
          });
        }
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;
      const msg = error instanceof Error ? error.message : 'Error al cargar roles.';
      showTableError(msg);
    });
}

/**
 * Renderiza el layout completo de la página de roles.
 */
function renderPage(container: HTMLElement): void {
  const canGestionar = authService.hasPermission('roles.gestionar');

  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado con título y botón crear (gateado por permiso) -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Roles y permisos</h1>
        ${
          canGestionar
            ? `<button type="button" class="btn btn-primary" id="btn-nuevo-rol">
                <i class="bi bi-plus-lg" aria-hidden="true"></i>
                Nuevo Rol
              </button>`
            : ''
        }
      </div>

      <!-- Tabla de roles -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th style="width:200px;">Nombre</th>
              <th>Descripción</th>
              <th style="width:120px;" class="text-center">Nº de permisos</th>
            </tr>
          </thead>
          <tbody id="roles-tbody">
            <tr>
              <td colspan="3" class="text-center py-4">
                <span class="spinner-border spinner-border-sm" role="status" aria-label="Cargando..."></span>
                Cargando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Wiring del botón "Nuevo Rol" (solo si está presente)
  const btnNuevo = container.querySelector<HTMLButtonElement>('#btn-nuevo-rol');
  btnNuevo?.addEventListener('click', () => {
    window.location.hash = '#/roles/nuevo';
  });
}

/** Módulo de página de listado de roles */
export const rolesPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;

    renderPage(container);
    fetchAndRender();
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
