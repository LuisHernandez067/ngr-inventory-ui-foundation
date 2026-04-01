import type { Almacen } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo almacenes-form.
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

import { renderAlmacenesForm } from './almacenes-form';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Fixture de almacén base para tests */
const almacenFixture: Almacen = {
  id: 'alm-001',
  codigo: 'DEP-CEN',
  nombre: 'Depósito Central',
  descripcion: 'Almacén principal con mayor capacidad',
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

describe('renderAlmacenesForm', () => {
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
      renderAlmacenesForm(container, { signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe renderizar el formulario vacío una vez resuelto', async () => {
      renderAlmacenesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('Nuevo almacén');
      const nombreInput = container.querySelector<HTMLInputElement>('[name="nombre"]');
      expect(nombreInput?.value).toBe('');
    });

    it('debe tener el checkbox activo marcado por defecto en modo crear', async () => {
      renderAlmacenesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const activoCheckbox = container.querySelector<HTMLInputElement>('[name="activo"]');
      expect(activoCheckbox?.checked).toBe(true);
    });

    it('debe llamar POST al enviar el formulario y navegar a la lista de almacenes', async () => {
      const nuevoAlmacen: Almacen = { ...almacenFixture, id: 'alm-nuevo-123' };
      mockApiFetch.mockResolvedValueOnce(nuevoAlmacen);

      renderAlmacenesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Nuevo Almacén Test';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/almacenes',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      expect(window.location.hash).toBe('#/almacenes');
    });

    it('debe deshabilitar el botón de envío durante la petición en vuelo', async () => {
      let resolvePost!: (value: Almacen) => void;
      const postPromise = new Promise<Almacen>((resolve) => {
        resolvePost = resolve;
      });
      mockApiFetch.mockReturnValueOnce(postPromise);

      renderAlmacenesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;

      nombreInput.value = 'Almacén X';
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(true);
      });

      // Resolver para limpiar
      resolvePost(almacenFixture);
    });
  });

  // ── Modo editar — precarga de datos ──────────────────────────────────────────

  describe('modo editar', () => {
    it('debe mostrar spinner durante la carga', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe precargar campos con los datos del almacén existente', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenFixture);

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('Editar almacén');

      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      expect(nombreInput.value).toBe('Depósito Central');

      const descripcionInput = q(container, '[name="descripcion"]') as HTMLTextAreaElement;
      expect(descripcionInput.value).toBe('Almacén principal con mayor capacidad');

      const activoCheckbox = q(container, '[name="activo"]') as HTMLInputElement;
      expect(activoCheckbox.checked).toBe(true);
    });

    it('debe llamar PUT al enviar el formulario y navegar al detalle', async () => {
      const almacenActualizado: Almacen = {
        ...almacenFixture,
        nombre: 'Depósito Central Editado',
      };
      mockApiFetch.mockResolvedValueOnce(almacenFixture).mockResolvedValueOnce(almacenActualizado);

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/almacenes/alm-001',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });

      expect(window.location.hash).toBe('#/almacenes/alm-001');
    });

    it('debe solicitar datos del almacén con el id correcto', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenFixture);

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/almacenes/alm-001', expect.any(Object));
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

      renderAlmacenesForm(container, { signal });

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

      renderAlmacenesForm(container, { signal });

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

      renderAlmacenesForm(container, { signal });

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
        'Error al guardar el almacén'
      );
      expect(container.innerHTML).toContain('alert-danger');
    });
  });

  // ── Rol consulta — redirección inmediata ─────────────────────────────────────

  describe('rol consulta', () => {
    it('debe redirigir a #/almacenes sin renderizar el formulario', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderAlmacenesForm(container, { signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/almacenes');
    });

    it('no debe mostrar formulario para rol consulta en modo editar', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/almacenes');
    });
  });

  // ── Estado de error al cargar datos ─────────────────────────────────────────

  describe('error al cargar datos iniciales', () => {
    it('debe mostrar alerta de error si falla la carga del almacén en modo editar', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      renderAlmacenesForm(container, { id: 'alm-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-danger')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo cargar el formulario');
    });
  });
});
