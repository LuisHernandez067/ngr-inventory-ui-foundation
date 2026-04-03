// Página de Reportes — implementación personalizada con máquina de estados y flujo de exportación
import type {
  Almacen,
  ExportacionJob,
  PaginatedResponse,
  Producto,
  ReporteDatos,
  ReporteDefinicion,
  ReporteFilter,
} from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { ApiError, apiFetch } from '../_shared/apiFetch';

// ---------------------------------------------------------------------------
// Tipos de fase (máquina de estados)
// ---------------------------------------------------------------------------

type ReportesPhase = 'idle' | 'filtering' | 'previewing' | 'exporting' | 'done' | 'error';

/** Tipos de reporte que se muestran como tarjetas activas */
type TipoReporteActivo = 'stock_actual' | 'movimientos' | 'kardex' | 'bajo_stock';

/** Tipos de reporte que se muestran deshabilitados como "Próximamente" */
type TipoReporteProximo = 'valorizado' | 'auditoria';

const TIPOS_ACTIVOS = new Set<string>(['stock_actual', 'movimientos', 'kardex', 'bajo_stock']);

// ---------------------------------------------------------------------------
// Estado mutable del módulo
// ---------------------------------------------------------------------------

interface ReportesState {
  phase: ReportesPhase;
  selectedReporte: ReporteDefinicion | null;
  filters: ReporteFilter | null;
  previewRows: unknown[];
  selectedFormato: ExportacionJob['formato'];
  activeJob: ExportacionJob | null;
  errorMessage: string | null;
}

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** ID del intervalo de polling de exportación */
let intervalId: ReturnType<typeof setInterval> | null = null;

/** Referencia al contenedor raíz de la página */
let rootContainer: HTMLElement | null = null;

/** Estado mutable de la página */
const state: ReportesState = {
  phase: 'idle',
  selectedReporte: null,
  filters: null,
  previewRows: [],
  selectedFormato: 'csv',
  activeJob: null,
  errorMessage: null,
};

// ---------------------------------------------------------------------------
// Helpers de formato y UI
// ---------------------------------------------------------------------------

/** Mapa de colores Bootstrap por tipo de reporte activo */
const tipoColorMap: Record<TipoReporteActivo, string> = {
  stock_actual: 'bg-success',
  movimientos: 'bg-primary',
  kardex: 'bg-info text-dark',
  bajo_stock: 'bg-warning text-dark',
};

/** Mapa de iconos Bootstrap por tipo de reporte */
const tipoIconMap: Record<string, string> = {
  stock_actual: 'bi-boxes',
  movimientos: 'bi-arrow-left-right',
  kardex: 'bi-journal-text',
  bajo_stock: 'bi-exclamation-triangle',
  valorizado: 'bi-currency-dollar',
  auditoria: 'bi-shield-check',
};

/**
 * Genera los badges de formato para una definición de reporte.
 */
function buildFormatoBadges(formatos: ExportacionJob['formato'][]): string {
  return formatos
    .map((f) => `<span class="badge bg-secondary me-1">${f.toUpperCase()}</span>`)
    .join('');
}

/**
 * Cancela el intervalo de polling activo y limpia la referencia.
 */
function clearPolling(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Genera un CSV mock a partir de las filas de preview y dispara la descarga.
 */
function triggerCsvDownload(rows: unknown[], filename: string): void {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0] as object);
  const header = keys.join(',');
  const body = rows
    .map((r) => keys.map((k) => JSON.stringify((r as Record<string, unknown>)[k] ?? '')).join(','))
    .join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Builders de HTML por sección
// ---------------------------------------------------------------------------

/**
 * Renderiza una tarjeta del catálogo de reportes.
 * - Tipos activos: interactiva, con clic para filtrar.
 * - Tipos "Próximamente": deshabilitada visualmente.
 */
function buildReporteCard(reporte: ReporteDefinicion): string {
  const isProximo =
    (reporte.tipo as TipoReporteProximo | TipoReporteActivo) === 'valorizado' ||
    (reporte.tipo as TipoReporteProximo | TipoReporteActivo) === 'auditoria' ||
    !TIPOS_ACTIVOS.has(reporte.tipo);

  const isSelected = state.selectedReporte?.id === reporte.id && !isProximo;
  const icon = tipoIconMap[reporte.tipo] ?? 'bi-file-earmark-text';
  const tipoBadgeClass = isProximo
    ? 'bg-secondary'
    : tipoColorMap[reporte.tipo as TipoReporteActivo];
  const cardBorderClass = isSelected ? 'border-primary shadow-sm' : '';
  const cardOpacityClass = isProximo ? 'opacity-50 pe-none' : '';
  const cursorClass = isProximo ? '' : 'cursor-pointer';

  return `
    <div class="col-md-6 mb-3">
      <div
        class="card h-100 ${cardBorderClass} ${cardOpacityClass} ${cursorClass}"
        role="${isProximo ? 'presentation' : 'button'}"
        tabindex="${isProximo ? '-1' : '0'}"
        aria-label="${isProximo ? `${reporte.nombre} (próximamente)` : `Seleccionar reporte: ${reporte.nombre}`}"
        aria-pressed="${String(isSelected)}"
        data-reporte-id="${reporte.id}"
      >
        <div class="card-body">
          <div class="d-flex align-items-start gap-2 mb-2">
            <i class="bi ${icon} fs-4 text-secondary flex-shrink-0" aria-hidden="true"></i>
            <div class="flex-grow-1">
              <h6 class="card-title mb-1 fw-semibold">${reporte.nombre}</h6>
              <div class="d-flex gap-1 flex-wrap mb-1">
                <span class="badge ${tipoBadgeClass}">${reporte.tipo.replace('_', ' ')}</span>
                ${isProximo ? '<span class="badge bg-secondary">Próximamente</span>' : ''}
              </div>
            </div>
          </div>
          <p class="card-text text-muted small mb-2">${reporte.descripcion}</p>
          <div>${buildFormatoBadges(reporte.formatos)}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza el catálogo completo de reportes.
 */
function buildCatalogo(reportes: ReporteDefinicion[]): string {
  if (reportes.length === 0) {
    return `<p class="text-muted fst-italic">No hay reportes disponibles.</p>`;
  }
  return `
    <div class="row">
      ${reportes.map(buildReporteCard).join('')}
    </div>
  `;
}

/**
 * Renderiza el panel de filtros para el tipo de reporte seleccionado.
 */
function buildFilterPanel(reporte: ReporteDefinicion, filters: ReporteFilter | null): string {
  const tipo = reporte.tipo as TipoReporteActivo;

  let filterFields = '';

  if (tipo === 'stock_actual') {
    const currentAlmacenId = filters?.tipo === 'stock_actual' ? (filters.almacenId ?? '') : '';
    filterFields = `
      <div class="mb-3">
        <label for="filter-almacen" class="form-label small fw-semibold">Almacén (opcional)</label>
        <select id="filter-almacen" class="form-select form-select-sm" aria-label="Filtrar por almacén">
          <option value="">Todos los almacenes</option>
        </select>
      </div>
    `;
    void populateAlmacenesSelect('filter-almacen', currentAlmacenId);
  } else if (tipo === 'movimientos') {
    const f = filters?.tipo === 'movimientos' ? filters : null;
    filterFields = `
      <div class="row g-3">
        <div class="col-12 col-sm-6">
          <label for="filter-fecha-desde" class="form-label small fw-semibold">Fecha desde</label>
          <input
            type="date"
            id="filter-fecha-desde"
            class="form-control form-control-sm"
            value="${f?.fechaDesde ?? ''}"
            aria-label="Fecha de inicio del período"
          />
        </div>
        <div class="col-12 col-sm-6">
          <label for="filter-fecha-hasta" class="form-label small fw-semibold">Fecha hasta</label>
          <input
            type="date"
            id="filter-fecha-hasta"
            class="form-control form-control-sm"
            value="${f?.fechaHasta ?? ''}"
            aria-label="Fecha de fin del período"
          />
        </div>
        <div class="col-12 col-sm-6">
          <label for="filter-tipo-movimiento" class="form-label small fw-semibold">Tipo de movimiento</label>
          <select id="filter-tipo-movimiento" class="form-select form-select-sm" aria-label="Filtrar por tipo de movimiento">
            <option value="">Todos</option>
            <option value="entrada"      ${f?.tipoMovimiento === 'entrada' ? 'selected' : ''}>Entrada</option>
            <option value="salida"       ${f?.tipoMovimiento === 'salida' ? 'selected' : ''}>Salida</option>
            <option value="transferencia"${f?.tipoMovimiento === 'transferencia' ? 'selected' : ''}>Transferencia</option>
            <option value="ajuste"       ${f?.tipoMovimiento === 'ajuste' ? 'selected' : ''}>Ajuste</option>
          </select>
        </div>
        <div class="col-12 col-sm-6">
          <label for="filter-almacen" class="form-label small fw-semibold">Almacén (opcional)</label>
          <select id="filter-almacen" class="form-select form-select-sm" aria-label="Filtrar por almacén">
            <option value="">Todos los almacenes</option>
          </select>
        </div>
      </div>
    `;
    const currentAlmacenId = f?.almacenId ?? '';
    void populateAlmacenesSelect('filter-almacen', currentAlmacenId);
  } else if (tipo === 'kardex') {
    const f = filters?.tipo === 'kardex' ? filters : null;
    filterFields = `
      <div class="row g-3">
        <div class="col-12">
          <label for="filter-producto" class="form-label small fw-semibold">
            Producto <span class="text-danger">*</span>
          </label>
          <select id="filter-producto" class="form-select form-select-sm" aria-label="Seleccionar producto (requerido)" aria-required="true">
            <option value="">Seleccioná un producto...</option>
          </select>
          <div class="form-text text-danger small" id="filter-producto-error" style="display:none;">
            El producto es requerido para el reporte Kardex.
          </div>
        </div>
        <div class="col-12 col-sm-6">
          <label for="filter-fecha-desde" class="form-label small fw-semibold">Fecha desde</label>
          <input
            type="date"
            id="filter-fecha-desde"
            class="form-control form-control-sm"
            value="${f?.fechaDesde ?? ''}"
            aria-label="Fecha de inicio del período"
          />
        </div>
        <div class="col-12 col-sm-6">
          <label for="filter-fecha-hasta" class="form-label small fw-semibold">Fecha hasta</label>
          <input
            type="date"
            id="filter-fecha-hasta"
            class="form-control form-control-sm"
            value="${f?.fechaHasta ?? ''}"
            aria-label="Fecha de fin del período"
          />
        </div>
      </div>
    `;
    const currentProductoId = f?.productoId ?? '';
    void populateProductosSelect('filter-producto', currentProductoId);
  } else {
    // bajo_stock
    const currentUmbral = filters?.tipo === 'bajo_stock' ? (filters.umbral ?? 10) : 10;
    filterFields = `
      <div class="mb-3">
        <label for="filter-umbral" class="form-label small fw-semibold">Umbral de stock mínimo</label>
        <input
          type="number"
          id="filter-umbral"
          class="form-control form-control-sm"
          value="${String(currentUmbral)}"
          min="0"
          step="1"
          aria-label="Umbral mínimo de stock"
        />
        <div class="form-text text-muted small">
          Se mostrarán productos con stock por debajo de este valor.
        </div>
      </div>
    `;
  }

  return `
    <div class="card border-primary mb-3">
      <div class="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-between py-2">
        <span class="fw-semibold small">
          <i class="bi bi-funnel-fill me-1" aria-hidden="true"></i>
          Filtros — ${reporte.nombre}
        </span>
        <a href="#" id="btn-volver-catalogo" class="small text-decoration-none"
           aria-label="Volver al catálogo de reportes">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver
        </a>
      </div>
      <div class="card-body">
        ${filterFields}
        <div class="mt-3">
          <button
            type="button"
            id="btn-vista-previa"
            class="btn btn-primary btn-sm"
            aria-label="Generar vista previa del reporte"
          >
            <i class="bi bi-eye me-1" aria-hidden="true"></i>
            Vista previa
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la tabla de preview con los datos cargados.
 */
function buildPreviewTable(rows: unknown[], total: number): string {
  if (rows.length === 0) {
    return `
      <div class="alert alert-secondary d-flex align-items-center gap-2" role="status">
        <i class="bi bi-inbox fs-5" aria-hidden="true"></i>
        <span>No se encontraron datos con los filtros aplicados.</span>
      </div>
    `;
  }

  const keys = Object.keys(rows[0] as object);
  const headers = keys.map((k) => `<th scope="col">${k}</th>`).join('');
  const rowsHtml = rows
    .slice(0, 50)
    .map(
      (row) =>
        `<tr>${keys.map((k) => `<td>${JSON.stringify((row as Record<string, unknown>)[k] ?? '—')}</td>`).join('')}</tr>`
    )
    .join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover" aria-label="Vista previa del reporte">
        <thead class="table-light">
          <tr>${headers}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
    ${total > 50 ? `<p class="text-muted small">Mostrando 50 de ${String(total)} registros.</p>` : ''}
  `;
}

/**
 * Renderiza el panel derecho según la fase actual.
 */
function buildDetailPanel(_reportes: ReporteDefinicion[]): string {
  const { phase, selectedReporte, filters, previewRows, activeJob, errorMessage } = state;
  const canExport = authService.hasPermission('reportes.exportar');

  if (phase === 'idle' || !selectedReporte) {
    return `
      <div class="d-flex flex-column align-items-center justify-content-center text-center text-muted py-5"
           style="min-height: 200px;">
        <i class="bi bi-arrow-left-circle fs-1 mb-3" aria-hidden="true"></i>
        <p class="mb-0">Seleccioná un reporte del catálogo para comenzar.</p>
      </div>
    `;
  }

  if (phase === 'filtering') {
    return buildFilterPanel(selectedReporte, filters);
  }

  if (phase === 'previewing') {
    const reporte = selectedReporte;
    const total = previewRows.length;
    return `
      <div>
        <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div>
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-table me-1" aria-hidden="true"></i>
              Vista previa — ${reporte.nombre}
            </h6>
            <span class="text-muted small" aria-live="polite">
              ${String(total)} registro${total !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="d-flex gap-2 align-items-center flex-wrap">
            <a href="#" id="btn-cambiar-filtros" class="btn btn-outline-secondary btn-sm"
               aria-label="Modificar filtros del reporte">
              <i class="bi bi-funnel me-1" aria-hidden="true"></i>
              Cambiar filtros
            </a>
            ${
              canExport
                ? `<div class="d-flex gap-1">
                     <select id="select-formato" class="form-select form-select-sm" style="width:auto;"
                             aria-label="Seleccionar formato de exportación">
                       <option value="csv"  ${state.selectedFormato === 'csv' ? 'selected' : ''}>CSV</option>
                       <option value="xlsx" ${state.selectedFormato === 'xlsx' ? 'selected' : ''}>XLSX</option>
                       <option value="pdf"  ${state.selectedFormato === 'pdf' ? 'selected' : ''}>PDF</option>
                     </select>
                     <button type="button" id="btn-exportar"
                             class="btn btn-success btn-sm"
                             aria-label="Exportar reporte en el formato seleccionado">
                       <i class="bi bi-download me-1" aria-hidden="true"></i>
                       Exportar
                     </button>
                   </div>`
                : ''
            }
          </div>
        </div>
        ${buildPreviewTable(previewRows, total)}
      </div>
    `;
  }

  if (phase === 'exporting') {
    return `
      <div class="d-flex flex-column align-items-center justify-content-center text-center py-5"
           style="min-height: 200px;" role="status" aria-live="polite">
        <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
        <p class="fw-semibold mb-1">Generando reporte…</p>
        <p class="text-muted small mb-0">
          Job: <code>${activeJob?.id ?? '—'}</code>
        </p>
      </div>
    `;
  }

  if (phase === 'done') {
    return `
      <div>
        <div class="alert alert-success d-flex align-items-center gap-2 mb-3" role="status">
          <i class="bi bi-check-circle-fill fs-5" aria-hidden="true"></i>
          <span>¡Reporte generado correctamente! La descarga comenzó automáticamente.</span>
        </div>
        <button type="button" id="btn-nuevo-reporte" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
          Nuevo reporte
        </button>
      </div>
    `;
  }

  // error phase (only remaining phase after idle/filtering/previewing/exporting/done)
  return `
    <div>
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0 mt-1" aria-hidden="true"></i>
        <span>${errorMessage ?? 'Ocurrió un error al procesar el reporte.'}</span>
      </div>
      <div class="d-flex gap-2">
        <button type="button" id="btn-reintentar" class="btn btn-primary btn-sm">
          <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
          Reintentar
        </button>
        <button type="button" id="btn-nuevo-reporte" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
          Nuevo reporte
        </button>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Render principal
// ---------------------------------------------------------------------------

/**
 * Renderiza todo el layout de la página de reportes en base al estado actual.
 * Memoiza la lista de reportes en el DOM para evitar re-fetch innecesario.
 */
function render(container: HTMLElement, reportes: ReporteDefinicion[]): void {
  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado -->
      <div class="d-flex align-items-center mb-4">
        <h1 class="h3 mb-0">
          <i class="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>
          Reportes
        </h1>
      </div>

      <!-- Layout de dos columnas -->
      <div class="row g-4">
        <!-- Columna izquierda: catálogo -->
        <div class="col-12 col-md-5 col-lg-4">
          <h6 class="fw-semibold text-muted text-uppercase small mb-3 border-bottom pb-2">
            Catálogo de reportes
          </h6>
          <div id="reportes-catalogo">
            ${buildCatalogo(reportes)}
          </div>
        </div>

        <!-- Columna derecha: panel de detalle -->
        <div class="col-12 col-md-7 col-lg-8">
          <h6 class="fw-semibold text-muted text-uppercase small mb-3 border-bottom pb-2">
            Configuración y resultados
          </h6>
          <div id="reportes-detail">
            ${buildDetailPanel(reportes)}
          </div>
        </div>
      </div>
    </div>
  `;

  wireEvents(container, reportes);
}

/**
 * Re-renderiza solo el panel de detalle (columna derecha) sin tocar el catálogo.
 */
function renderDetail(reportes: ReporteDefinicion[]): void {
  const detailEl = rootContainer?.querySelector<HTMLElement>('#reportes-detail');
  if (!detailEl) return;
  detailEl.innerHTML = buildDetailPanel(reportes);
  wireDetailEvents(detailEl, reportes);

  // Actualizar estado visual de las tarjetas del catálogo (selected)
  rootContainer?.querySelectorAll<HTMLElement>('[data-reporte-id]').forEach((card) => {
    const id = card.dataset['reporteId'];
    const isSelected = id === state.selectedReporte?.id && state.phase !== 'idle';
    card.classList.toggle('border-primary', isSelected);
    card.classList.toggle('shadow-sm', isSelected);
    card.setAttribute('aria-pressed', String(isSelected));
  });
}

// ---------------------------------------------------------------------------
// Wiring de eventos
// ---------------------------------------------------------------------------

/**
 * Conecta todos los listeners del layout completo (catálogo + detalle).
 */
function wireEvents(container: HTMLElement, reportes: ReporteDefinicion[]): void {
  // Clic en tarjetas del catálogo
  container.querySelector<HTMLElement>('#reportes-catalogo')?.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-reporte-id]');
    if (!card) return;
    if (card.classList.contains('pe-none')) return;
    const reporteId = card.dataset['reporteId'];
    const reporte = reportes.find((r) => r.id === reporteId);
    if (!reporte) return;
    handleSelectReporte(reporte, reportes);
  });

  // Soporte de teclado en tarjetas
  container.querySelector<HTMLElement>('#reportes-catalogo')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = (e.target as HTMLElement).closest<HTMLElement>('[data-reporte-id]');
    if (!card) return;
    if (card.classList.contains('pe-none')) return;
    e.preventDefault();
    const reporteId = card.dataset['reporteId'];
    const reporte = reportes.find((r) => r.id === reporteId);
    if (!reporte) return;
    handleSelectReporte(reporte, reportes);
  });

  wireDetailEvents(container.querySelector<HTMLElement>('#reportes-detail'), reportes);
}

/**
 * Conecta los listeners del panel de detalle (columna derecha).
 */
function wireDetailEvents(
  detailEl: HTMLElement | null | undefined,
  reportes: ReporteDefinicion[]
): void {
  if (!detailEl) return;

  // Volver al catálogo (desde filtering)
  detailEl
    .querySelector<HTMLAnchorElement>('#btn-volver-catalogo')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      state.phase = 'idle';
      state.selectedReporte = null;
      state.filters = null;
      renderDetail(reportes);
    });

  // Cambiar filtros (desde previewing)
  detailEl
    .querySelector<HTMLAnchorElement>('#btn-cambiar-filtros')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      state.phase = 'filtering';
      renderDetail(reportes);
    });

  // Vista previa
  detailEl.querySelector<HTMLButtonElement>('#btn-vista-previa')?.addEventListener('click', () => {
    const newFilters = readFilters();
    if (!newFilters) return; // validación falló
    state.filters = newFilters;
    void fetchPreview(reportes);
  });

  // Selector de formato
  detailEl.querySelector<HTMLSelectElement>('#select-formato')?.addEventListener('change', (e) => {
    const val = (e.target as HTMLSelectElement).value;
    if (val === 'csv' || val === 'xlsx' || val === 'pdf') {
      state.selectedFormato = val;
    }
  });

  // Exportar
  detailEl.querySelector<HTMLButtonElement>('#btn-exportar')?.addEventListener('click', () => {
    if (!state.selectedReporte) return;
    void handleExportar(reportes);
  });

  // Reintentar (desde error → previewing)
  detailEl.querySelector<HTMLButtonElement>('#btn-reintentar')?.addEventListener('click', () => {
    state.phase = 'previewing';
    state.errorMessage = null;
    renderDetail(reportes);
  });

  // Nuevo reporte (desde done o error → idle)
  detailEl.querySelector<HTMLButtonElement>('#btn-nuevo-reporte')?.addEventListener('click', () => {
    state.phase = 'idle';
    state.selectedReporte = null;
    state.filters = null;
    state.previewRows = [];
    state.activeJob = null;
    state.errorMessage = null;
    renderDetail(reportes);
  });
}

// ---------------------------------------------------------------------------
// Handlers de estado
// ---------------------------------------------------------------------------

/**
 * Selecciona un reporte del catálogo y transiciona a la fase de filtrado.
 */
function handleSelectReporte(reporte: ReporteDefinicion, reportes: ReporteDefinicion[]): void {
  state.selectedReporte = reporte;
  state.filters = null;
  state.previewRows = [];
  state.phase = 'filtering';
  renderDetail(reportes);
}

/**
 * Lee los valores del formulario de filtros y los valida.
 * Retorna el objeto `ReporteFilter` o `null` si la validación falla.
 */
function readFilters(): ReporteFilter | null {
  const tipo = state.selectedReporte?.tipo as TipoReporteActivo | undefined;
  if (!tipo) return null;

  const detail = rootContainer?.querySelector<HTMLElement>('#reportes-detail');

  if (tipo === 'stock_actual') {
    const almacenId = detail?.querySelector<HTMLSelectElement>('#filter-almacen')?.value ?? '';
    const filter: ReporteFilter = almacenId
      ? { tipo: 'stock_actual', almacenId }
      : { tipo: 'stock_actual' };
    return filter;
  }

  if (tipo === 'movimientos') {
    const fechaDesde = detail?.querySelector<HTMLInputElement>('#filter-fecha-desde')?.value ?? '';
    const fechaHasta = detail?.querySelector<HTMLInputElement>('#filter-fecha-hasta')?.value ?? '';
    const tipoMovRaw =
      detail?.querySelector<HTMLSelectElement>('#filter-tipo-movimiento')?.value ?? '';
    const almacenId = detail?.querySelector<HTMLSelectElement>('#filter-almacen')?.value ?? '';

    type TipoMov = 'entrada' | 'salida' | 'transferencia' | 'ajuste';
    const tipoMovimiento =
      tipoMovRaw === 'entrada' ||
      tipoMovRaw === 'salida' ||
      tipoMovRaw === 'transferencia' ||
      tipoMovRaw === 'ajuste'
        ? (tipoMovRaw as TipoMov)
        : undefined;

    const filter: ReporteFilter = {
      tipo: 'movimientos',
      ...(fechaDesde ? { fechaDesde } : {}),
      ...(fechaHasta ? { fechaHasta } : {}),
      ...(almacenId ? { almacenId } : {}),
      ...(tipoMovimiento !== undefined ? { tipoMovimiento } : {}),
    };
    return filter;
  }

  if (tipo === 'kardex') {
    const productoId = detail?.querySelector<HTMLSelectElement>('#filter-producto')?.value ?? '';
    const fechaDesde = detail?.querySelector<HTMLInputElement>('#filter-fecha-desde')?.value ?? '';
    const fechaHasta = detail?.querySelector<HTMLInputElement>('#filter-fecha-hasta')?.value ?? '';
    const productoError = detail?.querySelector<HTMLElement>('#filter-producto-error');

    if (!productoId) {
      if (productoError) productoError.style.display = '';
      return null;
    }
    if (productoError) productoError.style.display = 'none';

    const filter: ReporteFilter = {
      tipo: 'kardex',
      productoId,
      ...(fechaDesde ? { fechaDesde } : {}),
      ...(fechaHasta ? { fechaHasta } : {}),
    };
    return filter;
  }

  // bajo_stock
  const umbralRaw = detail?.querySelector<HTMLInputElement>('#filter-umbral')?.value ?? '';
  const umbral = umbralRaw !== '' ? Number(umbralRaw) : undefined;

  const filter: ReporteFilter =
    umbral !== undefined ? { tipo: 'bajo_stock', umbral } : { tipo: 'bajo_stock' };
  return filter;
}

/**
 * Fetch de datos de preview — llama GET /api/reportes/:id/datos con los filtros.
 */
async function fetchPreview(reportes: ReporteDefinicion[]): Promise<void> {
  const reporte = state.selectedReporte;
  const filters = state.filters;
  if (!reporte || !filters) return;

  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  state.phase = 'previewing';
  state.previewRows = [];

  // Mostrar spinner inmediato
  const detailEl = rootContainer?.querySelector<HTMLElement>('#reportes-detail');
  if (detailEl) {
    detailEl.innerHTML = `
      <div class="d-flex justify-content-center align-items-center py-5" role="status" aria-live="polite">
        <span class="spinner-border text-primary me-2" aria-hidden="true"></span>
        Cargando datos del reporte…
      </div>
    `;
  }

  const url = buildPreviewUrl(reporte.id, filters);

  try {
    const response = await apiFetch<ReporteDatos>(url, { signal });
    state.previewRows = response.data;
    renderDetail(reportes);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;
    const msg =
      error instanceof ApiError
        ? `Error ${String(error.status)}: ${(error.body as { detail?: string } | null)?.detail ?? error.message}`
        : 'Error al obtener los datos del reporte.';
    state.phase = 'error';
    state.errorMessage = msg;
    renderDetail(reportes);
  }
}

/**
 * Construye la URL para el endpoint de preview con los filtros como query params.
 */
function buildPreviewUrl(reporteId: string, filters: ReporteFilter): string {
  const base = `/api/reportes/${reporteId}/datos`;
  const params = new URLSearchParams();

  if (filters.tipo === 'stock_actual') {
    if (filters.almacenId) params.set('almacenId', filters.almacenId);
  } else if (filters.tipo === 'movimientos') {
    if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
    if (filters.almacenId) params.set('almacenId', filters.almacenId);
    if (filters.tipoMovimiento) params.set('tipoMovimiento', filters.tipoMovimiento);
  } else if (filters.tipo === 'kardex') {
    params.set('productoId', filters.productoId);
    if (filters.almacenId) params.set('almacenId', filters.almacenId);
    if (filters.fechaDesde) params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.set('fechaHasta', filters.fechaHasta);
  } else {
    // bajo_stock
    if (filters.umbral !== undefined) params.set('umbral', String(filters.umbral));
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Inicia el flujo de exportación: POST /exportar → polling cada 1.5s.
 */
async function handleExportar(reportes: ReporteDefinicion[]): Promise<void> {
  const reporte = state.selectedReporte;
  if (!reporte) return;

  state.phase = 'exporting';
  state.activeJob = null;
  state.errorMessage = null;
  renderDetail(reportes);

  try {
    const job = await apiFetch<ExportacionJob>(`/api/reportes/${reporte.id}/exportar`, {
      method: 'POST',
      body: { formato: state.selectedFormato },
    });

    state.activeJob = job;
    renderDetail(reportes);

    clearPolling();
    intervalId = setInterval(() => {
      void pollExportJob(job.id, reportes);
    }, 1500);
  } catch (error: unknown) {
    clearPolling();
    const msg =
      error instanceof ApiError
        ? `Error al iniciar exportación: ${(error.body as { detail?: string } | null)?.detail ?? error.message}`
        : 'No se pudo iniciar la exportación.';
    state.phase = 'error';
    state.errorMessage = msg;
    renderDetail(reportes);
  }
}

/**
 * Poll del estado del job de exportación.
 * Transiciona a `done` o `error` al terminar y limpia el intervalo.
 */
async function pollExportJob(jobId: string, reportes: ReporteDefinicion[]): Promise<void> {
  try {
    const job = await apiFetch<ExportacionJob>(`/api/reportes/exportaciones/${jobId}`);

    if (job.estado === 'listo') {
      clearPolling();
      state.activeJob = job;
      state.phase = 'done';

      // Generar descarga CSV desde los datos de preview
      const reporte = state.selectedReporte;
      if (reporte && state.previewRows.length > 0) {
        const filename = `${reporte.tipo}-${new Date().toISOString().slice(0, 10)}.${state.selectedFormato}`;
        triggerCsvDownload(state.previewRows, filename);
      }

      renderDetail(reportes);
    } else if (job.estado === 'error') {
      clearPolling();
      state.activeJob = job;
      state.phase = 'error';
      state.errorMessage = 'El servidor reportó un error al generar el archivo.';
      renderDetail(reportes);
    }
    // Si está 'pendiente' o 'procesando', no hacer nada — el siguiente tick del intervalo reintentará
  } catch (error: unknown) {
    clearPolling();
    const msg =
      error instanceof ApiError && error.status === 404
        ? 'El job de exportación no fue encontrado.'
        : 'Error al verificar el estado de la exportación.';
    state.phase = 'error';
    state.errorMessage = msg;
    renderDetail(reportes);
  }
}

// ---------------------------------------------------------------------------
// Carga de datos para selects dinámicos
// ---------------------------------------------------------------------------

/**
 * Rellena el select de almacenes con las opciones desde GET /api/almacenes.
 */
async function populateAlmacenesSelect(selectId: string, currentValue: string): Promise<void> {
  try {
    const response = await apiFetch<PaginatedResponse<Almacen>>('/api/almacenes?pageSize=100');
    const select = rootContainer?.querySelector<HTMLSelectElement>(`#${selectId}`);
    if (!select) return;
    const options = response.data
      .map(
        (a) =>
          `<option value="${a.id}" ${currentValue === a.id ? 'selected' : ''}>${a.nombre}</option>`
      )
      .join('');
    select.innerHTML = `<option value="">Todos los almacenes</option>${options}`;
  } catch {
    // Si falla la carga, el select queda solo con "Todos los almacenes"
  }
}

/**
 * Rellena el select de productos con las opciones desde GET /api/productos.
 */
async function populateProductosSelect(selectId: string, currentValue: string): Promise<void> {
  try {
    const response = await apiFetch<PaginatedResponse<Producto>>('/api/productos?pageSize=200');
    const select = rootContainer?.querySelector<HTMLSelectElement>(`#${selectId}`);
    if (!select) return;
    const options = response.data
      .map(
        (p) =>
          `<option value="${p.id}" ${currentValue === p.id ? 'selected' : ''}>${p.codigo} — ${p.nombre}</option>`
      )
      .join('');
    select.innerHTML = `<option value="">Seleccioná un producto...</option>${options}`;
  } catch {
    // Si falla la carga, el select queda solo con el placeholder
  }
}

// ---------------------------------------------------------------------------
// Carga inicial de definiciones de reportes
// ---------------------------------------------------------------------------

/**
 * Obtiene el listado de reportes disponibles desde GET /api/reportes.
 */
async function loadReportesAndRender(container: HTMLElement): Promise<void> {
  // Spinner de carga inicial
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      <span class="spinner-border text-primary me-2" role="status" aria-hidden="true"></span>
      <span>Cargando catálogo de reportes…</span>
    </div>
  `;

  try {
    const response = await apiFetch<PaginatedResponse<ReporteDefinicion>>(
      '/api/reportes?pageSize=50'
    );
    render(container, response.data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;
    container.innerHTML = `
      <div class="p-4">
        <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>No se pudo cargar el catálogo de reportes.</span>
        </div>
      </div>
    `;
  }
}

// ---------------------------------------------------------------------------
// Módulo de página exportado
// ---------------------------------------------------------------------------

/** Módulo de página de reportes */
export const reportesPage: PageModule = {
  render(container: HTMLElement): void {
    rootContainer = container;

    // Resetear estado
    state.phase = 'idle';
    state.selectedReporte = null;
    state.filters = null;
    state.previewRows = [];
    state.selectedFormato = 'csv';
    state.activeJob = null;
    state.errorMessage = null;

    clearPolling();
    abortController?.abort();
    abortController = new AbortController();

    void loadReportesAndRender(container);
  },

  destroy(): void {
    clearPolling();
    abortController?.abort();
    abortController = null;
    rootContainer = null;
  },
};
