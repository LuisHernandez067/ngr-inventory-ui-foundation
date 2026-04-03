import type {
  ExportacionJob,
  PaginatedResponse,
  ReporteDatos,
  ReporteDefinicion,
} from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo reportes — máquina de estados idle → filtering → previewing → exporting → done/error.
// Se mockean apiFetch y authService para aislar el comportamiento del componente.

// Mockear apiFetch antes de importar el módulo bajo test
vi.mock('../_shared/apiFetch', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(`HTTP ${String(status)}`);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  },
}));

// Mockear authService para controlar permisos en tests
vi.mock('../../services/authService', () => ({
  authService: {
    hasPermission: vi.fn(),
  },
}));

import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

import { reportesPage } from './reportes';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** 4 reportes activos + 2 próximamente */
const reporteDefinicionesFixture: ReporteDefinicion[] = [
  {
    id: 'rep-001',
    nombre: 'Stock Actual',
    tipo: 'stock_actual',
    descripcion: 'Listado completo del stock disponible por producto y almacén',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-002',
    nombre: 'Kardex de Movimientos',
    tipo: 'kardex',
    descripcion: 'Historial de entradas y salidas de un producto con saldo calculado',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-003',
    nombre: 'Movimientos del Período',
    tipo: 'movimientos',
    descripcion: 'Todos los movimientos de inventario en un rango de fechas',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-005',
    nombre: 'Productos Bajo Mínimo',
    tipo: 'bajo_stock',
    descripcion: 'Productos cuyo stock actual está por debajo del mínimo configurado',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-004',
    nombre: 'Inventario Valorizado',
    tipo: 'valorizado',
    descripcion: 'Stock actual valorizado al precio unitario',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-006',
    nombre: 'Log de Auditoría',
    tipo: 'auditoria',
    descripcion: 'Registro de acciones de usuarios en el sistema',
    formatos: ['pdf', 'csv'],
  },
];

/** Respuesta paginada del catálogo */
const reportesCatalogoResponse: PaginatedResponse<ReporteDefinicion> = {
  data: reporteDefinicionesFixture,
  total: 6,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Filas de preview para el reporte stock_actual */
const previewRowsStock = [
  { productoId: 'prod-001', producto: 'Teclado TKL', stockActual: 25, almacen: 'Central' },
  { productoId: 'prod-002', producto: 'Mouse Inalámbrico', stockActual: 12, almacen: 'Central' },
];

/** Respuesta de preview — stock_actual */
const previewDatosResponse: ReporteDatos = {
  reporteId: 'rep-001',
  tipo: 'stock_actual',
  filtrosAplicados: { tipo: 'stock_actual' },
  data: previewRowsStock,
  total: 2,
};

/** 201 filas para forzar el path de POST + polling (IMMEDIATE_THRESHOLD = 200) */
const previewDatosResponseLarge: ReporteDatos = {
  reporteId: 'rep-001',
  tipo: 'stock_actual',
  filtrosAplicados: { tipo: 'stock_actual' },
  data: Array.from({ length: 201 }, () => ({
    productoId: 'prod-001',
    producto: 'Teclado TKL',
    stockActual: 25,
    almacen: 'Central',
  })),
  total: 201,
};

/** Respuesta de preview vacía */
const previewDatosVacioResponse: ReporteDatos = {
  reporteId: 'rep-001',
  tipo: 'stock_actual',
  filtrosAplicados: { tipo: 'stock_actual' },
  data: [],
  total: 0,
};

/** Job de exportación en estado pendiente */
const exportJobPendiente: ExportacionJob = {
  id: 'job-001',
  reporteId: 'rep-001',
  formato: 'csv',
  estado: 'pendiente',
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z',
};

/** Job de exportación en estado listo */
const exportJobListo: ExportacionJob = {
  id: 'job-001',
  reporteId: 'rep-001',
  formato: 'csv',
  estado: 'listo',
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:01:00.000Z',
};

/** Job de exportación en estado error */
const exportJobError: ExportacionJob = {
  id: 'job-001',
  reporteId: 'rep-001',
  formato: 'csv',
  estado: 'error',
  createdAt: '2026-04-02T00:00:00.000Z',
  updatedAt: '2026-04-02T00:01:00.000Z',
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('reportesPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: sin permiso de exportar
    mockAuthService.hasPermission.mockReturnValue(false);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    reportesPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Catálogo inicial ────────────────────────────────────────────────────────

  it('debe renderizar el título "Reportes"', () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toContain('Reportes');
  });

  it('debe llamar a apiFetch con /api/reportes al inicializar', () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/reportes'),
      expect.any(Object)
    );
  });

  it('debe renderizar 4 tarjetas activas de reportes tras cargar el catálogo', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      // Las tarjetas activas tienen role="button"
      const activeCards = container.querySelectorAll('[role="button"][data-reporte-id]');
      expect(activeCards.length).toBe(4);
    });
  });

  it('debe renderizar 2 tarjetas deshabilitadas (próximamente)', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      const proximCards = container.querySelectorAll('[role="presentation"][data-reporte-id]');
      expect(proximCards.length).toBe(2);
    });
  });

  it('debe mostrar los nombres de los reportes activos', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Stock Actual');
    });

    expect(container.innerHTML).toContain('Kardex de Movimientos');
    expect(container.innerHTML).toContain('Movimientos del Período');
    expect(container.innerHTML).toContain('Productos Bajo Mínimo');
  });

  // ── Transición idle → filtering ──────────────────────────────────────────────

  it('debe mostrar el panel de filtros al hacer clic en una tarjeta activa', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    expect(container.querySelector('#btn-volver-catalogo')).not.toBeNull();
    expect(container.querySelector('#btn-vista-previa')).not.toBeNull();
  });

  it('debe mostrar el nombre del reporte seleccionado en el panel de filtros', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    expect(container.innerHTML).toContain('Stock Actual');
  });

  it('no debe responder al clic en tarjetas "próximamente" (pe-none)', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-004"]')).not.toBeNull();
    });

    // Las tarjetas próximamente tienen pe-none — el handler las ignora
    const proximCard = q(container, '[data-reporte-id="rep-004"]') as HTMLElement;
    proximCard.click();

    // No debe aparecer el panel de filtros
    expect(container.querySelector('#btn-vista-previa')).toBeNull();
  });

  // ── Volver al catálogo ───────────────────────────────────────────────────────

  it('"Volver" debe regresar al estado idle (sin panel de filtros)', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    // Seleccionar reporte para ir a filtering
    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    expect(container.querySelector('#btn-volver-catalogo')).not.toBeNull();

    // Clic en "Volver"
    const btnVolver = q(container, '#btn-volver-catalogo') as HTMLAnchorElement;
    btnVolver.click();

    expect(container.querySelector('#btn-vista-previa')).toBeNull();
    expect(container.querySelector('#btn-volver-catalogo')).toBeNull();
  });

  // ── Validación de campos requeridos (kardex) ──────────────────────────────────

  it('debe rechazar el botón "Vista previa" en kardex sin productoId (validación requerida)', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-002"]')).not.toBeNull();
    });

    // Seleccionar kardex
    const card = q(container, '[data-reporte-id="rep-002"]') as HTMLElement;
    card.click();

    expect(container.querySelector('#btn-vista-previa')).not.toBeNull();

    // Clic en Vista previa sin completar productoId
    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    // No debe haberse llamado apiFetch para el preview (solo la carga inicial del catálogo)
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el error de validación cuando productoId está vacío en kardex', async () => {
    mockApiFetch.mockResolvedValueOnce(reportesCatalogoResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-002"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-002"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    const errorEl = container.querySelector<HTMLElement>('#filter-producto-error');
    expect(errorEl).not.toBeNull();
    expect(errorEl?.style.display).not.toBe('none');
  });

  // ── Vista previa — stock_actual ───────────────────────────────────────────────

  it('debe llamar a GET /api/reportes/:id/datos al hacer clic en "Vista previa"', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reportes/rep-001/datos'),
        expect.any(Object)
      );
    });
  });

  it('debe renderizar la tabla de preview con los datos del reporte', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Teclado TKL');
  });

  it('debe mostrar el conteo de registros en el panel de preview', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('2 registro');
    });
  });

  // ── Estado vacío de preview ───────────────────────────────────────────────────

  it('debe mostrar el mensaje de estado vacío cuando no hay datos en la preview', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosVacioResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('No se encontraron datos con los filtros aplicados');
    });
  });

  // ── Error de preview ─────────────────────────────────────────────────────────

  it('debe mostrar el estado de error cuando falla el fetch de preview', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });
  });

  it('debe mostrar el mensaje de error de red en la alerta de error', async () => {
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Error al obtener los datos del reporte');
  });

  // ── Control de permisos de exportación ───────────────────────────────────────

  it('debe mostrar el botón de exportar cuando hasPermission("reportes.exportar") es true', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });
  });

  it('debe ocultar el botón de exportar cuando hasPermission("reportes.exportar") es false', async () => {
    mockAuthService.hasPermission.mockReturnValue(false);
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse);

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    expect(container.querySelector('#btn-exportar')).toBeNull();
  });

  // ── Flujo de exportación — POST + polling ─────────────────────────────────────

  it('debe llamar a POST /api/reportes/:id/exportar al hacer clic en "Exportar"', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);
    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponseLarge)
      .mockResolvedValueOnce(exportJobPendiente);

    vi.useFakeTimers();

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });

    const btnExportar = q(container, '#btn-exportar') as HTMLButtonElement;
    btnExportar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reportes/rep-001/exportar'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    vi.useRealTimers();
  });

  it('debe mostrar el estado "done" tras completar el polling (estado listo)', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    // Mock URL.createObjectURL y URL.revokeObjectURL para el triggerCsvDownload
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });

    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse) // GET /api/reportes
      .mockResolvedValueOnce(previewDatosResponseLarge) // GET /api/reportes/:id/datos
      .mockResolvedValueOnce(exportJobPendiente) // POST /exportar
      .mockResolvedValueOnce(exportJobListo); // GET /exportaciones/:jobId

    vi.useFakeTimers();

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });

    const btnExportar = q(container, '#btn-exportar') as HTMLButtonElement;
    btnExportar.click();

    // Esperar a que se establezca el intervalo (POST exportar completado)
    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exportar'),
        expect.any(Object)
      );
    });

    // Avanzar el timer de polling 1500ms
    await vi.advanceTimersByTimeAsync(1500);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-success')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('generado correctamente');

    vi.useRealTimers();
  });

  it('debe mostrar el estado de error cuando el job de polling reporta error', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponseLarge)
      .mockResolvedValueOnce(exportJobPendiente)
      .mockResolvedValueOnce(exportJobError);

    vi.useFakeTimers();

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });

    const btnExportar = q(container, '#btn-exportar') as HTMLButtonElement;
    btnExportar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exportar'),
        expect.any(Object)
      );
    });

    await vi.advanceTimersByTimeAsync(1500);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('error al generar el archivo');

    vi.useRealTimers();
  });

  it('debe mostrar el estado de error cuando falla el fetch del job de polling', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponseLarge)
      .mockResolvedValueOnce(exportJobPendiente)
      .mockRejectedValueOnce(new Error('Connection lost'));

    vi.useFakeTimers();

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });

    const btnExportar = q(container, '#btn-exportar') as HTMLButtonElement;
    btnExportar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exportar'),
        expect.any(Object)
      );
    });

    await vi.advanceTimersByTimeAsync(1500);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    vi.useRealTimers();
  });

  // ── destroy — limpieza de recursos ───────────────────────────────────────────

  it('destroy debe limpiar el intervalo de polling activo', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    mockApiFetch
      .mockResolvedValueOnce(reportesCatalogoResponse)
      .mockResolvedValueOnce(previewDatosResponse)
      .mockResolvedValueOnce(exportJobPendiente);

    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

    reportesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('[data-reporte-id="rep-001"]')).not.toBeNull();
    });

    const card = q(container, '[data-reporte-id="rep-001"]') as HTMLElement;
    card.click();

    const btnVista = q(container, '#btn-vista-previa') as HTMLButtonElement;
    btnVista.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-exportar')).not.toBeNull();
    });

    const btnExportar = q(container, '#btn-exportar') as HTMLButtonElement;
    btnExportar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exportar'),
        expect.any(Object)
      );
    });

    // destroy debe cancelar el intervalo de polling
    reportesPage.destroy();

    expect(clearIntervalSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      reportesPage.destroy();
    }).not.toThrow();
  });

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    reportesPage.render(container);

    expect(() => {
      reportesPage.destroy();
    }).not.toThrow();
  });
});
