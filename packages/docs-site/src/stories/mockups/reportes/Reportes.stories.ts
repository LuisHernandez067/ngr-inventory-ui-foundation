import type { ExportacionJob, ReporteDefinicion } from '@ngr-inventory/api-contracts';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

import { kardexFixtures } from '../../../../../api-mocks/src/fixtures/kardex.fixtures';
import { reporteDefinicionFixtures } from '../../../../../api-mocks/src/fixtures/reportes.fixtures';
import { stockConsolidadoFixtures } from '../../../../../api-mocks/src/fixtures/stock.fixtures';

// ── Fixtures inline (evita acceso por índice) ────────────────────────────────

/** Reporte stock_actual — rep-001 */
const reporteStockActual: ReporteDefinicion = {
  id: 'rep-001',
  nombre: 'Stock Actual',
  tipo: 'stock_actual',
  descripcion: 'Listado completo del stock disponible por producto y almacén',
  formatos: ['pdf', 'xlsx', 'csv'],
};

/** Reporte kardex — rep-002 */
const reporteKardex: ReporteDefinicion = {
  id: 'rep-002',
  nombre: 'Kardex de Movimientos',
  tipo: 'kardex',
  descripcion: 'Historial de entradas y salidas de un producto con saldo calculado',
  formatos: ['pdf', 'xlsx'],
};

/** Job de exportación en estado listo */
const jobListo: ExportacionJob = {
  id: 'job-00000001',
  reporteId: 'rep-001',
  formato: 'csv',
  estado: 'listo',
  url: '/descargas/job-00000001.csv',
  createdAt: '2026-04-02T10:00:00.000Z',
  updatedAt: '2026-04-02T10:00:05.000Z',
  createdBy: 'mock-user@ngr.com',
  updatedBy: 'mock-user@ngr.com',
};

/** Job de exportación en estado error */
const jobError: ExportacionJob = {
  id: 'job-00000002',
  reporteId: 'rep-001',
  formato: 'xlsx',
  estado: 'error',
  createdAt: '2026-04-02T10:01:00.000Z',
  updatedAt: '2026-04-02T10:01:03.000Z',
  createdBy: 'mock-user@ngr.com',
  updatedBy: 'mock-user@ngr.com',
};

/** Job de exportación en estado pendiente (en curso) */
const jobPendiente: ExportacionJob = {
  id: 'job-00000003',
  reporteId: 'rep-001',
  formato: 'pdf',
  estado: 'pendiente',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'mock-user@ngr.com',
  updatedBy: 'mock-user@ngr.com',
};

// ── Helpers de HTML ───────────────────────────────────────────────────────────

/** Genera los badges de formato exportación */
function buildFormatoBadges(formatos: ExportacionJob['formato'][]): string {
  return formatos
    .map((f) => `<span class="badge bg-secondary me-1">${f.toUpperCase()}</span>`)
    .join('');
}

/** Colores Bootstrap por tipo de reporte activo */
const tipoColorMap: Record<string, string> = {
  stock_actual: 'bg-success',
  movimientos: 'bg-primary',
  kardex: 'bg-info',
  bajo_stock: 'bg-warning',
};

/** Iconos Bootstrap por tipo de reporte */
const tipoIconMap: Record<string, string> = {
  stock_actual: 'bi-boxes',
  movimientos: 'bi-arrow-left-right',
  kardex: 'bi-journal-text',
  bajo_stock: 'bi-exclamation-triangle',
  valorizado: 'bi-currency-dollar',
  auditoria: 'bi-shield-check',
};

/** Genera una tarjeta del catálogo de reportes */
function buildReporteCard(reporte: ReporteDefinicion, selectedId: string | null): string {
  const isProximo = reporte.tipo === 'valorizado' || reporte.tipo === 'auditoria';
  const isSelected = selectedId === reporte.id && !isProximo;
  const icon = tipoIconMap[reporte.tipo] ?? 'bi-file-earmark-text';
  const tipoBadgeClass = isProximo
    ? 'bg-secondary'
    : (tipoColorMap[reporte.tipo] ?? 'bg-secondary');
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

/** Genera el catálogo completo de reportes */
function buildCatalogo(reportes: ReporteDefinicion[], selectedId: string | null): string {
  if (reportes.length === 0) {
    return `<p class="text-muted fst-italic">No hay reportes disponibles.</p>`;
  }
  return `
    <div class="row">
      ${reportes.map((r) => buildReporteCard(r, selectedId)).join('')}
    </div>
  `;
}

/** Layout base de dos columnas del módulo de reportes */
function buildLayout(params: {
  reportes: ReporteDefinicion[];
  selectedId: string | null;
  rightPanel: string;
}): string {
  const { reportes, selectedId, rightPanel } = params;
  return `
    <div class="p-4">
      <div class="d-flex align-items-center mb-4">
        <h1 class="h3 mb-0">
          <i class="bi bi-file-earmark-bar-graph me-2" aria-hidden="true"></i>
          Reportes
        </h1>
      </div>

      <div class="row g-4">
        <!-- Columna izquierda: catálogo -->
        <div class="col-12 col-md-5 col-lg-4">
          <h6 class="fw-semibold text-muted text-uppercase small mb-3 border-bottom pb-2">
            Catálogo de reportes
          </h6>
          <div id="reportes-catalogo">
            ${buildCatalogo(reportes, selectedId)}
          </div>
        </div>

        <!-- Columna derecha: panel de detalle -->
        <div class="col-12 col-md-7 col-lg-8">
          <h6 class="fw-semibold text-muted text-uppercase small mb-3 border-bottom pb-2">
            Configuración y resultados
          </h6>
          <div id="reportes-detail">
            ${rightPanel}
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Panel idle — sin selección */
function buildIdlePanel(): string {
  return `
    <div class="d-flex flex-column align-items-center justify-content-center text-center text-muted py-5"
         style="min-height: 200px;">
      <i class="bi bi-arrow-left-circle fs-1 mb-3" aria-hidden="true"></i>
      <p class="mb-0">Seleccioná un reporte del catálogo para comenzar.</p>
    </div>
  `;
}

/** Panel de filtros para stock_actual — almacenId opcional */
function buildFiltroStockActualPanel(reporte: ReporteDefinicion): string {
  return `
    <div class="card border-primary mb-3">
      <div class="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-between py-2">
        <span class="fw-semibold small">
          <i class="bi bi-funnel-fill me-1" aria-hidden="true"></i>
          Filtros — ${reporte.nombre}
        </span>
        <a href="#" class="small text-decoration-none"
           aria-label="Volver al catálogo de reportes">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver
        </a>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label for="filter-almacen" class="form-label small fw-semibold">Almacén (opcional)</label>
          <select id="filter-almacen" class="form-select form-select-sm" aria-label="Filtrar por almacén">
            <option value="">Todos los almacenes</option>
            <option value="alm-001">Depósito Central</option>
            <option value="alm-002">Almacén Norte</option>
            <option value="alm-003">Almacén Sur</option>
          </select>
        </div>
        <div class="mt-3">
          <button type="button" class="btn btn-primary btn-sm"
                  aria-label="Generar vista previa del reporte">
            <i class="bi bi-eye me-1" aria-hidden="true"></i>
            Vista previa
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Panel de filtros para kardex — productoId requerido */
function buildFiltroKardexPanel(reporte: ReporteDefinicion): string {
  return `
    <div class="card border-primary mb-3">
      <div class="card-header bg-primary bg-opacity-10 d-flex align-items-center justify-content-between py-2">
        <span class="fw-semibold small">
          <i class="bi bi-funnel-fill me-1" aria-hidden="true"></i>
          Filtros — ${reporte.nombre}
        </span>
        <a href="#" class="small text-decoration-none"
           aria-label="Volver al catálogo de reportes">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver
        </a>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12">
            <label for="filter-producto" class="form-label small fw-semibold">
              Producto <span class="text-danger">*</span>
            </label>
            <select id="filter-producto" class="form-select form-select-sm"
                    aria-label="Seleccionar producto (requerido)" aria-required="true">
              <option value="">Seleccioná un producto...</option>
              <option value="prod-001">TEC-MEC-001 — Teclado Mecánico TKL</option>
              <option value="prod-002">MON-IPS-001 — Monitor 27 pulgadas IPS</option>
            </select>
            <div class="form-text text-danger small" id="filter-producto-error" style="display:none;">
              El producto es requerido para el reporte Kardex.
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <label for="filter-fecha-desde" class="form-label small fw-semibold">Fecha desde</label>
            <input type="date" id="filter-fecha-desde"
                   class="form-control form-control-sm"
                   aria-label="Fecha de inicio del período" />
          </div>
          <div class="col-12 col-sm-6">
            <label for="filter-fecha-hasta" class="form-label small fw-semibold">Fecha hasta</label>
            <input type="date" id="filter-fecha-hasta"
                   class="form-control form-control-sm"
                   aria-label="Fecha de fin del período" />
          </div>
        </div>
        <div class="mt-3">
          <button type="button" class="btn btn-primary btn-sm"
                  aria-label="Generar vista previa del reporte">
            <i class="bi bi-eye me-1" aria-hidden="true"></i>
            Vista previa
          </button>
        </div>
      </div>
    </div>
  `;
}

/** Panel de vista previa con tabla de datos */
function buildVistaPreviaPanel(params: {
  reporte: ReporteDefinicion;
  rows: unknown[];
  showExportBtn: boolean;
}): string {
  const { reporte, rows, showExportBtn } = params;
  const total = rows.length;

  const tableHtml =
    rows.length === 0
      ? `
        <div class="alert alert-secondary d-flex align-items-center gap-2" role="status">
          <i class="bi bi-inbox fs-5" aria-hidden="true"></i>
          <span>No se encontraron datos con los filtros aplicados.</span>
        </div>
      `
      : (() => {
          const firstRow = rows[0];
          if (!firstRow || typeof firstRow !== 'object') return '';
          const keys = Object.keys(firstRow);
          const headers = keys.map((k) => `<th scope="col">${k}</th>`).join('');
          const rowsHtml = rows
            .slice(0, 5)
            .map(
              (row) =>
                `<tr>${keys
                  .map(
                    (k) => `<td>${JSON.stringify((row as Record<string, unknown>)[k] ?? '—')}</td>`
                  )
                  .join('')}</tr>`
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
            ${total > 5 ? `<p class="text-muted small">Mostrando 5 de ${String(total)} registros.</p>` : ''}
          `;
        })();

  const exportBtn = showExportBtn
    ? `<div class="d-flex gap-1">
         <select class="form-select form-select-sm" style="width:auto;"
                 aria-label="Seleccionar formato de exportación">
           <option value="csv">CSV</option>
           <option value="xlsx">XLSX</option>
           <option value="pdf">PDF</option>
         </select>
         <button type="button" class="btn btn-success btn-sm"
                 aria-label="Exportar reporte en el formato seleccionado">
           <i class="bi bi-download me-1" aria-hidden="true"></i>
           Exportar
         </button>
       </div>`
    : '';

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
          <a href="#" class="btn btn-outline-secondary btn-sm"
             aria-label="Modificar filtros del reporte">
            <i class="bi bi-funnel me-1" aria-hidden="true"></i>
            Cambiar filtros
          </a>
          ${exportBtn}
        </div>
      </div>
      ${tableHtml}
    </div>
  `;
}

/** Panel de exportación en curso */
function buildExportandoPanel(job: ExportacionJob): string {
  return `
    <div class="d-flex flex-column align-items-center justify-content-center text-center py-5"
         style="min-height: 200px;" role="status" aria-live="polite">
      <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
      <p class="fw-semibold mb-1">Generando reporte…</p>
      <p class="text-muted small mb-0">
        Job: <code>${job.id}</code>
      </p>
    </div>
  `;
}

/** Panel de exportación exitosa */
function buildExportacionExitosaPanel(): string {
  return `
    <div>
      <div class="alert alert-success d-flex align-items-center gap-2 mb-3" role="status">
        <i class="bi bi-check-circle-fill fs-5" aria-hidden="true"></i>
        <span>¡Reporte generado correctamente! La descarga comenzó automáticamente.</span>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button type="button" class="btn btn-success btn-sm"
                aria-label="Descargar reporte generado">
          <i class="bi bi-download me-1" aria-hidden="true"></i>
          Descargar reporte
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
          Nuevo reporte
        </button>
      </div>
    </div>
  `;
}

/** Panel de error en exportación */
function buildExportacionErrorPanel(mensaje: string): string {
  return `
    <div>
      <div class="alert alert-danger d-flex align-items-start gap-2 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 flex-shrink-0 mt-1" aria-hidden="true"></i>
        <span>${mensaje}</span>
      </div>
      <div class="d-flex gap-2">
        <button type="button" class="btn btn-primary btn-sm">
          <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
          Reintentar
        </button>
        <button type="button" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
          Nuevo reporte
        </button>
      </div>
    </div>
  `;
}

// ── Handlers MSW base ─────────────────────────────────────────────────────────

/** Handler base para GET /api/reportes — devuelve todas las definiciones */
const handlerGetReportes = http.get('/api/reportes', () =>
  HttpResponse.json({
    data: reporteDefinicionFixtures,
    total: reporteDefinicionFixtures.length,
    page: 1,
    pageSize: 50,
    totalPages: 1,
  })
);

/** Handler base para GET /api/reportes/:id/datos — stock actual sin filtro */
const handlerGetStockDatos = http.get('/api/reportes/rep-001/datos', () =>
  HttpResponse.json({
    reporteId: 'rep-001',
    tipo: 'stock_actual',
    filtrosAplicados: { tipo: 'stock_actual' },
    data: stockConsolidadoFixtures,
    total: stockConsolidadoFixtures.length,
  })
);

/** Handler base para GET /api/reportes/:id/datos — kardex prod-001 */
const handlerGetKardexDatos = http.get('/api/reportes/rep-002/datos', () =>
  HttpResponse.json({
    reporteId: 'rep-002',
    tipo: 'kardex',
    filtrosAplicados: { tipo: 'kardex', productoId: 'prod-001' },
    data: kardexFixtures,
    total: kardexFixtures.length,
  })
);

/** Handler base para almacenes (usados en popups de select) */
const handlerGetAlmacenes = http.get('/api/almacenes', () =>
  HttpResponse.json({
    data: [
      {
        id: 'alm-001',
        nombre: 'Depósito Central',
        codigo: 'ALM-001',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin@ngr.com',
        updatedBy: 'admin@ngr.com',
      },
      {
        id: 'alm-002',
        nombre: 'Almacén Norte',
        codigo: 'ALM-002',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin@ngr.com',
        updatedBy: 'admin@ngr.com',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 100,
    totalPages: 1,
  })
);

/** Handler base para productos (usados en select de kardex) */
const handlerGetProductos = http.get('/api/productos', () =>
  HttpResponse.json({
    data: [
      {
        id: 'prod-001',
        codigo: 'TEC-MEC-001',
        nombre: 'Teclado Mecánico TKL',
        descripcion: 'Teclado mecánico compacto TKL',
        categoriaId: 'cat-001',
        categoriaNombre: 'Tecnología',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin@ngr.com',
        updatedBy: 'admin@ngr.com',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 200,
    totalPages: 1,
  })
);

// ── Meta ──────────────────────────────────────────────────────────────────────

/** Módulo de reportes y exportaciones — todos los estados de la máquina de fases */
const meta = {
  title: 'Mockups/Reportes/Reportes',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        handlerGetReportes,
        handlerGetStockDatos,
        handlerGetAlmacenes,
        handlerGetProductos,
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Catálogo vacío — GET /api/reportes devuelve lista vacía.
 * Muestra el mensaje "No hay reportes disponibles."
 */
export const CatalogoVacio: Story = {
  name: 'Catálogo vacío',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/reportes', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 })
        ),
        handlerGetAlmacenes,
        handlerGetProductos,
      ],
    },
  },
  render: () =>
    buildLayout({
      reportes: [],
      selectedId: null,
      rightPanel: buildIdlePanel(),
    }),
};

/**
 * Estado inicial idle — catálogo completo visible.
 * 4 tarjetas activas + 2 deshabilitadas "Próximamente" (valorizado, auditoría).
 */
export const CatalogoCompleto: Story = {
  name: 'Catálogo completo',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: null,
      rightPanel: buildIdlePanel(),
    }),
};

/**
 * Estado filtering con stock_actual seleccionado.
 * Panel de almacén visible (filtro opcional).
 */
export const FiltroStockActual: Story = {
  name: 'Filtro — Stock Actual (almacenId)',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildFiltroStockActualPanel(reporteStockActual),
    }),
};

/**
 * Estado filtering con kardex seleccionado.
 * Campo productoId requerido visible.
 */
export const FiltroKardex: Story = {
  name: 'Filtro — Kardex (productoId requerido)',
  parameters: {
    msw: {
      handlers: [
        handlerGetReportes,
        handlerGetKardexDatos,
        handlerGetAlmacenes,
        handlerGetProductos,
      ],
    },
  },
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteKardex.id,
      rightPanel: buildFiltroKardexPanel(reporteKardex),
    }),
};

/**
 * Estado previewing — tabla de datos visible, botón Exportar disponible.
 * Usa datos de stockConsolidadoFixtures.
 */
export const VistaPrevia: Story = {
  name: 'Vista previa — datos cargados',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildVistaPreviaPanel({
        reporte: reporteStockActual,
        rows: stockConsolidadoFixtures,
        showExportBtn: true,
      }),
    }),
};

/**
 * Estado previewing — datos vacíos.
 * GET /api/reportes/:id/datos devuelve { columns: [], rows: [] }.
 * Muestra el estado vacío "No se encontraron datos con los filtros aplicados."
 */
export const PreviewVacia: Story = {
  name: 'Vista previa — sin datos (vacío)',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildVistaPreviaPanel({
        reporte: reporteStockActual,
        rows: [],
        showExportBtn: true,
      }),
    }),
};

/**
 * Estado previewing sin permiso de exportar.
 * El botón "Exportar" debe estar oculto (no renderizado).
 */
export const SinPermisoExportar: Story = {
  name: 'Vista previa — sin permiso exportar',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildVistaPreviaPanel({
        reporte: reporteStockActual,
        rows: stockConsolidadoFixtures,
        showExportBtn: false,
      }),
    }),
};

/**
 * Estado exporting — spinner visible, mensaje "Generando reporte…".
 * El job de exportación está en estado pendiente.
 */
export const ExportandoEnCurso: Story = {
  name: 'Exportando en curso',
  parameters: {
    msw: {
      handlers: [
        handlerGetReportes,
        handlerGetStockDatos,
        handlerGetAlmacenes,
        // Devuelve job en estado pendiente indefinidamente (simula polling activo)
        http.post('/api/reportes/rep-001/exportar', () =>
          HttpResponse.json(jobPendiente, { status: 202 })
        ),
        http.get(`/api/reportes/exportaciones/${jobPendiente.id}`, () =>
          HttpResponse.json(jobPendiente)
        ),
      ],
    },
  },
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildExportandoPanel(jobPendiente),
    }),
};

/**
 * Estado done — alerta de éxito visible, botón de descarga disponible.
 * El job está en estado listo con URL de descarga.
 */
export const ExportacionExitosa: Story = {
  name: 'Exportación exitosa',
  parameters: {
    msw: {
      handlers: [
        handlerGetReportes,
        handlerGetStockDatos,
        handlerGetAlmacenes,
        http.post('/api/reportes/rep-001/exportar', () =>
          HttpResponse.json(jobListo, { status: 202 })
        ),
        http.get(`/api/reportes/exportaciones/${jobListo.id}`, () => HttpResponse.json(jobListo)),
      ],
    },
  },
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildExportacionExitosaPanel(),
    }),
};

/**
 * Exportación inmediata — dataset pequeño (≤ 200 filas).
 * `handleExportar()` genera el Blob directamente desde `previewRows` sin
 * hacer POST /exportar ni iniciar polling.
 * El panel salta directo al estado `done` con el mensaje de descarga.
 */
export const ExportacionInmediata: Story = {
  name: 'Exportación inmediata (dataset pequeño)',
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildExportacionExitosaPanel(),
    }),
};

/**
 * Estado error — alerta de error visible, botón "Reintentar" disponible.
 * El job de exportación terminó en error.
 */
export const ExportacionError: Story = {
  name: 'Exportación — error',
  parameters: {
    msw: {
      handlers: [
        handlerGetReportes,
        handlerGetStockDatos,
        handlerGetAlmacenes,
        http.post('/api/reportes/rep-001/exportar', () =>
          HttpResponse.json(jobError, { status: 202 })
        ),
        http.get(`/api/reportes/exportaciones/${jobError.id}`, () => HttpResponse.json(jobError)),
      ],
    },
  },
  render: () =>
    buildLayout({
      reportes: reporteDefinicionFixtures,
      selectedId: reporteStockActual.id,
      rightPanel: buildExportacionErrorPanel('El servidor reportó un error al generar el archivo.'),
    }),
};
