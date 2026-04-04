import type { Almacen, Conteo, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo conteos (página de lista con filtros estado/almacén y navegación).
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

import { conteosPage } from './conteos';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixtures de conteos para tests */
const conteosFixture: Conteo[] = [
  {
    id: 'cnt-002',
    numero: 'CNT-2025-0002',
    descripcion: 'Conteo trimestral almacén norte — componentes',
    almacenId: 'alm-002',
    almacenNombre: 'Almacén Norte',
    estado: 'en_curso',
    items: [
      {
        id: 'cnt-002-1',
        productoId: 'prod-009',
        productoCodigo: 'SSD-500-001',
        productoNombre: 'Disco SSD 500GB',
        cantidadSistema: 8,
        ajustado: false,
      },
    ],
    fechaInicio: '2025-03-15T08:00:00.000Z',
    createdAt: '2025-03-12T09:00:00.000Z',
    updatedAt: '2025-03-15T10:00:00.000Z',
    createdBy: 'supervisor@ngr.com',
    updatedBy: 'operario@ngr.com',
  },
  {
    id: 'cnt-003',
    numero: 'CNT-2025-0003',
    descripcion: 'Conteo sorpresa monitores y mobiliario',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    estado: 'planificado',
    items: [],
    createdAt: '2025-03-20T10:00:00.000Z',
    updatedAt: '2025-03-20T10:00:00.000Z',
    createdBy: 'supervisor@ngr.com',
    updatedBy: 'supervisor@ngr.com',
  },
];

/** Respuesta paginada con conteos */
const conteosResponse: PaginatedResponse<Conteo> = {
  data: conteosFixture,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const conteosVaciosResponse: PaginatedResponse<Conteo> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

/** Fixture de almacenes para el filtro */
const almacenesResponse: PaginatedResponse<Almacen> = {
  data: [
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
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'admin@ngr.com',
      updatedBy: 'admin@ngr.com',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

describe('conteosPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: almacenes (filter) + conteos (tabla) — en orden real de llamada
    mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(conteosResponse);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    conteosPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Conteos físicos"', () => {
    conteosPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toBe('Conteos físicos');
  });

  it('debe mostrar el botón "Nuevo Conteo"', () => {
    conteosPage.render(container);

    const btn = q(container, '#btn-nuevo-conteo');
    expect(btn.textContent.trim()).toContain('Nuevo Conteo');
  });

  it('debe mostrar los filtros de estado y almacén', () => {
    conteosPage.render(container);

    expect(container.querySelector('#estado-filter')).not.toBeNull();
    expect(container.querySelector('#almacen-filter')).not.toBeNull();
  });

  it('debe llamar a apiFetch con el endpoint /api/conteos', () => {
    conteosPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/conteos'),
      expect.any(Object)
    );
  });

  it('debe renderizar las filas de la tabla con los datos de conteos', async () => {
    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('CNT-2025-0002');
    });

    expect(container.innerHTML).toContain('CNT-2025-0003');
  });

  it('debe renderizar la descripción y el almacén de cada conteo', async () => {
    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Conteo trimestral almacén norte');
    });

    expect(container.innerHTML).toContain('Almacén Norte');
    expect(container.innerHTML).toContain('Depósito Central');
  });

  // ── Filtro por estado ─────────────────────────────────────────────────────────

  it('debe re-fetchear con ?estado= al cambiar el filtro de estado', async () => {
    mockApiFetch
      .mockResolvedValueOnce(conteosResponse)
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(conteosResponse);

    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('CNT-2025-0002');
    });

    const estadoFilter = q(container, '#estado-filter') as HTMLSelectElement;
    estadoFilter.value = 'en_curso';
    estadoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('estado=en_curso'),
        expect.any(Object)
      );
    });
  });

  it('debe re-fetchear sin ?estado= al seleccionar "Todos los estados"', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(conteosResponse)
      .mockResolvedValueOnce(conteosResponse)
      .mockResolvedValueOnce(conteosResponse);

    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('CNT-2025-0002');
    });

    const estadoFilter = q(container, '#estado-filter') as HTMLSelectElement;

    // Seleccionar un estado primero
    estadoFilter.value = 'planificado';
    estadoFilter.dispatchEvent(new Event('change'));

    // Luego resetear a todos
    estadoFilter.value = '';
    estadoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      const calls = mockApiFetch.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) throw new Error('No API calls recorded');
      expect(lastCall[0]).not.toContain('estado=');
    });
  });

  // ── Filtro por almacén ────────────────────────────────────────────────────────

  it('debe re-fetchear con ?almacenId= al cambiar el filtro de almacén', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(conteosResponse)
      .mockResolvedValueOnce(conteosResponse);

    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('CNT-2025-0002');
    });

    const almacenFilter = q(container, '#almacen-filter') as HTMLSelectElement;
    almacenFilter.value = 'alm-002';
    almacenFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('almacenId=alm-002'),
        expect.any(Object)
      );
    });
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/conteos/:id al hacer clic en una fila', async () => {
    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const firstRow = container.querySelector<HTMLElement>('tbody tr[data-id]');
    firstRow?.click();

    expect(window.location.hash).toBe('#/conteos/cnt-002');
  });

  // ── Botón "Nuevo Conteo" ──────────────────────────────────────────────────────

  it('debe navegar a #/conteos/nuevo al hacer clic en el botón "Nuevo Conteo"', () => {
    conteosPage.render(container);

    const btn = q(container, '#btn-nuevo-conteo') as HTMLButtonElement;
    btn.click();

    expect(window.location.hash).toBe('#/conteos/nuevo');
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin conteos registrados" cuando no hay conteos', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(conteosVaciosResponse);

    conteosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin conteos registrados');
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    conteosPage.render(container);

    expect(() => {
      conteosPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      conteosPage.destroy();
    }).not.toThrow();
  });
});
