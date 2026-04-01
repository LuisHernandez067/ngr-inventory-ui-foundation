import type { Categoria } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo categorias-detail.
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

import { categoriasDetailPage } from './categorias-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Fixture de categoría base sin productoCount */
const categoriaBase: Categoria = {
  id: 'cat-001',
  codigo: 'CAT-001',
  nombre: 'Electrónica',
  descripcion: 'Dispositivos electrónicos y accesorios',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  createdBy: 'admin',
  updatedAt: '2024-01-01T00:00:00Z',
  updatedBy: 'admin',
};

/** Fixture de categoría con productoCount > 0 */
const categoriaConProductos: Categoria = {
  ...categoriaBase,
  productoCount: 5,
};

/** Fixture de categoría con productoCount === 0 */
const categoriaSinProductos: Categoria = {
  ...categoriaBase,
  productoCount: 0,
};

describe('categoriasDetailPage', () => {
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
    categoriasDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    // apiFetch nunca resuelve en este test
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    categoriasDetailPage.render(container, { id: 'cat-001' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando categoría');
  });

  // ── Happy path ───────────────────────────────────────────────────────────────

  it('debe renderizar nombre, código y descripción de la categoría', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Electrónica');
    expect(container.innerHTML).toContain('CAT-001');
    expect(container.innerHTML).toContain('Dispositivos electrónicos y accesorios');
  });

  it('debe renderizar el badge de estado activo', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    // Badge de estado activo — variante success
    expect(container.innerHTML).toContain('Activo');
  });

  it('debe renderizar el badge de productoCount cuando está presente', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaConProductos);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('5 productos asociados');
  });

  it('debe mostrar la alerta de impacto cuando productoCount > 0', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaConProductos);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#impact-warning')).not.toBeNull();
    });

    expect(container.querySelector('#impact-warning')?.textContent).toContain(
      'Esta categoría tiene 5 productos asociados'
    );
    expect(container.innerHTML).toContain('alert-warning');
  });

  it('debe ocultar la alerta de impacto cuando productoCount === 0', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaSinProductos);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#impact-warning')).toBeNull();
  });

  it('no debe mostrar alerta de impacto cuando productoCount no está definido', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#impact-warning')).toBeNull();
  });

  // ── Rol consulta — oculta acciones ──────────────────────────────────────────

  it('debe ocultar el ActionMenu para el rol consulta', async () => {
    mockAuthService.getProfile.mockReturnValue('consulta');
    mockApiFetch.mockResolvedValueOnce(categoriaConProductos);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    // El ActionMenu no debe estar en el DOM
    expect(container.querySelector('#categoria-actions')).toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol admin', async () => {
    mockAuthService.getProfile.mockReturnValue('admin');
    mockApiFetch.mockResolvedValueOnce(categoriaConProductos);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#categoria-actions')).not.toBeNull();
  });

  it('debe mostrar el ActionMenu para el rol operador', async () => {
    mockAuthService.getProfile.mockReturnValue('operador');
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('h1')).not.toBeNull();
    });

    expect(container.querySelector('#categoria-actions')).not.toBeNull();
  });

  // ── Estado de error ──────────────────────────────────────────────────────────

  it('debe mostrar alerta de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar la categoría');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    // No debe haber alerta de error — AbortError se suprime silenciosamente
    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────────

  it('debe navegar a #/categorias al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container, { id: 'cat-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
    btnBack?.click();

    expect(window.location.hash).toBe('#/categorias');
  });

  // ── Parámetro de ruta por defecto ────────────────────────────────────────────

  it('debe usar cat-001 por defecto si no se pasan params', async () => {
    mockApiFetch.mockResolvedValueOnce(categoriaBase);

    categoriasDetailPage.render(container);

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    // Debe haber llamado con el id por defecto
    expect(mockApiFetch).toHaveBeenCalledWith('/api/categorias/cat-001', expect.any(Object));
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    categoriasDetailPage.render(container, { id: 'cat-001' });
    expect(() => {
      categoriasDetailPage.destroy();
    }).not.toThrow();
  });

  // ── Flujo de eliminación ─────────────────────────────────────────────────────

  describe('eliminación confirmada', () => {
    /**
     * Renderiza el detalle y espera a que los datos estén disponibles en el DOM.
     */
    async function renderAndWait(categoria: Categoria): Promise<void> {
      categoriasDetailPage.render(container, { id: categoria.id });
      await vi.waitFor(() => {
        expect(container.querySelector('h1')).not.toBeNull();
      });
    }

    /**
     * Dispara el evento ngr:action con id 'delete' sobre el ActionMenu de la categoría.
     */
    function dispatchDeleteAction(): void {
      const actionMenuRoot = container.querySelector<HTMLElement>('#categoria-actions');
      const event = new CustomEvent('ngr:action', {
        detail: { id: 'delete' },
        bubbles: true,
      });
      actionMenuRoot?.dispatchEvent(event);
    }

    it('debe usar el mensaje de impacto cuando productoCount > 0', async () => {
      // Primera llamada: GET detalle; segunda: DELETE
      mockApiFetch
        .mockResolvedValueOnce(categoriaConProductos)
        .mockResolvedValueOnce(undefined as unknown as Categoria);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(categoriaConProductos);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      // Verificar que el mensaje de confirmación incluye la advertencia de impacto
      const msgMatcher = expect.stringContaining('5 producto(s) asociado(s)') as unknown as string;
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Eliminar categoría',
          message: msgMatcher,
        })
      );
    });

    it('debe usar el mensaje genérico cuando productoCount === 0', async () => {
      mockApiFetch
        .mockResolvedValueOnce(categoriaSinProductos)
        .mockResolvedValueOnce(undefined as unknown as Categoria);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(categoriaSinProductos);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledOnce();
      });

      // El mensaje genérico no debe mencionar productos
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Eliminar categoría',
          message: '¿Estás seguro? Esta acción no se puede deshacer.',
        })
      );
    });

    it('debe llamar DELETE y navegar a #/categorias cuando el usuario confirma', async () => {
      mockApiFetch
        .mockResolvedValueOnce(categoriaBase)
        .mockResolvedValueOnce(undefined as unknown as Categoria);
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(categoriaBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/categorias/cat-001',
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      expect(window.location.hash).toBe('#/categorias');
    });

    it('no debe llamar DELETE cuando el usuario cancela el diálogo', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriaBase);
      mockConfirm.mockResolvedValue(false);

      await renderAndWait(categoriaBase);
      dispatchDeleteAction();

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

    it('debe mostrar alerta de error inline y no navegar cuando DELETE falla', async () => {
      mockApiFetch
        .mockResolvedValueOnce(categoriaBase)
        .mockRejectedValueOnce(new Error('Network error'));
      mockConfirm.mockResolvedValue(true);

      await renderAndWait(categoriaBase);
      dispatchDeleteAction();

      await vi.waitFor(() => {
        expect(container.querySelector('#delete-error')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo eliminar la categoría');
      // No debe haber navegado a la lista
      expect(window.location.hash).not.toBe('#/categorias');
    });
  });
});
