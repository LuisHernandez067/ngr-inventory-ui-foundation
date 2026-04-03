// Página de detalle de Rol — muestra nombre, descripción, permisos agrupados por módulo y acciones gateadas
import type { Permiso, Rol } from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Agrupa un array de permisos por su propiedad `modulo`.
 * Retorna un Map con el módulo como clave y sus permisos como valor (orden preservado).
 */
function groupPermisosByModulo(permisos: Permiso[]): Map<string, Permiso[]> {
  const groups = new Map<string, Permiso[]>();
  for (const permiso of permisos) {
    const existing = groups.get(permiso.modulo);
    if (existing) {
      existing.push(permiso);
    } else {
      groups.set(permiso.modulo, [permiso]);
    }
  }
  return groups;
}

/**
 * Genera el HTML de las tarjetas de permisos agrupadas por módulo.
 * Usa badges Bootstrap por permiso dentro de cada grupo.
 */
function buildPermisosSection(permisos: Permiso[]): string {
  if (permisos.length === 0) {
    return `<p class="text-muted fst-italic mb-0">Este rol no tiene permisos asignados.</p>`;
  }

  const groups = groupPermisosByModulo(permisos);
  const groupCards = Array.from(groups.entries())
    .map(([modulo, items]) => {
      const badges = items
        .map(
          (p) => `<span class="badge bg-secondary me-1 mb-1" title="${p.clave}">${p.nombre}</span>`
        )
        .join('');
      return `
        <div class="mb-3">
          <h3 class="h6 text-muted text-uppercase fw-semibold mb-2" style="font-size:0.75rem;letter-spacing:0.05em;">
            ${modulo}
          </h3>
          <div>${badges}</div>
        </div>
      `;
    })
    .join('');

  return groupCards;
}

/**
 * Genera el HTML de una fila definición/valor para la lista de detalles.
 */
function dtRow(label: string, value: string): string {
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${value}</dd>`
  );
}

/**
 * Renderiza el layout completo del detalle del rol.
 */
function renderDetail(container: HTMLElement, rol: Rol): void {
  const canGestionar = authService.hasPermission('roles.gestionar');

  const permisosSection = buildPermisosSection(rol.permisos);

  const infoRows = [
    dtRow('Nombre', rol.nombre),
    dtRow('Descripción', rol.descripcion ?? '—'),
    dtRow(
      'Administrador',
      rol.esAdmin
        ? '<span class="badge bg-danger">Sí</span>'
        : '<span class="badge bg-light text-dark border">No</span>'
    ),
    dtRow('Total de permisos', String(rol.permisos.length)),
    dtRow('Creado por', rol.createdBy ?? '—'),
    dtRow('Actualizado por', rol.updatedBy ?? '—'),
  ].join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 860px;">
      <!-- Barra superior: botón volver -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver a la lista de roles">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Roles
        </button>
      </div>

      <!-- Encabezado: nombre del rol -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0" id="rol-nombre">${rol.nombre}</h1>
        ${
          rol.esAdmin
            ? `<span class="badge bg-danger" aria-label="Rol de administrador">Administrador</span>`
            : ''
        }
      </div>
      ${rol.descripcion ? `<p class="text-muted mb-4">${rol.descripcion}</p>` : '<div class="mb-4"></div>'}

      <!-- Acciones: editar (gateada por permiso) -->
      ${
        canGestionar
          ? `<div class="d-flex gap-2 flex-wrap mb-4" id="rol-actions">
              <a href="#/roles/${rol.id}/editar"
                class="btn btn-primary btn-sm"
                aria-label="Editar rol">
                <i class="bi bi-pencil me-1" aria-hidden="true"></i>
                Editar
              </a>
            </div>`
          : ''
      }

      <div class="row g-3">
        <!-- Información del rol -->
        <div class="col-12 col-md-5">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-shield me-2" aria-hidden="true"></i>
              Información del rol
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${infoRows}
              </dl>
            </div>
          </div>
        </div>

        <!-- Permisos agrupados por módulo -->
        <div class="col-12 col-md-7">
          <div class="card h-100">
            <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
              <span>
                <i class="bi bi-key me-2" aria-hidden="true"></i>
                Permisos asignados
              </span>
              <span class="badge bg-secondary" aria-label="Total de permisos">
                ${String(rol.permisos.length)}
              </span>
            </div>
            <div class="card-body">
              ${permisosSection}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  container.querySelector<HTMLButtonElement>('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/roles';
  });
}

/** Módulo de página de detalle de Rol */
export const rolesDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? '';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Mostrar spinner durante la carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando rol...' })}
      </div>
    `;

    apiFetch<Rol>(`/api/roles/${id}`, { signal })
      .then((rol) => {
        renderDetail(container, rol);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        const is404 = error instanceof ApiError && error.status === 404;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>${is404 ? 'El rol solicitado no existe.' : 'No se pudo cargar el rol.'}</span>
            </div>
            <a href="#/roles" class="btn btn-secondary mt-3">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Roles
            </a>
          </div>
        `;
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
