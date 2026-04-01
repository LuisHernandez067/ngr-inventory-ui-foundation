import type { Almacen, PaginatedResponse, Ubicacion } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo ubicaciones (página de lista personalizada con filtro de almacén).
// Se mockean apiFetch, authService y ConfirmDialog para aislar el comportamiento del componente.

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

// Mockear ConfirmDialog para controlar el resultado del diálogo
vi.mock('@ngr-inventory/ui-core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    ConfirmDialog: {
      confirm: vi.fn(),
    },
  };
});

import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

import { ubicacionesPage } from './ubicaciones';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

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
  {
    id: 'ubi-002',
    codigo: 'A1-R1-E2',
    nombre: 'Rack 1 Estante 2',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'rack',
    capacidad: 200,
    status: 'inactive',
    createdAt: '2025-01-02T08:00:00.000Z',
    updatedAt: '2025-01-02T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada de ubicaciones con datos */
const ubicacionesResponse: PaginatedResponse<Ubicacion> = {
  data: ubicacionesFixture,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía de ubicaciones */
const ubicacionesVacias: PaginatedResponse<Ubicacion> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

/** Configura el mock para una carga estándar: almacenes → ubicaciones */
function setupDefaultMocks(): void {
  mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(ubicacionesResponse);
}

describe('ubicacionesPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto rol admin
    mockAuthService.getProfile.mockReturnValue('admin');
    // Resetear la URL entre tests
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    ubicacionesPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Ubicaciones"', async () => {
    setupDefaultMocks();
    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toContain('Ubicaciones');
    });
  });

  it('debe mostrar spinner durante la carga inicial de almacenes', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    ubicacionesPage.render(container);

    expect(container.innerHTML).toContain('spinner-border');
  });

  it('debe renderizar la tabla con las ubicaciones cargadas', async () => {
    setupDefaultMocks();
    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Rack 1 Estante 1');
    });

    expect(container.innerHTML).toContain('Rack 1 Estante 2');
  });

  it('debe renderizar el dropdown de filtro de almacenes con las opciones cargadas', async () => {
    setupDefaultMocks();
    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacen-filter')).not.toBeNull();
    });

    const filter = q(container, '#almacen-filter') as HTMLSelectElement;
    expect(filter.innerHTML).toContain('Depósito Central');
    expect(filter.innerHTML).toContain('Almacén Norte');
  });

  it('debe renderizar los badges de estado activo e inactivo', async () => {
    setupDefaultMocks();
    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Rack 1 Estante 1');
    });

    expect(container.innerHTML).toContain('bg-success');
    expect(container.innerHTML).toContain('bg-secondary');
  });

  // ── Filtro por almacén ────────────────────────────────────────────────────────

  it('debe re-fetchear con ?almacenId= al cambiar el dropdown de filtro', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse) // almacenes filter
      .mockResolvedValueOnce(ubicacionesResponse) // initial ubicaciones
      .mockResolvedValueOnce(ubicacionesResponse); // after filter change

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacen-filter')).not.toBeNull();
    });

    // Esperar que la carga inicial termine
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Rack 1 Estante 1');
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

  it('debe re-fetchear sin almacenId al seleccionar "Todos los almacenes"', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse) // almacenes filter
      .mockResolvedValueOnce(ubicacionesResponse) // initial ubicaciones
      .mockResolvedValueOnce(ubicacionesResponse); // after filter reset

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacen-filter')).not.toBeNull();
    });

    // Esperar que la carga inicial termine
    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Rack 1 Estante 1');
    });

    const filter = q(container, '#almacen-filter') as HTMLSelectElement;
    // Primero seleccionar un almacén, luego resetear
    filter.value = '';
    filter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      const calls = mockApiFetch.mock.calls;
      const lastCall = calls[calls.length - 1];
      if (!lastCall) throw new Error('No API calls recorded');
      expect(lastCall[0]).not.toContain('almacenId=');
    });
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/ubicaciones/:id al hacer clic en una fila', async () => {
    setupDefaultMocks();
    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const firstRow = container.querySelector<HTMLElement>('tbody tr[data-id]');
    firstRow?.click();

    expect(window.location.hash).toBe('#/ubicaciones/ubi-001');
  });

  // ── Botón crear — visibilidad según rol ──────────────────────────────────────

  it('debe mostrar el botón "Nueva ubicación" para el rol admin', async () => {
    mockAuthService.getProfile.mockReturnValue('admin');
    setupDefaultMocks();

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Nueva ubicación');
  });

  it('debe mostrar el botón "Nueva ubicación" para el rol operador', async () => {
    mockAuthService.getProfile.mockReturnValue('operador');
    setupDefaultMocks();

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Nueva ubicación');
  });

  it('NO debe mostrar el botón "Nueva ubicación" para el rol consulta', async () => {
    mockAuthService.getProfile.mockReturnValue('consulta');
    setupDefaultMocks();

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).not.toContain('Nueva ubicación');
  });

  // ── Eliminación ──────────────────────────────────────────────────────────────

  it('debe mostrar diálogo de confirmación al eliminar y llamar DELETE si se confirma', async () => {
    mockConfirm.mockResolvedValue(true);
    // Configurar: almacenes, ubicaciones, DELETE, ubicaciones (refresh)
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(ubicacionesResponse)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(ubicacionesVacias);

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    // Encontrar y hacer clic en el primer botón de eliminar
    const deleteBtn = container.querySelector<HTMLButtonElement>('.ubicacion-delete-btn');
    expect(deleteBtn).not.toBeNull();

    deleteBtn?.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ubicaciones/'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('no debe llamar DELETE si el usuario cancela el diálogo', async () => {
    mockConfirm.mockResolvedValue(false);
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockResolvedValueOnce(ubicacionesResponse);

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const deleteBtn = container.querySelector<HTMLButtonElement>('.ubicacion-delete-btn');
    deleteBtn?.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    // Verificar que no se llamó DELETE
    const deleteCall = vi
      .mocked(apiFetch)
      .mock.calls.find(([, opts]) => opts && 'method' in opts && opts.method === 'DELETE');
    expect(deleteCall).toBeUndefined();
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar error en la tabla cuando la carga de ubicaciones falla', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenesResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin ubicaciones registradas" cuando no hay ubicaciones', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(ubicacionesVacias);

    ubicacionesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin ubicaciones registradas');
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    ubicacionesPage.render(container);

    expect(() => {
      ubicacionesPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      ubicacionesPage.destroy();
    }).not.toThrow();
  });
});
