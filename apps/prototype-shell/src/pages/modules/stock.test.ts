import type {
  Almacen,
  PaginatedResponse,
  StockItem,
  Ubicacion,
} from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo stock (página personalizada con filtros y badges semánticos).
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

// Mockear authService para controlar el rol en tests
vi.mock('../../services/authService', () => ({
  authService: {
    getProfile: vi.fn(),
  },
}));

import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

import { stockPage } from './stock';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixtures de almacenes para tests */
const almacenesFixture: Almacen[] = [
  {
    id: 'alm-001',
    codigo: 'DEP-CEN',
    nombre: 'Depósito Central',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'alm-002',
    codigo: 'ALM-NOR',
    nombre: 'Almacén Norte',
    status: 'active',
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada de almacenes */
const almacenesResponse: PaginatedResponse<Almacen> = {
  data: almacenesFixture,
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

/** Fixtures de ubicaciones para tests */
const ubicacionesFixture: Ubicacion[] = [
  {
    id: 'ubi-001',
    codigo: 'A1-R1-E1',
    nombre: 'Rack 1 Estante 1',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'rack',
    capacidad: 200,
    status: 'active',
    createdAt: '2025-01-02T08:00:00.000Z',
    updatedAt: '2025-01-02T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada de ubicaciones */
const ubicacionesResponse: PaginatedResponse<Ubicacion> = {
  data: ubicacionesFixture,
  total: 1,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

/** Fixtures de stock para tests */
const stockItemsFixture: StockItem[] = [
  {
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    ubicacionId: 'ubi-001',
    ubicacionNombre: 'Rack 1 Estante 1',
    cantidadDisponible: 8,
    cantidadReservada: 2,
    cantidadTotal: 10,
    unidadMedida: 'unidad',
  },
  {
    productoId: 'prod-002',
    productoCodigo: 'MON-IPS-001',
    productoNombre: 'Monitor 27 pulgadas IPS',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    ubicacionId: 'ubi-001',
    ubicacionNombre: 'Rack 1 Estante 1',
    cantidadDisponible: 0,
    cantidadReservada: 0,
    cantidadTotal: 0,
    unidadMedida: 'unidad',
  },
];

/** Respuesta paginada de stock con datos */
const stockResponse: PaginatedResponse<StockItem> = {
  data: stockItemsFixture,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada de stock vacía */
const stockVacio: PaginatedResponse<StockItem> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

/**
 * Configura los mocks por defecto para carga estándar:
 * almacenes → ubicaciones (paralelo) → stock
 */
function setupDefaultMocks(): void {
  mockApiFetch
    .mockResolvedValueOnce(almacenesResponse) // almacenes
    .mockResolvedValueOnce(ubicacionesResponse) // ubicaciones
    .mockResolvedValueOnce(stockResponse); // stock
}

describe('stockPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    mockAuthService.getProfile.mockReturnValue('admin');
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    stockPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Stock"', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(q(container, 'h1').textContent.trim()).toContain('Stock');
    });
  });

  it('debe mostrar spinner durante la carga inicial', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    stockPage.render(container);

    expect(container.innerHTML).toContain('spinner-border');
  });

  it('debe renderizar la tabla con los datos de stock cargados', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    expect(container.innerHTML).toContain('Monitor 27 pulgadas IPS');
  });

  // ── Filtro por almacén ────────────────────────────────────────────────────────

  it('debe renderizar el dropdown de filtro de almacenes con las opciones cargadas', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacen-filter')).not.toBeNull();
    });

    const filter = q(container, '#almacen-filter') as HTMLSelectElement;
    expect(filter.innerHTML).toContain('Depósito Central');
    expect(filter.innerHTML).toContain('Almacén Norte');
  });

  it('debe re-fetchear con ?almacenId= al cambiar el filtro de almacén', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse) // almacenes
      .mockResolvedValueOnce(ubicacionesResponse) // ubicaciones (parallel)
      .mockResolvedValueOnce(stockResponse) // stock inicial
      .mockResolvedValueOnce(stockResponse); // stock tras cambio de filtro

    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacen-filter')).not.toBeNull();
    });

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    const filter = q(container, '#almacen-filter') as HTMLSelectElement;
    filter.value = 'alm-001';
    filter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('almacenId=alm-001'),
        expect.any(Object)
      );
    });
  });

  // ── Checkbox bajoMinimo ───────────────────────────────────────────────────────

  it('debe re-fetchear con ?bajoMinimo=true al activar el checkbox', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(ubicacionesResponse)
      .mockResolvedValueOnce(stockResponse) // stock inicial
      .mockResolvedValueOnce(stockVacio); // stock tras activar checkbox

    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#bajo-minimo-check')).not.toBeNull();
    });

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    const checkbox = q(container, '#bajo-minimo-check') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('bajoMinimo=true'),
        expect.any(Object)
      );
    });
  });

  // ── Badges semánticos ─────────────────────────────────────────────────────────

  it('debe mostrar badge "Sin stock" (bg-danger) cuando cantidadDisponible es 0', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Monitor 27 pulgadas IPS');
    });

    expect(container.innerHTML).toContain('bg-danger');
    expect(container.innerHTML).toContain('Sin stock');
  });

  it('debe mostrar badge "Disponible" (bg-success) cuando cantidadDisponible > 0', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    });

    expect(container.innerHTML).toContain('bg-success');
    expect(container.innerHTML).toContain('Disponible');
  });

  // ── Link "Ver consolidado" ────────────────────────────────────────────────────

  it('debe mostrar el link "Ver consolidado" que apunta a #/stock/consolidado', async () => {
    setupDefaultMocks();
    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    const link = q(container, 'a[href="#/stock/consolidado"]') as HTMLAnchorElement;
    expect(link.textContent.trim()).toContain('Ver consolidado');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin registros de stock" cuando no hay datos', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(ubicacionesResponse)
      .mockResolvedValueOnce(stockVacio);

    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin registros de stock');
    });
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar error en la tabla cuando la carga de stock falla', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(ubicacionesResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    stockPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    stockPage.render(container);

    expect(() => {
      stockPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      stockPage.destroy();
    }).not.toThrow();
  });
});
