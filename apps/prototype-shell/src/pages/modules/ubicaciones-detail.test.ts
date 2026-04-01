import type { Ubicacion } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo ubicaciones-detail.
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

import { ubicacionesDetailPage } from './ubicaciones-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Fixture de ubicación para tests */
const ubicacionFixture: Ubicacion = {
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
};

/** Fixture de ubicación inactiva para tests */
const ubicacionInactiva: Ubicacion = {
  ...ubicacionFixture,
  id: 'ubi-002',
  status: 'inactive',
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('ubicacionesDetailPage', () => {
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
    ubicacionesDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando ubicación');
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('debe renderizar nombre, código y tipo de la ubicación', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Rack 1 Estante 1');
    expect(container.innerHTML).toContain('A1-R1-E1');
    expect(container.innerHTML).toContain('rack');
  });

  it('debe renderizar el badge de estado activo', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Activo');
  });

  it('debe renderizar el badge de estado inactivo', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionInactiva);

    ubicacionesDetailPage.render(container, { id: 'ubi-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Inactivo');
  });

  it('debe mostrar el enlace al almacén padre', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    // Verificar que existe un enlace al almacén padre
    const almacenLink = container.querySelector<HTMLAnchorElement>(`a[href="#/almacenes/alm-001"]`);
    expect(almacenLink).not.toBeNull();
    expect(almacenLink?.textContent).toContain('Depósito Central');
  });

  it('debe renderizar la capacidad cuando está definida', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('200');
  });

  // ── Rol consulta — oculta acciones ──────────────────────────────────────────

  it('debe ocultar el ActionMenu para el rol consulta', async () => {
    mockAuthService.getProfile.mockReturnValue('consulta');
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#ubicacion-actions')).toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol admin', async () => {
    mockAuthService.getProfile.mockReturnValue('admin');
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#ubicacion-actions')).not.toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol operador', async () => {
    mockAuthService.getProfile.mockReturnValue('operador');
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#ubicacion-actions')).not.toBeNull();
  });

  // ── Estado de error ──────────────────────────────────────────────────────────

  it('debe mostrar alerta de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar la ubicación');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────────

  it('debe navegar a #/ubicaciones al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/ubicaciones');
  });

  it('debe usar ubi-001 por defecto si no se pasan params', async () => {
    mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

    ubicacionesDetailPage.render(container);

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/ubicaciones/ubi-001', expect.any(Object));
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    ubicacionesDetailPage.render(container, { id: 'ubi-001' });
    expect(() => {
      ubicacionesDetailPage.destroy();
    }).not.toThrow();
  });

  // ── Flujo de eliminación ─────────────────────────────────────────────────────

  describe('eliminación confirmada', () => {
    /**
     * Renderiza el detalle y espera a que los datos estén disponibles en el DOM.
     */
    async function renderAndWait(): Promise<void> {
      ubicacionesDetailPage.render(container, { id: ubicacionFixture.id });
      await vi.waitFor(() => {
        expect(container.querySelector('h1')).not.toBeNull();
      });
    }

    /**
     * Dispara el evento ngr:action con id 'delete' sobre el ActionMenu de la ubicación.
     */
    function dispatchDeleteAction(): void {
      const actionMenuRoot = container.querySelector<HTMLElement>('#ubicacion-actions');
      const event = new CustomEvent('ngr:action', {
        detail: { id: 'delete' },
        bubbles: true,
      });
      actionMenuRoot?.dispatchEvent(event);
    }

    it('debe llamar DELETE y navegar a #/ubicaciones cuando el usuario confirma', async () => {
      mockApiFetch
        .mockResolvedValueOnce(ubicacionFixture)
        .mockResolvedValueOnce(undefined as unknown as Ubicacion);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait();
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/ubicaciones/ubi-001',
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      expect(window.location.hash).toBe('#/ubicaciones');
    });

    it('no debe llamar DELETE cuando el usuario cancela el diálogo', async () => {
      mockApiFetch.mockResolvedValueOnce(ubicacionFixture);
      mockConfirm.mockResolvedValue(false);

      await renderAndWait();
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      expect(mockApiFetch).toHaveBeenCalledTimes(1);
      expect(mockApiFetch).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('debe mostrar alerta de error inline y no navegar cuando DELETE falla', async () => {
      mockApiFetch
        .mockResolvedValueOnce(ubicacionFixture)
        .mockRejectedValueOnce(new Error('Network error'));
      mockConfirm.mockResolvedValue(true);

      await renderAndWait();
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(container.querySelector('#delete-error')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo eliminar la ubicación');
      expect(window.location.hash).not.toBe('#/ubicaciones');
    });

    it('debe navegar a la ruta de edición al hacer clic en Editar del ActionMenu', async () => {
      mockApiFetch.mockResolvedValueOnce(ubicacionFixture);

      await renderAndWait();

      const actionMenuRoot = container.querySelector<HTMLElement>('#ubicacion-actions');
      const editEvent = new CustomEvent('ngr:action', {
        detail: { id: 'edit' },
        bubbles: true,
      });
      actionMenuRoot?.dispatchEvent(editEvent);

      expect(window.location.hash).toBe('#/ubicaciones/ubi-001/editar');
    });
  });
});
