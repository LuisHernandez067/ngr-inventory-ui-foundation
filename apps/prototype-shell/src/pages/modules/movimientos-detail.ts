// Página de detalle de Movimiento — muestra header, ítems, estado y botones de transición
import type { EstadoMovimiento, Movimiento, TipoMovimiento } from '@ngr-inventory/api-contracts';
import { ConfirmDialog, Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Transiciones permitidas por estado — máquina de estados de movimiento */
export const ALLOWED: Record<EstadoMovimiento, EstadoMovimiento[]> = {
  borrador: ['pendiente', 'anulado'],
  pendiente: ['aprobado', 'borrador'],
  aprobado: ['ejecutado', 'anulado'],
  ejecutado: [],
  anulado: [],
};

/** Etiquetas en español para cada transición de estado */
const TRANSITION_LABELS: Record<EstadoMovimiento, string> = {
  pendiente: 'Solicitar Aprobación',
  aprobado: 'Aprobar',
  ejecutado: 'Ejecutar',
  borrador: 'Rechazar',
  anulado: 'Anular',
};

/** Nombres legibles en español para cada estado — usados en mensajes de confirmación */
const ESTADO_NOMBRES: Record<EstadoMovimiento, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  ejecutado: 'Ejecutado',
  borrador: 'Borrador',
  anulado: 'Anulado',
};

/** Clases Bootstrap para el badge de estado */
const ESTADO_BADGE_CLASS: Record<EstadoMovimiento, string> = {
  borrador: 'bg-light text-dark border',
  pendiente: 'bg-warning',
  aprobado: 'bg-info',
  ejecutado: 'bg-success',
  anulado: 'bg-danger',
};

/** Colores Bootstrap para el badge de tipo */
const TIPO_BADGE_CLASS: Record<TipoMovimiento, string> = {
  entrada: 'bg-success',
  salida: 'bg-danger',
  transferencia: 'bg-info',
  ajuste: 'bg-warning',
  devolucion: 'bg-secondary',
};

/**
 * Formatea un valor como moneda COP con separadores de miles.
 */
function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

/**
 * Formatea una fecha ISO a formato legible en es-CO.
 * Retorna un guión si la fecha no está disponible.
 */
function formatFecha(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Genera el HTML de una fila definición/valor para la lista de detalles.
 */
function dtRow(label: string, value: string | undefined): string {
  const display = value ?? '—';
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${display}</dd>`
  );
}

/**
 * Genera el HTML de los botones de transición según el estado actual.
 * Las transiciones destructivas usan estilo danger.
 * Para estado borrador también incluye un botón "Editar".
 */
function buildTransitionButtons(estado: EstadoMovimiento, id: string): string {
  const transitions = ALLOWED[estado];

  /** Transiciones que usan estilo visual de peligro */
  const destructiveStyles: EstadoMovimiento[] = ['anulado', 'borrador'];

  const transitionButtons = transitions
    .map((target) => {
      const isDestructive = destructiveStyles.includes(target);
      const btnClass = isDestructive ? 'btn btn-outline-danger btn-sm' : 'btn btn-primary btn-sm';
      const label = TRANSITION_LABELS[target];
      return `<button type="button" class="${btnClass} transition-btn" data-target="${target}">${label}</button>`;
    })
    .join('');

  // Botón editar visible solo para estado borrador
  const editButton =
    estado === 'borrador'
      ? `<a href="#/movimientos/${id}/editar" class="btn btn-secondary btn-sm">Editar</a>`
      : '';

  if (!transitionButtons && !editButton) return '';

  return `<div class="d-flex gap-2 flex-wrap" id="transition-actions">${editButton}${transitionButtons}</div>`;
}

/**
 * Genera el HTML de la tabla de ítems del movimiento.
 */
function buildItemsTable(movimiento: Movimiento): string {
  if (movimiento.items.length === 0) {
    return `<p class="text-muted fst-italic">Sin ítems registrados</p>`;
  }

  const rows = movimiento.items
    .map((item) => {
      const subtotal = item.cantidad * item.precioUnitario;
      return `<tr>
        <td>${item.productoCodigo}</td>
        <td>${item.productoNombre}</td>
        <td class="text-end">${String(item.cantidad)}</td>
        <td class="text-end">${formatCOP(item.precioUnitario)}</td>
        <td class="text-end">${formatCOP(subtotal)}</td>
      </tr>`;
    })
    .join('');

  const total = movimiento.items.reduce(
    (acc, item) => acc + item.cantidad * item.precioUnitario,
    0
  );

  return `
    <table class="table table-sm table-hover" id="items-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th class="text-end">Cantidad</th>
          <th class="text-end">Precio Unitario</th>
          <th class="text-end">Subtotal</th>
        </tr>
      </thead>
      <tbody id="items-tbody">
        ${rows}
      </tbody>
      <tfoot>
        <tr class="table-light fw-semibold">
          <td colspan="4" class="text-end">Total</td>
          <td class="text-end" id="items-total">${formatCOP(total)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

/**
 * Renderiza el layout completo del detalle una vez que los datos están disponibles.
 * Se puede llamar de nuevo para re-renderizar tras una transición de estado.
 */
function renderDetail(container: HTMLElement, movimiento: Movimiento): void {
  const estadoBadgeClass = ESTADO_BADGE_CLASS[movimiento.estado];
  const tipoBadgeClass = TIPO_BADGE_CLASS[movimiento.tipo];
  const transitionButtons = buildTransitionButtons(movimiento.estado, movimiento.id);
  const itemsTable = buildItemsTable(movimiento);

  // Campos de metadatos condicionales según tipo y disponibilidad
  const metaRows = [
    dtRow('Almacén Origen', movimiento.almacenOrigenNombre),
    dtRow('Almacén Destino', movimiento.almacenDestinoNombre),
    ...(movimiento.proveedorNombre ? [dtRow('Proveedor', movimiento.proveedorNombre)] : []),
    dtRow(
      'Fecha Ejecución',
      movimiento.fechaEjecucion ? formatFecha(movimiento.fechaEjecucion) : undefined
    ),
    dtRow('Observaciones', movimiento.observacion),
    dtRow('Creado por', movimiento.createdBy),
    dtRow('Actualizado por', movimiento.updatedBy),
  ].join('');

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: botón volver -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Movimientos
        </button>
      </div>

      <!-- Encabezado: número, tipo y estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0" id="movimiento-numero">${movimiento.numero}</h1>
        <span class="badge ${tipoBadgeClass}" id="movimiento-tipo">${movimiento.tipo}</span>
        <span class="badge ${estadoBadgeClass}" id="estado-badge">${movimiento.estado}</span>
      </div>
      <p class="text-muted mb-4">ID: ${movimiento.id}</p>

      <!-- Botones de transición de estado -->
      ${transitionButtons ? `<div class="mb-4">${transitionButtons}</div>` : ''}

      <!-- Metadatos del movimiento -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
              Información
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${metaRows}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de ítems -->
      <div class="card">
        <div class="card-header fw-semibold">
          <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
          Ítems del movimiento
        </div>
        <div class="card-body" id="items-container">
          ${itemsTable}
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = '#/movimientos';
  });

  // Wiring de los botones de transición
  const transitionActionsEl = container.querySelector<HTMLElement>('#transition-actions');
  if (transitionActionsEl) {
    transitionActionsEl.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>('.transition-btn');
      if (!btn) return;
      const targetEstado = btn.getAttribute('data-target') as EstadoMovimiento | null;
      if (!targetEstado) return;
      void handleTransition(container, movimiento.id, targetEstado);
    });
  }
}

/**
 * Muestra un mensaje de error en el contenedor cuando la transición de estado falla.
 */
function showTransitionError(container: HTMLElement, message: string): void {
  container.querySelector('#transition-error')?.remove();

  const alert = document.createElement('div');
  alert.id = 'transition-error';
  alert.className = 'alert alert-danger d-flex align-items-center gap-2 mt-3';
  alert.setAttribute('role', 'alert');
  alert.innerHTML =
    '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
    `<span>${message}</span>`;

  const transitionActionsEl = container.querySelector<HTMLElement>('#transition-actions');
  if (transitionActionsEl) {
    transitionActionsEl.insertAdjacentElement('afterend', alert);
  } else {
    const firstCard = container.querySelector<HTMLElement>('.card');
    firstCard?.insertAdjacentElement('beforebegin', alert);
  }
}

/**
 * Gestiona el flujo de transición de estado: confirmación → PATCH → re-render.
 * Todas las transiciones requieren confirmación antes de ejecutarse.
 */
async function handleTransition(
  container: HTMLElement,
  id: string,
  targetEstado: EstadoMovimiento
): Promise<void> {
  const label = TRANSITION_LABELS[targetEstado];
  const nombre = ESTADO_NOMBRES[targetEstado];
  const confirmed = await ConfirmDialog.confirm({
    title: label,
    message: `¿Confirmás el cambio de estado a ${nombre}?`,
  });
  if (!confirmed) return;

  try {
    const signal = abortController?.signal ?? null;
    await apiFetch<Movimiento>(`/api/movimientos/${id}/estado`, {
      method: 'PATCH',
      body: { estado: targetEstado },
      ...(signal ? { signal } : {}),
    });

    // Re-fetch para obtener el estado actualizado y re-renderizar
    const updated = await apiFetch<Movimiento>(`/api/movimientos/${id}`, {
      ...(signal ? { signal } : {}),
    });
    renderDetail(container, updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    let message = 'No se pudo cambiar el estado del movimiento.';
    if (error instanceof ApiError && error.status === 409) {
      message = 'Transición no permitida desde el estado actual.';
    }
    showTransitionError(container, message);
  }
}

/** Módulo de página de detalle de Movimiento */
export const movimientosDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? 'mov-001';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Mostrar spinner durante la carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando movimiento...' })}
      </div>
    `;

    apiFetch<Movimiento>(`/api/movimientos/${id}`, { signal })
      .then((movimiento) => {
        renderDetail(container, movimiento);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar el movimiento.</span>
            </div>
            <a href="#/movimientos" class="btn btn-secondary mt-3">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Movimientos
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
