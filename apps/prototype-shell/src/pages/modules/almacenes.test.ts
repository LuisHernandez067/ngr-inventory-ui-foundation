import type { Almacen, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo almacenes (página de lista).
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

import { almacenesPage } from './almacenes';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Fixture de almacenes para tests */
const almacenesFixture: Almacen[] = [
  {
    id: 'alm-001',
    codigo: 'DEP-CEN',
    nombre: 'Depósito Central',
    descripcion: 'Almacén principal',
    direccion: 'Av. Industrial 1000',
    responsableNombre: 'Carlos Rodríguez',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'alm-002',
    codigo: 'DEP-SUR',
    nombre: 'Depósito Sur',
    descripcion: 'Almacén secundario',
    direccion: 'Av. Belgrano 500',
    responsableNombre: 'Ana García',
    status: 'inactive',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada con almacenes */
const almacenesResponse: PaginatedResponse<Almacen> = {
  data: almacenesFixture,
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const almacenesVaciosResponse: PaginatedResponse<Almacen> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0,
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('almacenesPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto rol admin
    mockAuthService.getProfile.mockReturnValue('admin');
    // Mock que resuelve con datos por defecto
    mockApiFetch.mockResolvedValue(almacenesResponse);
    // Resetear la URL entre tests
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    almacenesPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Almacenes"', () => {
    almacenesPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toBe('Almacenes');
  });

  it('debe llamar a apiFetch con el endpoint /api/almacenes', () => {
    almacenesPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/almacenes'),
      expect.any(Object)
    );
  });

  it('debe renderizar las filas de la tabla con los datos del almacén', async () => {
    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Depósito Central');
    });

    expect(container.innerHTML).toContain('DEP-CEN');
    expect(container.innerHTML).toContain('Depósito Sur');
    expect(container.innerHTML).toContain('DEP-SUR');
  });

  it('debe renderizar el badge Activo para almacenes con status active', async () => {
    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Activo');
    });

    expect(container.innerHTML).toContain('bg-success');
  });

  it('debe renderizar el badge Inactivo para almacenes con status inactive', async () => {
    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Inactivo');
    });

    expect(container.innerHTML).toContain('bg-secondary');
  });

  // ── Búsqueda ──────────────────────────────────────────────────────────────────

  it('debe relanzar apiFetch con el parámetro search al buscar', async () => {
    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Depósito Central');
    });

    // Disparar evento de búsqueda desde el toolbar
    const toolbarContainer = q(container, '#toolbar-container') as HTMLElement;
    toolbarContainer.dispatchEvent(
      new CustomEvent('ngr:search', {
        detail: { query: 'central' },
        bubbles: true,
      })
    );

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('search=central'),
      expect.any(Object)
    );
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/almacenes/:id al hacer clic en una fila', async () => {
    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });

    // Hacer clic en la primera fila del DataTable (tbody tr)
    const firstRow = container.querySelector<HTMLElement>('tbody tr');
    firstRow?.click();

    expect(window.location.hash).toBe('#/almacenes/alm-001');
  });

  // ── Botón de acción — visibilidad según rol ───────────────────────────────────

  it('debe mostrar el botón "Nuevo almacén" para el rol admin', () => {
    mockAuthService.getProfile.mockReturnValue('admin');

    almacenesPage.render(container);

    const btn = container.querySelector('.ngr-action-btn');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Nuevo almacén');
  });

  it('debe mostrar el botón "Nuevo almacén" para el rol operador', () => {
    mockAuthService.getProfile.mockReturnValue('operador');

    almacenesPage.render(container);

    const btn = container.querySelector('.ngr-action-btn');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Nuevo almacén');
  });

  it('NO debe mostrar el botón de acción para el rol consulta', () => {
    mockAuthService.getProfile.mockReturnValue('consulta');

    almacenesPage.render(container);

    expect(container.querySelector('.ngr-action-btn')).toBeNull();
  });

  it('debe navegar a #/almacenes/nuevo al hacer clic en el botón de acción', () => {
    mockAuthService.getProfile.mockReturnValue('admin');

    almacenesPage.render(container);

    const btn = q(container, '.ngr-action-btn') as HTMLButtonElement;
    btn.click();

    expect(window.location.hash).toBe('#/almacenes/nuevo');
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'));

    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe renderizar la tabla vacía cuando no hay almacenes', async () => {
    mockApiFetch.mockResolvedValue(almacenesVaciosResponse);

    almacenesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // Sin datos de almacenes en el DOM
    expect(container.innerHTML).not.toContain('Depósito Central');
    expect(container.innerHTML).not.toContain('DEP-CEN');
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    almacenesPage.render(container);

    expect(() => {
      almacenesPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    // No llamamos render, solo destroy
    expect(() => {
      almacenesPage.destroy();
    }).not.toThrow();
  });
});
