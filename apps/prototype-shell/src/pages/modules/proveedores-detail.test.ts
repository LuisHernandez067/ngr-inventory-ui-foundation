import type { Proveedor } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo proveedores-detail — flujo de eliminación confirmada.
// Se mockean apiFetch, authService y ConfirmDialog para aislar el comportamiento.

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

import { proveedoresDetailPage } from './proveedores-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Fixture de proveedor base para tests */
const proveedorFixture: Proveedor = {
  id: 'prov-001',
  codigo: 'PROV-001',
  razonSocial: 'TechSupply S.A.',
  ruc: '20123456789',
  direccion: 'Av. Principal 123',
  email: 'contacto@techsupply.com',
  telefono: '+54 11 1234-5678',
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

describe('proveedoresDetailPage — flujo de eliminación', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Por defecto rol admin — puede eliminar
    mockAuthService.getProfile.mockReturnValue('admin');
    vi.clearAllMocks();
    mockAuthService.getProfile.mockReturnValue('admin');
    // Resetear la URL entre tests
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    proveedoresDetailPage.destroy();
    vi.restoreAllMocks();
  });

  /**
   * Renderiza el detalle y espera a que los datos estén disponibles en el DOM.
   */
  async function renderAndWait(): Promise<void> {
    proveedoresDetailPage.render(container, { id: 'prov-001' });
    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });
  }

  /**
   * Dispara el evento ngr:action con id 'delete' sobre el ActionMenu del proveedor.
   */
  function dispatchDeleteAction(): void {
    const actionMenuRoot = container.querySelector<HTMLElement>('#proveedor-actions');
    const event = new CustomEvent('ngr:action', {
      detail: { id: 'delete' },
      bubbles: true,
    });
    actionMenuRoot?.dispatchEvent(event);
  }

  // ── Confirmación exitosa ──────────────────────────────────────────────────────

  it('debe llamar DELETE y navegar a #/proveedores cuando el usuario confirma', async () => {
    // Primera llamada: GET detalle; segunda: DELETE (resuelve vacío → 204 simulado)
    mockApiFetch
      .mockResolvedValueOnce(proveedorFixture)
      .mockResolvedValueOnce(undefined as unknown as Proveedor);
    mockConfirm.mockResolvedValue(true);

    await renderAndWait();
    dispatchDeleteAction();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/proveedores/prov-001',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    expect(window.location.hash).toBe('#/proveedores');
  });

  // ── Cancelación — no debe llamar a la API ────────────────────────────────────

  it('no debe llamar DELETE cuando el usuario cancela el diálogo', async () => {
    mockApiFetch.mockResolvedValueOnce(proveedorFixture);
    mockConfirm.mockResolvedValue(false);

    await renderAndWait();
    dispatchDeleteAction();

    // Dar tiempo a que se procese la promesa
    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    // Solo debe haberse llamado una vez (el GET inicial)
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
    expect(mockApiFetch).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  // ── Error en la API — muestra alerta inline ──────────────────────────────────

  it('debe mostrar alerta de error inline y no navegar cuando DELETE falla', async () => {
    mockApiFetch
      .mockResolvedValueOnce(proveedorFixture)
      .mockRejectedValueOnce(new Error('Network error'));
    mockConfirm.mockResolvedValue(true);

    await renderAndWait();
    dispatchDeleteAction();

    await vi.waitFor(() => {
      expect(container.querySelector('#delete-error')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo eliminar el proveedor');
    // No debe haber navegado a la lista
    expect(window.location.hash).not.toBe('#/proveedores');
  });
});
