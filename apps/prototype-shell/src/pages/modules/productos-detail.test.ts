import type { Producto } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo productos-detail — flujo de eliminación confirmada.
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

import { productosDetailPage } from './productos-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Fixture de producto base para tests */
const productoFixture: Producto = {
  id: 'prod-001',
  codigo: 'TEC-MEC-001',
  nombre: 'Teclado Mecánico TKL',
  descripcion: 'Teclado mecánico tenkeyless',
  categoriaId: 'cat-001',
  categoriaNombre: 'Periféricos',
  unidadMedida: 'unidad',
  precioUnitario: 28500,
  stockMinimo: 5,
  stockMaximo: 50,
  status: 'active',
  createdAt: '2025-01-10T08:00:00.000Z',
  updatedAt: '2025-03-15T10:30:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

describe('productosDetailPage — flujo de eliminación', () => {
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
    productosDetailPage.destroy();
    vi.restoreAllMocks();
  });

  /**
   * Renderiza el detalle y espera a que los datos estén disponibles en el DOM.
   */
  async function renderAndWait(): Promise<void> {
    productosDetailPage.render(container, { id: 'prod-001' });
    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });
  }

  /**
   * Dispara el evento ngr:action con id 'delete' sobre el ActionMenu del producto.
   */
  function dispatchDeleteAction(): void {
    const actionMenuRoot = container.querySelector<HTMLElement>('#producto-actions');
    const event = new CustomEvent('ngr:action', {
      detail: { id: 'delete' },
      bubbles: true,
    });
    actionMenuRoot?.dispatchEvent(event);
  }

  // ── Confirmación exitosa ──────────────────────────────────────────────────────

  it('debe llamar DELETE y navegar a #/productos cuando el usuario confirma', async () => {
    // Primera llamada: GET detalle; segunda: DELETE (resuelve vacío → 204 simulado)
    mockApiFetch
      .mockResolvedValueOnce(productoFixture)
      .mockResolvedValueOnce(undefined as unknown as Producto);
    mockConfirm.mockResolvedValue(true);

    await renderAndWait();
    dispatchDeleteAction();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/productos/prod-001',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    expect(window.location.hash).toBe('#/productos');
  });

  // ── Cancelación — no debe llamar a la API ────────────────────────────────────

  it('no debe llamar DELETE cuando el usuario cancela el diálogo', async () => {
    mockApiFetch.mockResolvedValueOnce(productoFixture);
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
      .mockResolvedValueOnce(productoFixture)
      .mockRejectedValueOnce(new Error('Network error'));
    mockConfirm.mockResolvedValue(true);

    await renderAndWait();
    dispatchDeleteAction();

    await vi.waitFor(() => {
      expect(container.querySelector('#delete-error')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo eliminar el producto');
    // No debe haber navegado a la lista
    expect(window.location.hash).not.toBe('#/productos');
  });
});
