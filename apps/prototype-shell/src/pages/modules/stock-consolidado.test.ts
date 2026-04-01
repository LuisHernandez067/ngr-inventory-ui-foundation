import type { PaginatedResponse, StockConsolidado } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo stock-consolidado (totales por producto con badges de 3 niveles).
// Se mockea apiFetch para aislar el comportamiento del componente.

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

import { apiFetch } from '../_shared/apiFetch';

import { stockConsolidadoPage } from './stock-consolidado';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixtures de stock consolidado para tests */
const consolidadoFixture: StockConsolidado[] = [
  {
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    cantidadTotal: 10,
    stockMinimo: 5,
    stockMaximo: 50,
    bajoMinimo: false,
    items: [],
  },
  {
    productoId: 'prod-003',
    productoCodigo: 'SIL-ERG-001',
    productoNombre: 'Silla Ergonómica Gamer',
    cantidadTotal: 1,
    stockMinimo: 2,
    bajoMinimo: true,
    items: [],
  },
  {
    productoId: 'prod-007',
    productoCodigo: 'AUR-MIC-001',
    productoNombre: 'Auriculares con Micrófono',
    cantidadTotal: 0,
    stockMinimo: 5,
    bajoMinimo: true,
    items: [],
  },
];

/** Respuesta paginada de stock consolidado con datos */
const consolidadoResponse: PaginatedResponse<StockConsolidado> = {
  data: consolidadoFixture,
  total: 3,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada de stock consolidado vacía */
const consolidadoVacio: PaginatedResponse<StockConsolidado> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

describe('stockConsolidadoPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    stockConsolidadoPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Stock Consolidado"', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(q(container, 'h1').textContent.trim()).toContain('Stock Consolidado');
    });
  });

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    stockConsolidadoPage.render(container);

    expect(container.innerHTML).toContain('spinner-border');
  });

  it('debe renderizar la tabla con los datos consolidados', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    expect(container.innerHTML).toContain('Silla Ergonómica Gamer');
    expect(container.innerHTML).toContain('Auriculares con Micrófono');
  });

  // ── Badges de 3 niveles ───────────────────────────────────────────────────────

  it('debe mostrar badge "Sin stock" (bg-danger) cuando cantidadTotal es 0', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Auriculares con Micrófono');
    });

    expect(container.innerHTML).toContain('bg-danger');
    expect(container.innerHTML).toContain('Sin stock');
  });

  it('debe mostrar badge "Bajo mínimo" (bg-warning) cuando bajoMinimo es true y cantidadTotal > 0', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Silla Ergonómica Gamer');
    });

    expect(container.innerHTML).toContain('bg-warning');
    expect(container.innerHTML).toContain('Bajo mínimo');
  });

  it('debe mostrar badge "Disponible" (bg-success) cuando bajoMinimo es false y cantidadTotal > 0', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    expect(container.innerHTML).toContain('bg-success');
    expect(container.innerHTML).toContain('Disponible');
  });

  // ── Links de detalle ──────────────────────────────────────────────────────────

  it('debe mostrar links "Ver detalle" que navegan a #/stock?productoId=...', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('.ver-detalle-btn').length).toBeGreaterThan(0);
    });

    const firstLink = q(container, '.ver-detalle-btn') as HTMLAnchorElement;
    expect(firstLink.getAttribute('href')).toContain('#/stock?productoId=');
    expect(firstLink.textContent.trim()).toContain('Ver detalle');
  });

  it('el link "Ver detalle" de Teclado Mecánico debe apuntar a su productoId', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    const row = container.querySelector<HTMLElement>('tr[data-producto-id="prod-001"]');
    expect(row).not.toBeNull();
    const link = row?.querySelector<HTMLAnchorElement>('.ver-detalle-btn');
    expect(link?.getAttribute('href')).toContain('productoId=prod-001');
  });

  // ── Link "Volver" ─────────────────────────────────────────────────────────────

  it('debe mostrar el link "Volver" que apunta a #/stock', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoResponse);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    const link = q(container, 'a[href="#/stock"]') as HTMLAnchorElement;
    expect(link.textContent.trim()).toContain('Volver');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin registros de stock consolidado" cuando no hay datos', async () => {
    mockApiFetch.mockResolvedValueOnce(consolidadoVacio);
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin registros de stock consolidado');
    });
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar error en la tabla cuando la carga falla', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));
    stockConsolidadoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    stockConsolidadoPage.render(container);

    expect(() => {
      stockConsolidadoPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      stockConsolidadoPage.destroy();
    }).not.toThrow();
  });
});
