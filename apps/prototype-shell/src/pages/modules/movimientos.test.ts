import type { Movimiento, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo movimientos (página de lista con filtros tipo/estado/search y navegación).
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

import { movimientosPage } from './movimientos';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixtures de movimientos para tests */
const movimientosFixture: Movimiento[] = [
  {
    id: 'mov-001',
    numero: 'MOV-2025-001',
    tipo: 'entrada',
    estado: 'ejecutado',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Depósito Central',
    items: [
      {
        id: 'item-001',
        productoId: 'prod-001',
        productoCodigo: 'PROD-001',
        productoNombre: 'Producto A',
        cantidad: 10,
        precioUnitario: 5000,
      },
    ],
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'mov-002',
    numero: 'MOV-2025-002',
    tipo: 'salida',
    estado: 'borrador',
    almacenOrigenId: 'alm-001',
    almacenOrigenNombre: 'Depósito Central',
    items: [],
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada con movimientos */
const movimientosResponse: PaginatedResponse<Movimiento> = {
  data: movimientosFixture,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const movimientosVaciosResponse: PaginatedResponse<Movimiento> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

describe('movimientosPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Mock que resuelve con datos por defecto
    mockApiFetch.mockResolvedValue(movimientosResponse);
    // Resetear la URL entre tests
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    movimientosPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Movimientos"', () => {
    movimientosPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toBe('Movimientos');
  });

  it('debe mostrar el botón "Nuevo Movimiento"', () => {
    movimientosPage.render(container);

    const btn = q(container, '#btn-nuevo-movimiento');
    expect(btn.textContent.trim()).toContain('Nuevo Movimiento');
  });

  it('debe mostrar los filtros de tipo y estado', () => {
    movimientosPage.render(container);

    expect(container.querySelector('#tipo-filter')).not.toBeNull();
    expect(container.querySelector('#estado-filter')).not.toBeNull();
  });

  it('debe mostrar el campo de búsqueda', () => {
    movimientosPage.render(container);

    expect(container.querySelector('#movimientos-search')).not.toBeNull();
  });

  it('debe llamar a apiFetch con el endpoint /api/movimientos', () => {
    movimientosPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/movimientos'),
      expect.any(Object)
    );
  });

  it('debe renderizar las filas de la tabla con los datos de movimientos', async () => {
    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    expect(container.innerHTML).toContain('MOV-2025-002');
  });

  it('debe renderizar el badge del tipo de movimiento', async () => {
    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('entrada');
    });

    expect(container.innerHTML).toContain('bg-success');
  });

  it('debe renderizar el badge del estado del movimiento', async () => {
    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('ejecutado');
    });

    expect(container.innerHTML).toContain('borrador');
  });

  // ── Filtro por tipo ───────────────────────────────────────────────────────────

  it('debe re-fetchear con ?tipo= al cambiar el filtro de tipo', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const tipoFilter = q(container, '#tipo-filter') as HTMLSelectElement;
    tipoFilter.value = 'entrada';
    tipoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('tipo=entrada'),
        expect.any(Object)
      );
    });
  });

  it('debe re-fetchear sin ?tipo= al seleccionar "Todos los tipos"', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const tipoFilter = q(container, '#tipo-filter') as HTMLSelectElement;

    // Seleccionar un tipo primero
    tipoFilter.value = 'salida';
    tipoFilter.dispatchEvent(new Event('change'));

    // Luego resetear a todos
    tipoFilter.value = '';
    tipoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      const calls = mockApiFetch.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) throw new Error('No API calls recorded');
      expect(lastCall[0]).not.toContain('tipo=');
    });
  });

  // ── Filtro por estado ─────────────────────────────────────────────────────────

  it('debe re-fetchear con ?estado= al cambiar el filtro de estado', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const estadoFilter = q(container, '#estado-filter') as HTMLSelectElement;
    estadoFilter.value = 'borrador';
    estadoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('estado=borrador'),
        expect.any(Object)
      );
    });
  });

  // ── Búsqueda libre ────────────────────────────────────────────────────────────

  it('debe re-fetchear con ?search= al escribir en el campo de búsqueda', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const searchInput = q(container, '#movimientos-search') as HTMLInputElement;
    searchInput.value = 'MOV-2025';
    searchInput.dispatchEvent(new Event('input'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=MOV-2025'),
        expect.any(Object)
      );
    });
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/movimientos/:id al hacer clic en una fila', async () => {
    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const firstRow = container.querySelector<HTMLElement>('tbody tr[data-id]');
    firstRow?.click();

    expect(window.location.hash).toBe('#/movimientos/mov-001');
  });

  // ── Botón "Nuevo Movimiento" ──────────────────────────────────────────────────

  it('debe navegar a #/movimientos/nuevo al hacer clic en el botón "Nuevo Movimiento"', () => {
    movimientosPage.render(container);

    const btn = q(container, '#btn-nuevo-movimiento') as HTMLButtonElement;
    btn.click();

    expect(window.location.hash).toBe('#/movimientos/nuevo');
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin movimientos registrados" cuando no hay movimientos', async () => {
    mockApiFetch.mockResolvedValue(movimientosVaciosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin movimientos registrados');
    });
  });

  // ── Filtros de fecha ──────────────────────────────────────────────────────────

  it('debe re-fetchear con ?fechaDesde= al cambiar el input fecha-desde', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const fechaDesdeInput = q(container, '#fecha-desde') as HTMLInputElement;
    fechaDesdeInput.value = '2025-01-01';
    fechaDesdeInput.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('fechaDesde=2025-01-01'),
        expect.any(Object)
      );
    });
  });

  it('debe re-fetchear con ?fechaHasta= al cambiar el input fecha-hasta', async () => {
    mockApiFetch
      .mockResolvedValueOnce(movimientosResponse)
      .mockResolvedValueOnce(movimientosResponse);

    movimientosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('MOV-2025-001');
    });

    const fechaHastaInput = q(container, '#fecha-hasta') as HTMLInputElement;
    fechaHastaInput.value = '2025-12-31';
    fechaHastaInput.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('fechaHasta=2025-12-31'),
        expect.any(Object)
      );
    });
  });

  it('debe mostrar los inputs de fecha desde y hasta en la barra de filtros', () => {
    movimientosPage.render(container);

    expect(container.querySelector('#fecha-desde')).not.toBeNull();
    expect(container.querySelector('#fecha-hasta')).not.toBeNull();
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    movimientosPage.render(container);

    expect(() => {
      movimientosPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    // No llamamos render, solo destroy
    expect(() => {
      movimientosPage.destroy();
    }).not.toThrow();
  });
});
