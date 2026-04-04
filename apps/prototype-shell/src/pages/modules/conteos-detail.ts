// Página de detalle de Conteo físico — muestra header, ítems, estado y botones de transición
import type { Conteo, ConteoItem, EstadoConteo } from '@ngr-inventory/api-contracts';
import { ConfirmDialog, Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Transiciones permitidas por estado — máquina de estados del conteo */
export const ALLOWED: Record<EstadoConteo, EstadoConteo[]> = {
  planificado: ['en_curso', 'anulado'],
  en_curso: ['pausado', 'completado', 'anulado'],
  pausado: ['en_curso', 'anulado'],
  completado: [],
  anulado: [],
};

/** Etiquetas en español para cada transición de estado — indexadas por [fromEstado][toEstado] */
const TRANSITION_LABELS: Partial<Record<EstadoConteo, Partial<Record<EstadoConteo, string>>>> = {
  planificado: { en_curso: 'Iniciar Conteo', anulado: 'Anular' },
  en_curso: { pausado: 'Pausar', completado: 'Completar', anulado: 'Anular' },
  pausado: { en_curso: 'Reanudar', anulado: 'Anular' },
};

/** Nombres legibles en español para cada estado — usados en mensajes de confirmación */
const ESTADO_NOMBRES: Record<EstadoConteo, string> = {
  planificado: 'Planificado',
  en_curso: 'En Curso',
  pausado: 'Pausado',
  completado: 'Completado',
  anulado: 'Anulado',
};

/** Clases Bootstrap para el badge de estado */
const ESTADO_BADGE_CLASS: Record<EstadoConteo, string> = {
  planificado: 'bg-secondary',
  en_curso: 'bg-primary',
  pausado: 'bg-warning',
  completado: 'bg-success',
  anulado: 'bg-danger',
};

/** Transiciones que usan estilo visual de peligro */
const DESTRUCTIVE_TRANSITIONS: EstadoConteo[] = ['anulado'];

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
function dtRow(label: string, value: string): string {
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${value}</dd>`
  );
}

/**
 * Genera el badge de diferencia con color semántico.
 * Verde si sobrante (positivo), rojo si faltante (negativo), gris si sin diferencia (cero).
 */
function buildDiferenciaBadge(item: ConteoItem): string {
  if (item.cantidadContada === undefined || item.diferencia === undefined) {
    return '<span class="text-muted">—</span>';
  }
  if (item.diferencia === 0) {
    return `<span class="badge bg-success">0</span>`;
  }
  if (item.diferencia < 0) {
    // Faltante: se contaron menos unidades de las esperadas
    return `<span class="badge bg-danger">${String(item.diferencia)}</span>`;
  }
  // Sobrante: se contaron más unidades de las esperadas
  return `<span class="badge bg-warning">+${String(item.diferencia)}</span>`;
}

/**
 * Genera el badge de cantidad contada.
 * Muestra '—' si no fue contada aún.
 */
function buildCantidadContadaBadge(item: ConteoItem): string {
  if (item.cantidadContada === undefined) {
    return '<span class="text-muted">—</span>';
  }
  return String(item.cantidadContada);
}

/**
 * Genera la tabla de ítems del conteo con sus diferencias y estado de ajuste.
 */
function buildItemsTable(conteo: Conteo): string {
  if (conteo.items.length === 0) {
    return `<p class="text-muted fst-italic">Sin ítems registrados en este conteo.</p>`;
  }

  const rows = conteo.items
    .map(
      (item) => `<tr>
        <td class="text-muted small">${item.productoCodigo}</td>
        <td>${item.productoNombre}</td>
        <td class="text-end">${String(item.cantidadSistema)}</td>
        <td class="text-end">${buildCantidadContadaBadge(item)}</td>
        <td class="text-end">${buildDiferenciaBadge(item)}</td>
        <td class="text-center">
          ${
            item.ajustado
              ? '<span class="badge bg-success" aria-label="Ítem ajustado">Ajustado</span>'
              : '<span class="badge bg-light text-dark border" aria-label="Ítem sin ajuste">—</span>'
          }
        </td>
      </tr>`
    )
    .join('');

  return `
    <div class="table-responsive" tabindex="0">
      <table class="table table-sm table-hover" id="items-table" aria-label="Ítems del conteo">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th class="text-end">Cant. Sistema</th>
            <th class="text-end">Cant. Contada</th>
            <th class="text-end">Diferencia</th>
            <th class="text-center">Ajustado</th>
          </tr>
        </thead>
        <tbody id="items-tbody">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Verifica si todos los ítems del conteo tienen cantidad contada registrada.
 */
function todosItemsContados(conteo: Conteo): boolean {
  return conteo.items.every((item) => item.cantidadContada !== undefined);
}

/**
 * Genera el HTML de los botones de transición según el estado actual.
 * Las transiciones destructivas usan estilo danger y requieren confirmación explícita.
 */
function buildTransitionButtons(estado: EstadoConteo, id: string, conteo: Conteo): string {
  const transitions = ALLOWED[estado];

  // Para completado: solo mostrar si todos los ítems están contados
  const filteredTransitions = transitions.filter((target) => {
    if (target === 'completado' && !todosItemsContados(conteo)) return false;
    return true;
  });

  const transitionButtons = filteredTransitions
    .map((target) => {
      const isDestructive = DESTRUCTIVE_TRANSITIONS.includes(target);
      const btnClass = isDestructive ? 'btn btn-outline-danger btn-sm' : 'btn btn-primary btn-sm';
      const label = TRANSITION_LABELS[estado]?.[target] ?? target;
      return `<button type="button" class="${btnClass} transition-btn"
        data-target="${target}"
        aria-label="${label} conteo">${label}</button>`;
    })
    .join('');

  // Botón "Cargar Cantidades" — visible solo cuando el conteo está en curso
  const cargarBtn =
    estado === 'en_curso'
      ? `<a href="#/conteos/${id}/carga" class="btn btn-outline-primary btn-sm"
          aria-label="Cargar cantidades contadas">
          <i class="bi bi-input-cursor-text me-1" aria-hidden="true"></i>
          Cargar Cantidades
        </a>`
      : '';

  // Botón "Cerrar Conteo" — visible solo cuando el conteo está completado
  const cerrarBtn =
    estado === 'completado'
      ? `<a href="#/conteos/${id}/cierre" class="btn btn-success btn-sm"
          aria-label="Cerrar conteo y conciliar ajuste">
          <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
          Cerrar y Conciliar
        </a>`
      : '';

  const allButtons = [cargarBtn, transitionButtons, cerrarBtn].filter(Boolean).join('');
  if (!allButtons) return '';

  return `<div class="d-flex gap-2 flex-wrap" id="transition-actions">${allButtons}</div>`;
}

/**
 * Muestra un mensaje de error de transición debajo de los botones de acción.
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
 * Renderiza el resumen de discrepancias para conteos completados.
 */
function buildDiscrepanciasSummary(conteo: Conteo): string {
  if (conteo.estado !== 'completado') return '';

  const itemsConDiferencia = conteo.items.filter(
    (item) => item.diferencia !== undefined && item.diferencia !== 0
  );

  if (itemsConDiferencia.length === 0) {
    return `
      <div class="alert alert-success d-flex align-items-center gap-2 mt-3" role="status">
        <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
        <span>Sin discrepancias — todos los ítems coinciden con el sistema.</span>
      </div>
    `;
  }

  const faltantes = itemsConDiferencia.filter((i) => (i.diferencia ?? 0) < 0).length;
  const sobrantes = itemsConDiferencia.filter((i) => (i.diferencia ?? 0) > 0).length;

  return `
    <div class="alert alert-warning d-flex align-items-center gap-2 mt-3" role="status">
      <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span>
        ${String(itemsConDiferencia.length)} ítem(s) con diferencias:
        ${faltantes > 0 ? `<span class="badge bg-danger ms-1">${String(faltantes)} faltante(s)</span>` : ''}
        ${sobrantes > 0 ? `<span class="badge bg-warning ms-1">${String(sobrantes)} sobrante(s)</span>` : ''}
      </span>
    </div>
  `;
}

/**
 * Renderiza el layout completo del detalle una vez que los datos están disponibles.
 * Se puede llamar de nuevo para re-renderizar tras una transición de estado.
 */
function renderDetail(container: HTMLElement, conteo: Conteo): void {
  const estadoBadgeClass = ESTADO_BADGE_CLASS[conteo.estado];
  const transitionButtons = buildTransitionButtons(conteo.estado, conteo.id, conteo);
  const itemsTable = buildItemsTable(conteo);
  const discrepanciasSummary = buildDiscrepanciasSummary(conteo);

  const metaRows = [
    dtRow('Número', conteo.numero),
    dtRow('Almacén', conteo.almacenNombre),
    dtRow('Descripción', conteo.descripcion),
    dtRow('Fecha inicio', formatFecha(conteo.fechaInicio)),
    dtRow('Fecha fin', formatFecha(conteo.fechaFin)),
    dtRow('Creado por', conteo.createdBy ?? '—'),
    dtRow('Actualizado por', conteo.updatedBy ?? '—'),
  ].join('');

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: botón volver -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver a la lista de conteos">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Conteos
        </button>
      </div>

      <!-- Encabezado: número y estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0" id="conteo-numero">${conteo.numero}</h1>
        <span class="badge ${estadoBadgeClass}" id="estado-badge" role="status"
          aria-label="Estado: ${ESTADO_NOMBRES[conteo.estado]}">${ESTADO_NOMBRES[conteo.estado]}</span>
      </div>
      <p class="text-muted mb-4">${conteo.descripcion}</p>

      <!-- Botones de transición de estado y acciones -->
      ${transitionButtons ? `<div class="mb-4">${transitionButtons}</div>` : ''}

      <!-- Resumen de discrepancias (solo para completados) -->
      ${discrepanciasSummary}

      <!-- Metadatos del conteo -->
      <div class="row g-3 mb-4 mt-0">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
              Información del conteo
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
        <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-list-check me-2" aria-hidden="true"></i>
            Ítems del conteo
          </span>
          <span class="badge bg-secondary" aria-label="Total de ítems">${String(conteo.items.length)} ítem(s)</span>
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
    window.location.hash = '#/conteos';
  });

  // Wiring de los botones de transición — event delegation
  const transitionActionsEl = container.querySelector<HTMLElement>('#transition-actions');
  if (transitionActionsEl) {
    transitionActionsEl.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const btn = target.closest<HTMLButtonElement>('.transition-btn');
      if (!btn) return;
      const targetEstado = btn.getAttribute('data-target') as EstadoConteo | null;
      if (!targetEstado) return;
      void handleTransition(container, conteo.id, conteo.estado, targetEstado);
    });
  }
}

/**
 * Gestiona el flujo de transición de estado: confirmación → PATCH → re-render.
 * Las transiciones destructivas (anular) requieren confirmación explícita.
 */
async function handleTransition(
  container: HTMLElement,
  id: string,
  fromEstado: EstadoConteo,
  targetEstado: EstadoConteo
): Promise<void> {
  const label = TRANSITION_LABELS[fromEstado]?.[targetEstado] ?? targetEstado;
  const nombre = ESTADO_NOMBRES[targetEstado];

  // Confirmar antes de ejecutar cualquier transición
  const confirmed = await ConfirmDialog.confirm({
    title: label,
    message: `¿Confirmás el cambio de estado a "${nombre}"?`,
  });
  if (!confirmed) return;

  try {
    const signal = abortController?.signal ?? null;

    await apiFetch<Conteo>(`/api/conteos/${id}/estado`, {
      method: 'PATCH',
      body: { estado: targetEstado },
      ...(signal ? { signal } : {}),
    });

    // Re-fetch para obtener el estado actualizado y re-renderizar
    const updated = await apiFetch<Conteo>(`/api/conteos/${id}`, {
      ...(signal ? { signal } : {}),
    });

    renderDetail(container, updated);

    // Mover el foco al primer botón de transición visible, o al h1 si no hay botones,
    // para accesibilidad de teclado y lectores de pantalla tras el cambio de estado.
    const firstTransitionBtn = container.querySelector<HTMLElement>('.transition-btn');
    const cerrarLink = container.querySelector<HTMLElement>('a[href*="/cierre"]');
    const cargarLink = container.querySelector<HTMLElement>('a[href*="/carga"]');
    const focusTarget =
      firstTransitionBtn ?? cerrarLink ?? cargarLink ?? container.querySelector<HTMLElement>('h1');
    focusTarget?.focus();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    let message = 'No se pudo cambiar el estado del conteo.';
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = 'Transición no permitida desde el estado actual.';
      } else if (error.status === 422) {
        message = 'No se puede completar el conteo: hay ítems sin cantidad contada registrada.';
      }
    }
    showTransitionError(container, message);
  }
}

/** Módulo de página de detalle de Conteo físico */
export const conteosDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? '';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Mostrar spinner durante la carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando conteo...' })}
      </div>
    `;

    apiFetch<Conteo>(`/api/conteos/${id}`, { signal })
      .then((conteo) => {
        renderDetail(container, conteo);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        const is404 = error instanceof ApiError && error.status === 404;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>${is404 ? 'El conteo solicitado no existe.' : 'No se pudo cargar el conteo.'}</span>
            </div>
            <a href="#/conteos" class="btn btn-secondary mt-3">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Conteos
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
