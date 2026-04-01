import type { Almacen, Ubicacion } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo almacenes-detail.
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
import { apiFetch, ApiError } from '../_shared/apiFetch';

import { almacenesDetailPage } from './almacenes-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Almacén con ubicacionCount */
type AlmacenWithCount = Almacen & { ubicacionCount: number };

/** Fixture de almacén base sin ubicaciones */
const almacenBase: AlmacenWithCount = {
  id: 'alm-001',
  codigo: 'DEP-CEN',
  nombre: 'Depósito Central',
  descripcion: 'Almacén principal con mayor capacidad de almacenamiento',
  direccion: 'Av. Industrial 1000, Buenos Aires',
  responsableNombre: 'Carlos Rodríguez',
  status: 'active',
  ubicacionCount: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

/** Fixture de almacén con ubicaciones */
const almacenConUbicaciones: AlmacenWithCount = {
  ...almacenBase,
  ubicacionCount: 4,
};

/** Fixture de ubicaciones para tests */
const ubicacionesFixture: Ubicacion[] = [
  {
    id: 'ubi-001',
    codigo: 'A1-R1-E1',
    nombre: 'Rack 1 Estante 1',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'rack',
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
    status: 'active',
    createdAt: '2025-01-02T08:00:00.000Z',
    updatedAt: '2025-01-02T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Tipo de la respuesta paginada de ubicaciones */
interface UbicacionesPageResponse {
  data: Ubicacion[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Respuesta paginada vacía de ubicaciones */
const ubicacionesVacias: UbicacionesPageResponse = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 100,
  totalPages: 0,
};

/** Respuesta paginada de ubicaciones con datos */
const ubicacionesResponse = {
  data: ubicacionesFixture,
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('almacenesDetailPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Por defecto rol admin — puede ver todo
    mockAuthService.getProfile.mockReturnValue('admin');
    vi.clearAllMocks();
    // Restaurar mock de perfil después de clearAllMocks
    mockAuthService.getProfile.mockReturnValue('admin');
    // Resetear la URL entre tests
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    almacenesDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    almacenesDetailPage.render(container, { id: 'alm-001' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando almacén');
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('debe renderizar nombre, código y descripción del almacén', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Depósito Central');
    expect(container.innerHTML).toContain('DEP-CEN');
    expect(container.innerHTML).toContain('Almacén principal con mayor capacidad');
  });

  it('debe renderizar el badge de estado activo', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Activo');
  });

  it('debe renderizar la lista de ubicaciones embebidas', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenConUbicaciones)
      .mockResolvedValueOnce(ubicacionesResponse);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Rack 1 Estante 1');
    expect(container.innerHTML).toContain('Rack 1 Estante 2');
  });

  it('debe mostrar "Sin ubicaciones registradas" cuando el almacén no tiene ubicaciones', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Sin ubicaciones registradas');
  });

  it('debe mostrar la alerta de impacto cuando ubicacionCount > 0', async () => {
    mockApiFetch
      .mockResolvedValueOnce(almacenConUbicaciones)
      .mockResolvedValueOnce(ubicacionesResponse);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#impact-warning')).not.toBeNull();
    });

    expect(container.querySelector('#impact-warning')?.textContent).toContain('4');
    expect(container.innerHTML).toContain('alert-warning');
  });

  it('no debe mostrar alerta de impacto cuando ubicacionCount === 0', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#impact-warning')).toBeNull();
  });

  // ── Rol consulta — oculta acciones ──────────────────────────────────────────

  it('debe ocultar el ActionMenu para el rol consulta', async () => {
    mockAuthService.getProfile.mockReturnValue('consulta');
    mockApiFetch
      .mockResolvedValueOnce(almacenConUbicaciones)
      .mockResolvedValueOnce(ubicacionesResponse);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#almacen-actions')).toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol admin', async () => {
    mockAuthService.getProfile.mockReturnValue('admin');
    mockApiFetch
      .mockResolvedValueOnce(almacenConUbicaciones)
      .mockResolvedValueOnce(ubicacionesResponse);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#almacen-actions')).not.toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol operador', async () => {
    mockAuthService.getProfile.mockReturnValue('operador');
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#almacen-actions')).not.toBeNull();
  });

  // ── Estado de error ──────────────────────────────────────────────────────────

  it('debe mostrar alerta de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el almacén');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────────

  it('debe navegar a #/almacenes al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container, { id: 'alm-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/almacenes');
  });

  it('debe usar alm-001 por defecto si no se pasan params', async () => {
    mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);

    almacenesDetailPage.render(container);

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/almacenes/alm-001', expect.any(Object));
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    almacenesDetailPage.render(container, { id: 'alm-001' });
    expect(() => {
      almacenesDetailPage.destroy();
    }).not.toThrow();
  });

  // ── Flujo de eliminación ─────────────────────────────────────────────────────

  describe('eliminación confirmada', () => {
    /**
     * Renderiza el detalle y espera a que los datos estén disponibles en el DOM.
     */
    async function renderAndWait(
      almacen: AlmacenWithCount,
      ubicaciones: UbicacionesPageResponse = ubicacionesVacias
    ): Promise<void> {
      almacenesDetailPage.render(container, { id: almacen.id });
      await vi.waitFor(() => {
        expect(container.querySelector('h1')).not.toBeNull();
      });
      // Consumir los dos mocks de la petición
      void ubicaciones;
    }

    /**
     * Dispara el evento ngr:action con id 'delete' sobre el ActionMenu del almacén.
     */
    function dispatchDeleteAction(): void {
      const actionMenuRoot = container.querySelector<HTMLElement>('#almacen-actions');
      const event = new CustomEvent('ngr:action', {
        detail: { id: 'delete' },
        bubbles: true,
      });
      actionMenuRoot?.dispatchEvent(event);
    }

    it('debe usar el mensaje de impacto cuando ubicacionCount > 0', async () => {
      mockApiFetch
        .mockResolvedValueOnce(almacenConUbicaciones)
        .mockResolvedValueOnce(ubicacionesResponse)
        .mockResolvedValueOnce(undefined as unknown as Almacen);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(almacenConUbicaciones, ubicacionesResponse);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      const msgMatcher = expect.stringContaining('4') as unknown as string;
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Eliminar almacén',
          message: msgMatcher,
        })
      );
    });

    it('debe usar el mensaje genérico cuando ubicacionCount === 0', async () => {
      mockApiFetch
        .mockResolvedValueOnce(almacenBase)
        .mockResolvedValueOnce(ubicacionesVacias)
        .mockResolvedValueOnce(undefined as unknown as Almacen);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(almacenBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Eliminar almacén',
          message: '¿Estás seguro? Esta acción no se puede deshacer.',
        })
      );
    });

    it('debe llamar DELETE y navegar a #/almacenes cuando el usuario confirma', async () => {
      mockApiFetch
        .mockResolvedValueOnce(almacenBase)
        .mockResolvedValueOnce(ubicacionesVacias)
        .mockResolvedValueOnce(undefined as unknown as Almacen);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(almacenBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/almacenes/alm-001',
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      expect(window.location.hash).toBe('#/almacenes');
    });

    it('no debe llamar DELETE cuando el usuario cancela el diálogo', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenBase).mockResolvedValueOnce(ubicacionesVacias);
      mockConfirm.mockResolvedValue(false);

      await renderAndWait(almacenBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      expect(mockApiFetch).toHaveBeenCalledTimes(2);
      expect(mockApiFetch).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('debe mostrar alerta de error inline y no navegar cuando DELETE falla', async () => {
      mockApiFetch
        .mockResolvedValueOnce(almacenBase)
        .mockResolvedValueOnce(ubicacionesVacias)
        .mockRejectedValueOnce(new Error('Network error'));
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(almacenBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(container.querySelector('#delete-error')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo eliminar el almacén');
      expect(window.location.hash).not.toBe('#/almacenes');
    });

    it('debe mostrar alerta de advertencia cuando DELETE retorna 409 (tiene ubicaciones)', async () => {
      const apiError = new ApiError(409, {
        type: '/errors/conflict',
        title: 'No se puede eliminar',
        status: 409,
        detail: 'Tiene ubicaciones asociadas',
      });
      mockApiFetch
        .mockResolvedValueOnce(almacenConUbicaciones)
        .mockResolvedValueOnce(ubicacionesResponse)
        .mockRejectedValueOnce(apiError);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(almacenConUbicaciones, ubicacionesResponse);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(container.querySelector('#delete-error')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('ubicaciones asociadas');
    });
  });
});
