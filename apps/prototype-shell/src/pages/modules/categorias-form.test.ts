import type { Categoria } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo categorias-form.
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
import { apiFetch, ApiError } from '../_shared/apiFetch';

import { renderCategoriasForm } from './categorias-form';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Fixture de categoría base para tests */
const categoriaFixture: Categoria = {
  id: 'cat-001',
  codigo: 'PERI',
  nombre: 'Periféricos',
  descripcion: 'Teclados, ratones y otros periféricos',
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('renderCategoriasForm', () => {
  let container: HTMLElement;
  let signal: AbortSignal;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Por defecto rol admin — puede escribir
    mockAuthService.getProfile.mockReturnValue('admin');
    vi.clearAllMocks();
    // Restaurar mock de perfil después de clearAllMocks
    mockAuthService.getProfile.mockReturnValue('admin');
    // Crear un signal que no se aborta en los tests
    signal = new AbortController().signal;
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Modo crear — formulario vacío ─────────────────────────────────────────────

  describe('modo crear', () => {
    it('debe mostrar spinner durante la carga inicial', () => {
      // En modo crear no hay fetch, pero el spinner aparece brevemente
      renderCategoriasForm(container, { signal });

      // El spinner se muestra antes de que se resuelva la promesa (aunque sea undefined)
      // En modo crear resuelve sincrónicamente vía Promise.resolve, pero el spinner es visible al iniciar
      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe renderizar el formulario vacío una vez resuelto', async () => {
      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo crear
      expect(container.innerHTML).toContain('Nueva categoría');
      // El campo nombre debe estar vacío
      const nombreInput = container.querySelector<HTMLInputElement>('[name="nombre"]');
      expect(nombreInput?.value).toBe('');
    });

    it('debe llamar POST al enviar el formulario y navegar a la lista de categorías', async () => {
      const nuevaCategoria: Categoria = { ...categoriaFixture, id: 'cat-nuevo-123' };
      mockApiFetch.mockResolvedValueOnce(nuevaCategoria);

      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Rellenar el campo requerido
      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Nueva Categoría Test';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/categorias',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      // Debe navegar a la lista de categorías (no al detalle)
      expect(window.location.hash).toBe('#/categorias');
    });

    it('debe deshabilitar el botón de envío durante la petición en vuelo', async () => {
      let resolvePost!: (value: Categoria) => void;
      const postPromise = new Promise<Categoria>((resolve) => {
        resolvePost = resolve;
      });
      mockApiFetch.mockReturnValueOnce(postPromise);

      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;

      nombreInput.value = 'Categoría X';
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // El botón debe estar deshabilitado mientras el POST está pendiente
      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(true);
      });

      // Resolver para limpiar
      resolvePost(categoriaFixture);
    });
  });

  // ── Modo editar — precarga de datos ──────────────────────────────────────────

  describe('modo editar', () => {
    it('debe mostrar spinner durante la carga', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderCategoriasForm(container, { id: 'cat-001', signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe precargar campos con los datos de la categoría existente', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriaFixture);

      renderCategoriasForm(container, { id: 'cat-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo editar
      expect(container.innerHTML).toContain('Editar categoría');

      // El campo nombre debe estar precargado
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      expect(nombreInput.value).toBe('Periféricos');

      // El campo descripción debe estar precargado
      const descripcionInput = q(container, '[name="descripcion"]') as HTMLTextAreaElement;
      expect(descripcionInput.value).toBe('Teclados, ratones y otros periféricos');
    });

    it('debe llamar PUT al enviar el formulario y navegar al detalle', async () => {
      const categoriaActualizada: Categoria = {
        ...categoriaFixture,
        nombre: 'Periféricos Editado',
      };
      mockApiFetch
        .mockResolvedValueOnce(categoriaFixture)
        .mockResolvedValueOnce(categoriaActualizada);

      renderCategoriasForm(container, { id: 'cat-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/categorias/cat-001',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });

      // Navegar al detalle de la categoría editada
      expect(window.location.hash).toBe('#/categorias/cat-001');
    });

    it('debe solicitar datos de la categoría con el id correcto', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriaFixture);

      renderCategoriasForm(container, { id: 'cat-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/categorias/cat-001', expect.any(Object));
    });
  });

  // ── Manejo de errores 422 — errores de validación por campo ──────────────────

  describe('error 422 — validación por campo', () => {
    it('debe mostrar errores de campo debajo de cada input afectado', async () => {
      const validationErrorBody = {
        status: 422,
        type: '/errors/validation',
        title: 'Error de validación',
        fields: {
          nombre: 'El nombre es requerido',
        },
      };
      const apiError = new ApiError(422, validationErrorBody);

      mockApiFetch.mockRejectedValueOnce(apiError);

      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = '';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(container.querySelector('[name="nombre"]')?.classList.contains('is-invalid')).toBe(
          true
        );
      });
    });

    it('debe habilitar el botón de envío nuevamente tras un error 422', async () => {
      const apiError = new ApiError(422, {
        status: 422,
        type: '/errors/validation',
        title: 'Error de validación',
        fields: { nombre: 'Requerido' },
      });

      mockApiFetch.mockRejectedValueOnce(apiError);

      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Test';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(false);
      });
    });
  });

  // ── Error genérico del servidor ──────────────────────────────────────────────

  describe('error 500 — error genérico del servidor', () => {
    it('debe mostrar alerta global con mensaje genérico de error', async () => {
      const apiError = new ApiError(500, {
        type: '/errors/server-error',
        title: 'Error interno del servidor',
        status: 500,
      });

      mockApiFetch.mockRejectedValueOnce(apiError);

      renderCategoriasForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Test';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-global')).not.toBeNull();
      });

      expect(container.querySelector('.alert-global')?.textContent).toContain(
        'Error al guardar la categoría'
      );
      expect(container.innerHTML).toContain('alert-danger');
    });
  });

  // ── Rol consulta — redirección inmediata ─────────────────────────────────────

  describe('rol consulta', () => {
    it('debe redirigir a #/categorias sin renderizar el formulario', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderCategoriasForm(container, { signal });

      // No debe haber llamado apiFetch — salió antes
      expect(mockApiFetch).not.toHaveBeenCalled();
      // No hay formulario ni spinner en el DOM
      expect(container.querySelector('form')).toBeNull();
      // Debe haber navegado a la lista
      expect(window.location.hash).toBe('#/categorias');
    });

    it('no debe mostrar formulario para rol consulta en modo editar', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderCategoriasForm(container, { id: 'cat-001', signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/categorias');
    });
  });

  // ── Estado de error al cargar datos ─────────────────────────────────────────

  describe('error al cargar datos iniciales', () => {
    it('debe mostrar alerta de error si falla la carga de la categoría en modo editar', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      renderCategoriasForm(container, { id: 'cat-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-danger')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo cargar el formulario');
    });
  });
});
