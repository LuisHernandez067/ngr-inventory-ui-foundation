// Página de cierre de conteo — muestra diff de discrepancias y permite confirmar el ajuste
import type { CierreConteoResult, Conteo, ConteoItem } from '@ngr-inventory/api-contracts';
import { ConfirmDialog, Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Calcula las estadísticas de resumen del conteo:
 * total ítems, con discrepancia, sin discrepancia, faltantes, sobrantes.
 */
interface ResumenConteo {
  total: number;
  sinDiscrepancia: number;
  conDiscrepancia: number;
  faltantes: number;
  sobrantes: number;
}

function calcularResumen(items: ConteoItem[]): ResumenConteo {
  const conDiscrepancia = items.filter(
    (item) => item.diferencia !== undefined && item.diferencia !== 0
  );
  const sinDiscrepancia = items.filter(
    (item) => item.diferencia === undefined || item.diferencia === 0
  );
  const faltantes = conDiscrepancia.filter((item) => (item.diferencia ?? 0) < 0);
  const sobrantes = conDiscrepancia.filter((item) => (item.diferencia ?? 0) > 0);

  return {
    total: items.length,
    sinDiscrepancia: sinDiscrepancia.length,
    conDiscrepancia: conDiscrepancia.length,
    faltantes: faltantes.length,
    sobrantes: sobrantes.length,
  };
}

/**
 * Genera el badge de diferencia con semántica visual clara.
 * Verde = sin diferencia, rojo = faltante (negativo), verde = sobrante (positivo).
 */
function buildDiferenciaBadge(item: ConteoItem): string {
  if (item.cantidadContada === undefined || item.diferencia === undefined) {
    return '<span class="text-muted">—</span>';
  }
  if (item.diferencia === 0) {
    return `<span class="badge bg-success">0</span>`;
  }
  if (item.diferencia < 0) {
    return `<span class="badge bg-danger">${String(item.diferencia)}</span>`;
  }
  return `<span class="badge bg-success">+${String(item.diferencia)}</span>`;
}

/**
 * Genera el badge de severidad para cada ítem.
 * OK = sin diferencia, Faltante = negativo, Sobrante = positivo.
 */
function buildSeverityBadge(item: ConteoItem): string {
  if (item.cantidadContada === undefined || item.diferencia === undefined) {
    return '<span class="badge bg-secondary">Sin contar</span>';
  }
  if (item.diferencia === 0) {
    return '<span class="badge bg-success">OK</span>';
  }
  if (item.diferencia < 0) {
    return '<span class="badge bg-danger">Faltante</span>';
  }
  return '<span class="badge bg-success">Sobrante</span>';
}

/**
 * Genera la clase de fila de la tabla según la severidad de la discrepancia.
 * Sin diferencia = normal, faltante = table-danger, sobrante = table-success.
 */
function buildRowClass(item: ConteoItem): string {
  if (item.diferencia === undefined || item.diferencia === 0) return '';
  if (item.diferencia < 0) return 'table-danger';
  return 'table-success';
}

/**
 * Genera la tabla de diff de discrepancias con todas las columnas del diseño.
 */
function buildDiffTable(conteo: Conteo): string {
  if (conteo.items.length === 0) {
    return `<p class="text-muted fst-italic">Sin ítems registrados en este conteo.</p>`;
  }

  const rows = conteo.items
    .map(
      (item: ConteoItem) => `<tr class="${buildRowClass(item)}">
        <td>
          <span class="text-muted small d-block">${item.productoCodigo}</span>
          <span>${item.productoNombre}</span>
        </td>
        <td class="text-end align-middle">${String(item.cantidadSistema)}</td>
        <td class="text-end align-middle">
          ${item.cantidadContada !== undefined ? String(item.cantidadContada) : '<span class="text-muted">—</span>'}
        </td>
        <td class="text-end align-middle">${buildDiferenciaBadge(item)}</td>
        <td class="text-center align-middle">${buildSeverityBadge(item)}</td>
      </tr>`
    )
    .join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover" id="diff-table" aria-label="Tabla de discrepancias del conteo">
        <thead class="table-light">
          <tr>
            <th scope="col">Producto</th>
            <th scope="col" class="text-end" style="width: 120px;">Cant. Sistema</th>
            <th scope="col" class="text-end" style="width: 120px;">Cant. Contada</th>
            <th scope="col" class="text-end" style="width: 100px;">Diferencia</th>
            <th scope="col" class="text-center" style="width: 110px;">Severidad</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Genera las tarjetas de resumen estadístico del conteo.
 */
function buildSummaryCards(resumen: ResumenConteo): string {
  return `
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card text-center h-100">
          <div class="card-body py-3">
            <p class="text-muted small mb-1">Total Ítems</p>
            <p class="fs-3 fw-bold mb-0">${String(resumen.total)}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center h-100 border-success">
          <div class="card-body py-3">
            <p class="text-muted small mb-1">Sin Discrepancia</p>
            <p class="fs-3 fw-bold text-success mb-0">${String(resumen.sinDiscrepancia)}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center h-100 border-danger">
          <div class="card-body py-3">
            <p class="text-muted small mb-1">Faltantes</p>
            <p class="fs-3 fw-bold text-danger mb-0">${String(resumen.faltantes)}</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center h-100 border-warning">
          <div class="card-body py-3">
            <p class="text-muted small mb-1">Sobrantes</p>
            <p class="fs-3 fw-bold text-warning mb-0">${String(resumen.sobrantes)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la página completa de cierre con el conteo ya cargado.
 */
function renderCierre(container: HTMLElement, conteo: Conteo): void {
  const resumen = calcularResumen(conteo.items);
  const summaryCards = buildSummaryCards(resumen);
  const diffTable = buildDiffTable(conteo);

  // Advertencia si el conteo no está en estado completado
  const notCompletadoAlert =
    conteo.estado !== 'completado'
      ? `<div class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>
            El conteo debe estar en estado <strong>Completado</strong> para poder cerrarse.
            Estado actual: <strong>${conteo.estado}</strong>.
          </span>
        </div>`
      : '';

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al detalle del conteo">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver al Conteo
        </button>
        <h1 class="h3 mb-0">Cierre de Conteo</h1>
      </div>

      <!-- Encabezado del conteo (read-only) -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <span class="text-muted small">Número</span>
              <p class="fw-semibold mb-0">${conteo.numero}</p>
            </div>
            <div class="vr d-none d-md-block"></div>
            <div>
              <span class="text-muted small">Descripción</span>
              <p class="fw-semibold mb-0">${conteo.descripcion}</p>
            </div>
            <div class="vr d-none d-md-block"></div>
            <div>
              <span class="text-muted small">Almacén</span>
              <p class="fw-semibold mb-0">${conteo.almacenNombre}</p>
            </div>
            <div class="ms-auto">
              <span class="badge ${conteo.estado === 'completado' ? 'bg-success' : 'bg-warning text-dark'}"
                aria-label="Estado: ${conteo.estado}">
                ${conteo.estado === 'completado' ? 'Completado' : conteo.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      ${notCompletadoAlert}

      <!-- Tarjetas de resumen -->
      ${summaryCards}

      <!-- Área de resultado de cierre (se inserta dinámicamente) -->
      <div id="cierre-result-container"></div>

      <!-- Alerta de error (se inserta dinámicamente) -->
      <div id="cierre-error-container"></div>

      <!-- Tabla de discrepancias -->
      <div class="card mb-4">
        <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-table me-2" aria-hidden="true"></i>
            Detalle de Discrepancias
          </span>
          <span class="badge bg-secondary" aria-label="Total de ítems">${String(conteo.items.length)} ítem(s)</span>
        </div>
        <div class="card-body p-0">
          ${diffTable}
        </div>
      </div>

      <!-- Alerta informativa sobre el ajuste -->
      <div class="alert alert-info d-flex align-items-start gap-2 mb-4" role="note">
        <i class="bi bi-info-circle-fill flex-shrink-0 mt-1" aria-hidden="true"></i>
        <span>
          El cierre generará un movimiento de ajuste automático para los ítems con discrepancia.
          ${resumen.conDiscrepancia === 0 ? 'Este conteo no tiene discrepancias — no se generará ningún ajuste.' : ''}
        </span>
      </div>

      <!-- Campo de observación opcional -->
      <div class="mb-4">
        <label for="observacion-cierre" class="form-label fw-semibold">Observación (opcional)</label>
        <textarea id="observacion-cierre" class="form-control" rows="2"
          placeholder="Agregar observación sobre el cierre..." aria-label="Observación del cierre"></textarea>
      </div>

      <!-- Botones de acción -->
      <div class="d-flex gap-2">
        <button id="btn-confirmar" type="button" class="btn btn-success"
          ${conteo.estado !== 'completado' ? 'disabled' : ''}
          aria-label="Confirmar cierre y generar ajuste">
          <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
          Confirmar Cierre
        </button>
        <button id="btn-cancelar" type="button" class="btn btn-outline-secondary"
          aria-label="Cancelar y volver al detalle del conteo">
          Cancelar
        </button>
      </div>
    </div>
  `;

  // Wiring: botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = `#/conteos/${conteo.id}`;
  });

  // Wiring: botón cancelar
  const btnCancelar = container.querySelector<HTMLButtonElement>('#btn-cancelar');
  btnCancelar?.addEventListener('click', () => {
    window.location.hash = `#/conteos/${conteo.id}`;
  });

  // Wiring: botón confirmar cierre
  const btnConfirmar = container.querySelector<HTMLButtonElement>('#btn-confirmar');
  if (!btnConfirmar || conteo.estado !== 'completado') return;

  btnConfirmar.addEventListener('click', () => {
    void handleConfirmarCierre(container, conteo, btnConfirmar);
  });
}

/**
 * Gestiona el flujo de confirmación del cierre:
 * ConfirmDialog → POST cierre → mostrar resultado → navegar.
 */
async function handleConfirmarCierre(
  container: HTMLElement,
  conteo: Conteo,
  btnConfirmar: HTMLButtonElement
): Promise<void> {
  // Confirmar acción destructiva con ConfirmDialog
  const confirmed = await ConfirmDialog.confirm({
    title: 'Confirmar Cierre de Conteo',
    message:
      '¿Confirmás el cierre de este conteo? Se generará un movimiento de ajuste para los ítems con diferencias.',
  });
  if (!confirmed) return;

  // Limpiar errores previos
  const errorContainer = container.querySelector<HTMLElement>('#cierre-error-container');
  const resultContainer = container.querySelector<HTMLElement>('#cierre-result-container');
  if (errorContainer) errorContainer.innerHTML = '';
  if (resultContainer) resultContainer.innerHTML = '';

  // Leer observación opcional
  const observacionTextarea = container.querySelector<HTMLTextAreaElement>('#observacion-cierre');
  const observacionValue = observacionTextarea?.value.trim();
  const observacion = observacionValue !== '' ? observacionValue : undefined;

  // Indicar estado de envío en el botón
  btnConfirmar.disabled = true;
  btnConfirmar.innerHTML = `
    <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
    Cerrando conteo...
  `;

  try {
    const signal = abortController?.signal ?? undefined;

    const result = await apiFetch<CierreConteoResult>(`/api/conteos/${conteo.id}/cierre`, {
      method: 'POST',
      body: {
        confirmarAjuste: true,
        ...(observacion !== undefined ? { observacion } : {}),
      },
      ...(signal !== undefined ? { signal } : {}),
    });

    // Mostrar resultado de cierre con referencia al movimiento de ajuste
    if (resultContainer) {
      const ajusteLink = result.movimientoAjusteId
        ? `<a href="#/movimientos/${result.movimientoAjusteId}"
             class="btn btn-sm btn-outline-success ms-2"
             aria-label="Ver movimiento de ajuste generado">
             <i class="bi bi-arrow-right me-1" aria-hidden="true"></i>
             Ver Movimiento de Ajuste ${result.movimientoAjusteNumero ?? ''}
           </a>`
        : '';

      resultContainer.innerHTML = `
        <div class="alert alert-success d-flex align-items-center gap-2 mb-4" role="status">
          <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
          <span>
            Conteo cerrado correctamente.
            ${result.movimientoAjusteNumero ? `Movimiento de ajuste generado: <strong>${result.movimientoAjusteNumero}</strong>.` : 'No se generaron ajustes (sin discrepancias).'}
          </span>
          ${ajusteLink}
        </div>
      `;
    }

    // Navegar al detalle del conteo después de 2 segundos
    setTimeout(() => {
      window.location.hash = `#/conteos/${conteo.id}`;
    }, 2000);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = `
      <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
      Confirmar Cierre
    `;

    let message = 'No se pudo cerrar el conteo. Intente nuevamente.';
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = 'El conteo no está en estado Completado. No se puede cerrar en su estado actual.';
      } else {
        const body = error.body as { detail?: string } | null;
        if (body?.detail) {
          message = body.detail;
        }
      }
    }

    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      `;
    }
  }
}

/** Módulo de página de cierre de Conteo físico */
export const conteosCierrePage: PageModule = {
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
        renderCierre(container, conteo);
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
