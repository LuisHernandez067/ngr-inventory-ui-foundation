// Página de detalle de Ubicación — muestra información completa con enlace al almacén padre
import type { Ubicacion } from '@ngr-inventory/api-contracts';
import { Spinner, Badge, ConfirmDialog } from '@ngr-inventory/ui-core';
import type { BadgeVariant } from '@ngr-inventory/ui-core';
import { ActionMenu } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch, ApiError } from '../_shared/apiFetch';

/** Controlador de cancelación para los fetches en vuelo */
let abortController: AbortController | null = null;

/** Mapeo de estado a variante de Bootstrap Badge */
const STATUS_VARIANT: Record<'active' | 'inactive', BadgeVariant> = {
  active: 'success',
  inactive: 'secondary',
};

/** Mapeo de estado a etiqueta en español */
const STATUS_LABEL: Record<'active' | 'inactive', string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

/**
 * Genera el HTML de un par definición/valor para la lista de detalles.
 * Muestra un guión cuando el valor está ausente.
 */
function dtRow(label: string, value: string | undefined): string {
  const display = value ?? '—';
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${display}</dd>`
  );
}

/**
 * Muestra un mensaje de error inline en el contenedor cuando la eliminación falla.
 */
function showDeleteError(container: HTMLElement): void {
  container.querySelector('#delete-error')?.remove();

  const alert = document.createElement('div');
  alert.id = 'delete-error';
  alert.className = 'alert alert-danger d-flex align-items-center gap-2 mt-3';
  alert.setAttribute('role', 'alert');
  alert.innerHTML =
    '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
    '<span>No se pudo eliminar la ubicación. Intente nuevamente.</span>';

  const topBar = container.querySelector<HTMLElement>(
    '.d-flex.align-items-center.justify-content-between'
  );
  topBar?.insertAdjacentElement('afterend', alert);
}

/**
 * Gestiona el flujo completo de confirmación y eliminación de una ubicación.
 */
async function handleDelete(container: HTMLElement, id: string): Promise<void> {
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
    window.location.hash = '#/ubicaciones';
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    if (error instanceof ApiError && error.status === 409) {
      container.querySelector('#delete-error')?.remove();
      const alert = document.createElement('div');
      alert.id = 'delete-error';
      alert.className = 'alert alert-warning d-flex align-items-center gap-2 mt-3';
      alert.setAttribute('role', 'alert');
      alert.innerHTML =
        '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
        '<span>No se puede eliminar la ubicación. Verifique las dependencias.</span>';
      const topBar = container.querySelector<HTMLElement>(
        '.d-flex.align-items-center.justify-content-between'
      );
      topBar?.insertAdjacentElement('afterend', alert);
    } else {
      showDeleteError(container);
    }
  }
}

/**
 * Renderiza el layout completo del detalle de ubicación una vez que los datos están disponibles.
 */
function renderDetail(container: HTMLElement, ubicacion: Ubicacion): void {
  const profile = authService.getProfile();
  const isConsulta = profile === 'consulta';

  const statusVariant = STATUS_VARIANT[ubicacion.status];
  const statusLabel = STATUS_LABEL[ubicacion.status];
  const statusBadge = Badge.render({ variant: statusVariant, text: statusLabel, pill: true });

  const actionMenuHtml = isConsulta
    ? ''
    : ActionMenu.render({
        id: 'ubicacion-actions',
        size: 'sm',
        items: [
          { id: 'edit', label: 'Editar', icon: 'pencil' },
          { id: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
        ],
      });

  // Enlace al almacén padre
  const almacenLink = `<a href="#/almacenes/${ubicacion.almacenId}" class="text-decoration-none">${ubicacion.almacenNombre}</a>`;

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: botón volver + acciones -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Ubicaciones
        </button>
        <div class="d-flex align-items-center gap-2">
          ${actionMenuHtml}
        </div>
      </div>

      <!-- Encabezado con nombre y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0">${ubicacion.nombre}</h1>
        ${statusBadge}
      </div>
      <p class="text-muted mb-3">Código: ${ubicacion.codigo}</p>

      <!-- Tarjeta de información de la ubicación -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
              Información
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Código', ubicacion.codigo)}
                ${dtRow('Nombre', ubicacion.nombre)}
                ${dtRow('Tipo', ubicacion.tipo)}
                ${dtRow('Capacidad', ubicacion.capacidad !== undefined ? String(ubicacion.capacidad) : undefined)}
                ${dtRow('Estado', statusLabel)}
              </dl>
            </div>
          </div>
        </div>

        <!-- Tarjeta del almacén padre -->
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-building me-2" aria-hidden="true"></i>
              Almacén
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-sm-5 text-muted fw-normal">Almacén padre</dt>
                <dd class="col-sm-7 fw-semibold mb-2" id="almacen-link-container">${almacenLink}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = '#/ubicaciones';
  });

  // Inicializar ActionMenu solo si fue renderizado (rol no-consulta)
  if (!isConsulta) {
    const actionMenuRoot = container.querySelector<HTMLElement>('#ubicacion-actions');
    if (actionMenuRoot) {
      ActionMenu.init(actionMenuRoot);

      actionMenuRoot.addEventListener('ngr:action', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: string }>;
        if (customEvent.detail.id === 'edit') {
          window.location.hash = '#/ubicaciones/' + ubicacion.id + '/editar';
        } else if (customEvent.detail.id === 'delete') {
          void handleDelete(container, ubicacion.id);
        }
      });
    }
  }
}

/** Página de detalle de Ubicación */
export const ubicacionesDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? 'ubi-001';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando ubicación...' })}
      </div>
    `;

    apiFetch<Ubicacion>(`/api/ubicaciones/${id}`, { signal })
      .then((ubicacion) => {
        renderDetail(container, ubicacion);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar la ubicación.</span>
            </div>
          </div>
        `;
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
