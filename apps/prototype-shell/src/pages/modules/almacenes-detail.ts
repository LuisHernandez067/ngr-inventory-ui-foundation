// Página de detalle de Almacén — muestra información completa con ubicaciones embebidas
import type { Almacen, Ubicacion } from '@ngr-inventory/api-contracts';
import { Spinner, Badge, ConfirmDialog } from '@ngr-inventory/ui-core';
import type { BadgeVariant } from '@ngr-inventory/ui-core';
import { ActionMenu } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch, ApiError } from '../_shared/apiFetch';

/** Almacén con campo adicional ubicacionCount retornado por MSW GET /:id */
type AlmacenWithCount = Almacen & { ubicacionCount: number };

/** Controlador de cancelación para los fetches en vuelo */
let abortController: AbortController | null = null;

/** Mapeo de estado de almacén a variante de Bootstrap Badge */
const STATUS_VARIANT: Record<Almacen['status'], BadgeVariant> = {
  active: 'success',
  inactive: 'secondary',
};

/** Mapeo de estado de almacén a etiqueta en español */
const STATUS_LABEL: Record<Almacen['status'], string> = {
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
    '<span>No se pudo eliminar el almacén. Intente nuevamente.</span>';

  const topBar = container.querySelector<HTMLElement>(
    '.d-flex.align-items-center.justify-content-between'
  );
  topBar?.insertAdjacentElement('afterend', alert);
}

/**
 * Construye el mensaje de confirmación para eliminación de almacén.
 * Si tiene ubicaciones asociadas, incluye la advertencia de impacto.
 */
function buildDeleteMessage(ubicacionCount: number): string {
  if (ubicacionCount > 0) {
    return `Este almacén tiene ${String(ubicacionCount)} ubicación(es) asociada(s). Eliminar el almacén puede afectar el inventario. ¿Deseas continuar?`;
  }
  return '¿Estás seguro? Esta acción no se puede deshacer.';
}

/**
 * Gestiona el flujo completo de confirmación y eliminación de un almacén.
 * Incluye advertencia de impacto cuando tiene ubicaciones asociadas.
 */
async function handleDelete(
  container: HTMLElement,
  id: string,
  ubicacionCount: number,
  signal: AbortSignal | undefined
): Promise<void> {
  const message = buildDeleteMessage(ubicacionCount);

  const confirmed = await ConfirmDialog.confirm({
    title: 'Eliminar almacén',
    message,
  });

  if (!confirmed) return;

  try {
    await apiFetch<undefined>(`/api/almacenes/${id}`, {
      method: 'DELETE',
      signal: signal ?? null,
    });
    window.location.hash = '#/almacenes';
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    if (error instanceof ApiError && error.status === 409) {
      // 409 — tiene ubicaciones asociadas
      container.querySelector('#delete-error')?.remove();
      const alert = document.createElement('div');
      alert.id = 'delete-error';
      alert.className = 'alert alert-warning d-flex align-items-center gap-2 mt-3';
      alert.setAttribute('role', 'alert');
      alert.innerHTML =
        '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
        '<span>No se puede eliminar el almacén porque tiene ubicaciones asociadas. Elimine las ubicaciones primero.</span>';
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
 * Genera la alerta de impacto cuando el almacén tiene ubicaciones asociadas.
 */
function buildImpactAlert(count: number): string {
  if (count === 0) return '';
  const noun = count === 1 ? 'ubicación asociada' : 'ubicaciones asociadas';
  return `
    <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert" id="impact-warning">
      <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span>Este almacén tiene ${String(count)} ${noun}. Eliminar el almacén afectará el inventario.</span>
    </div>
  `;
}

/**
 * Genera el HTML de la mini-tabla de ubicaciones embebidas.
 */
function buildUbicacionesTable(ubicaciones: Ubicacion[]): string {
  if (ubicaciones.length === 0) {
    return `<p class="text-muted fst-italic">Sin ubicaciones registradas</p>`;
  }

  const rows = ubicaciones
    .map(
      (u) =>
        `<tr class="cursor-pointer" data-ubicacion-id="${u.id}" style="cursor:pointer;">
          <td>${u.nombre}</td>
          <td><span class="badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}">${u.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
        </tr>`
    )
    .join('');

  return `
    <table class="table table-sm table-hover">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/**
 * Renderiza el layout completo del detalle de almacén una vez que los datos están disponibles.
 */
function renderDetail(
  container: HTMLElement,
  almacen: AlmacenWithCount,
  ubicaciones: Ubicacion[]
): void {
  const profile = authService.getProfile();
  const isConsulta = profile === 'consulta';

  const statusVariant = STATUS_VARIANT[almacen.status];
  const statusLabel = STATUS_LABEL[almacen.status];
  const statusBadge = Badge.render({ variant: statusVariant, text: statusLabel, pill: true });

  const impactAlert = buildImpactAlert(almacen.ubicacionCount);

  const actionMenuHtml = isConsulta
    ? ''
    : ActionMenu.render({
        id: 'almacen-actions',
        size: 'sm',
        items: [
          { id: 'edit', label: 'Editar', icon: 'pencil' },
          { id: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
        ],
      });

  const ubicacionesTableHtml = buildUbicacionesTable(ubicaciones);

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: botón volver + acciones -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Almacenes
        </button>
        <div class="d-flex align-items-center gap-2">
          ${actionMenuHtml}
        </div>
      </div>

      <!-- Encabezado con nombre y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0">${almacen.nombre}</h1>
        ${statusBadge}
      </div>
      <p class="text-muted mb-3">Código: ${almacen.codigo}</p>

      <!-- Alerta de impacto cuando hay ubicaciones asociadas -->
      ${impactAlert}

      <!-- Tarjeta de información del almacén -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-building me-2" aria-hidden="true"></i>
              Información
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Código', almacen.codigo)}
                ${dtRow('Nombre', almacen.nombre)}
                ${dtRow('Descripción', almacen.descripcion)}
                ${dtRow('Dirección', almacen.direccion)}
                ${dtRow('Responsable', almacen.responsableNombre)}
                ${dtRow('Estado', statusLabel)}
                ${dtRow('Ubicaciones', String(almacen.ubicacionCount))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de ubicaciones embebidas -->
      <div class="card">
        <div class="card-header fw-semibold">
          <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
          Ubicaciones
        </div>
        <div class="card-body" id="ubicaciones-container">
          ${ubicacionesTableHtml}
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = '#/almacenes';
  });

  // Wiring de las filas de ubicaciones — navega al detalle de cada una
  const ubicacionesContainer = container.querySelector<HTMLElement>('#ubicaciones-container');
  if (ubicacionesContainer) {
    ubicacionesContainer.querySelectorAll<HTMLElement>('tr[data-ubicacion-id]').forEach((row) => {
      const ubicacionId = row.getAttribute('data-ubicacion-id');
      if (ubicacionId) {
        row.addEventListener('click', () => {
          window.location.hash = '#/ubicaciones/' + ubicacionId;
        });
      }
    });
  }

  // Inicializar ActionMenu solo si fue renderizado (rol no-consulta)
  if (!isConsulta) {
    const actionMenuRoot = container.querySelector<HTMLElement>('#almacen-actions');
    if (actionMenuRoot) {
      ActionMenu.init(actionMenuRoot);

      actionMenuRoot.addEventListener('ngr:action', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: string }>;
        if (customEvent.detail.id === 'edit') {
          window.location.hash = '#/almacenes/' + almacen.id + '/editar';
        } else if (customEvent.detail.id === 'delete') {
          void handleDelete(container, almacen.id, almacen.ubicacionCount, abortController?.signal);
        }
      });
    }
  }
}

/** Página de detalle de Almacén */
export const almacenesDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? 'alm-001';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando almacén...' })}
      </div>
    `;

    // Obtener detalle del almacén primero, luego sus ubicaciones
    apiFetch<AlmacenWithCount>(`/api/almacenes/${id}`, { signal })
      .then((almacen) =>
        apiFetch<{ data: Ubicacion[] }>(`/api/ubicaciones?almacenId=${id}&pageSize=100`, {
          signal,
        }).then((ubicacionesResponse) => {
          renderDetail(container, almacen, ubicacionesResponse.data);
        })
      )
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar el almacén.</span>
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
