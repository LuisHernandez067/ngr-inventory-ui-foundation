import type { Proveedor } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo proveedores-form.
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

import { renderProveedoresForm } from './proveedores-form';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Fixture de proveedor base para tests */
const proveedorFixture: Proveedor = {
  id: 'prov-001',
  codigo: 'DISTRIB',
  razonSocial: 'Distribuciones García S.A.',
  ruc: '20123456789',
  email: 'contacto@garcia.com',
  telefono: '+54 11 1234-5678',
  direccion: 'Av. Corrientes 1234, Buenos Aires',
  status: 'active',
  createdAt: '2025-01-10T08:00:00.000Z',
  updatedAt: '2025-03-15T10:30:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('renderProveedoresForm', () => {
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
      renderProveedoresForm(container, { signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe renderizar el formulario vacío una vez resuelto', async () => {
      renderProveedoresForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo crear
      expect(container.innerHTML).toContain('Nuevo proveedor');
      // El campo nombre debe estar vacío
      const nombreInput = container.querySelector<HTMLInputElement>('[name="nombre"]');
      expect(nombreInput?.value).toBe('');
    });

    it('debe renderizar todos los campos del formulario', async () => {
      renderProveedoresForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Verificar presencia de todos los campos
      expect(container.querySelector('[name="nombre"]')).not.toBeNull();
      expect(container.querySelector('[name="contacto"]')).not.toBeNull();
      expect(container.querySelector('[name="email"]')).not.toBeNull();
      expect(container.querySelector('[name="telefono"]')).not.toBeNull();
      expect(container.querySelector('[name="status"]')).not.toBeNull();
    });

    it('debe llamar POST al enviar el formulario y navegar a la lista de proveedores', async () => {
      const nuevoProveedor: Proveedor = { ...proveedorFixture, id: 'prov-nuevo-123' };
      mockApiFetch.mockResolvedValueOnce(nuevoProveedor);

      renderProveedoresForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Rellenar campos requeridos
      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const emailInput = q(container, '[name="email"]') as HTMLInputElement;

      nombreInput.value = 'Proveedor Test S.A.';
      emailInput.value = 'test@proveedor.com';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/proveedores',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      // Debe navegar a la lista de proveedores (no al detalle)
      expect(window.location.hash).toBe('#/proveedores');
    });

    it('debe deshabilitar el botón de envío durante la petición en vuelo', async () => {
      let resolvePost!: (value: Proveedor) => void;
      const postPromise = new Promise<Proveedor>((resolve) => {
        resolvePost = resolve;
      });
      mockApiFetch.mockReturnValueOnce(postPromise);

      renderProveedoresForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const emailInput = q(container, '[name="email"]') as HTMLInputElement;

      nombreInput.value = 'Proveedor X';
      emailInput.value = 'x@x.com';
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // El botón debe estar deshabilitado mientras el POST está pendiente
      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(true);
      });

      // Resolver para limpiar
      resolvePost(proveedorFixture);
    });
  });

  // ── Modo editar — precarga de datos ──────────────────────────────────────────

  describe('modo editar', () => {
    it('debe mostrar spinner durante la carga', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderProveedoresForm(container, { id: 'prov-001', signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe precargar campos con los datos del proveedor existente', async () => {
      mockApiFetch.mockResolvedValueOnce(proveedorFixture);

      renderProveedoresForm(container, { id: 'prov-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo editar
      expect(container.innerHTML).toContain('Editar proveedor');

      // El campo nombre debe estar precargado con razonSocial
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      expect(nombreInput.value).toBe('Distribuciones García S.A.');

      // El campo email debe estar precargado
      const emailInput = q(container, '[name="email"]') as HTMLInputElement;
      expect(emailInput.value).toBe('contacto@garcia.com');
    });

    it('debe llamar PUT al enviar el formulario y navegar al detalle', async () => {
      const proveedorActualizado: Proveedor = {
        ...proveedorFixture,
        razonSocial: 'Distribuciones García Editado',
      };
      mockApiFetch
        .mockResolvedValueOnce(proveedorFixture)
        .mockResolvedValueOnce(proveedorActualizado);

      renderProveedoresForm(container, { id: 'prov-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/proveedores/prov-001',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });

      // Navegar al detalle del proveedor editado
      expect(window.location.hash).toBe('#/proveedores/prov-001');
    });

    it('debe solicitar datos del proveedor con el id correcto', async () => {
      mockApiFetch.mockResolvedValueOnce(proveedorFixture);

      renderProveedoresForm(container, { id: 'prov-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(mockApiFetch).toHaveBeenCalledWith('/api/proveedores/prov-001', expect.any(Object));
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
          email: 'El correo electrónico es inválido',
        },
      };
      const apiError = new ApiError(422, validationErrorBody);

      mockApiFetch.mockRejectedValueOnce(apiError);

      renderProveedoresForm(container, { signal });

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

      expect(container.querySelector('[name="email"]')?.classList.contains('is-invalid')).toBe(
        true
      );
    });

    it('debe habilitar el botón de envío nuevamente tras un error 422', async () => {
      const apiError = new ApiError(422, {
        status: 422,
        type: '/errors/validation',
        title: 'Error de validación',
        fields: { nombre: 'Requerido' },
      });

      mockApiFetch.mockRejectedValueOnce(apiError);

      renderProveedoresForm(container, { signal });

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

      renderProveedoresForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Proveedor Test';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-global')).not.toBeNull();
      });

      expect(container.querySelector('.alert-global')?.textContent).toContain(
        'Error al guardar el proveedor'
      );
      expect(container.innerHTML).toContain('alert-danger');
    });
  });

  // ── Rol consulta — redirección inmediata ─────────────────────────────────────

  describe('rol consulta', () => {
    it('debe redirigir a #/proveedores sin renderizar el formulario', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderProveedoresForm(container, { signal });

      // No debe haber llamado apiFetch — salió antes
      expect(mockApiFetch).not.toHaveBeenCalled();
      // No hay formulario ni spinner en el DOM
      expect(container.querySelector('form')).toBeNull();
      // Debe haber navegado a la lista
      expect(window.location.hash).toBe('#/proveedores');
    });

    it('no debe mostrar formulario para rol consulta en modo editar', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderProveedoresForm(container, { id: 'prov-001', signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/proveedores');
    });
  });

  // ── Estado de error al cargar datos ─────────────────────────────────────────

  describe('error al cargar datos iniciales', () => {
    it('debe mostrar alerta de error si falla la carga del proveedor en modo editar', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      renderProveedoresForm(container, { id: 'prov-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-danger')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo cargar el formulario');
    });
  });
});
