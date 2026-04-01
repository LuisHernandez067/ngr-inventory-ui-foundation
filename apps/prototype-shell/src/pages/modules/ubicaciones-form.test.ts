import type { Almacen, PaginatedResponse, Ubicacion } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo ubicaciones-form.
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

import { renderUbicacionesForm } from './ubicaciones-form';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

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

/** Fixture de ubicación base para tests */
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

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('renderUbicacionesForm', () => {
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
    // Resetear hash
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Modo crear — formulario vacío ─────────────────────────────────────────────

  describe('modo crear', () => {
    it('debe mostrar spinner durante la carga inicial', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderUbicacionesForm(container, { signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe renderizar el formulario vacío una vez resuelto con almacenes', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenesResponse);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('Nueva ubicación');
      const nombreInput = container.querySelector<HTMLInputElement>('[name="nombre"]');
      expect(nombreInput?.value).toBe('');
    });

    it('debe cargar el select de almacenes con las opciones del API', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenesResponse);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const almacenSelect = q(container, '[name="almacenId"]') as HTMLSelectElement;
      expect(almacenSelect.innerHTML).toContain('Depósito Central');
      expect(almacenSelect.innerHTML).toContain('Almacén Norte');
    });

    it('debe tener el checkbox activo marcado por defecto en modo crear', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenesResponse);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const activoCheckbox = container.querySelector<HTMLInputElement>('[name="activo"]');
      expect(activoCheckbox?.checked).toBe(true);
    });

    it('debe llamar POST al enviar el formulario y navegar a la lista de ubicaciones', async () => {
      const nuevaUbicacion: Ubicacion = { ...ubicacionFixture, id: 'ubi-nuevo-123' };
      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(nuevaUbicacion);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Rack Test';

      const almacenSelect = q(container, '[name="almacenId"]') as HTMLSelectElement;
      almacenSelect.value = 'alm-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/ubicaciones',
          expect.objectContaining({ method: 'POST' })
        );
      });

      expect(window.location.hash).toBe('#/ubicaciones');
    });

    it('debe deshabilitar el botón de envío durante la petición en vuelo', async () => {
      let resolvePost!: (value: Ubicacion) => void;
      const postPromise = new Promise<Ubicacion>((resolve) => {
        resolvePost = resolve;
      });

      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockReturnValueOnce(postPromise);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Rack X';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(true);
      });

      // Resolver para limpiar
      resolvePost(ubicacionFixture);
    });
  });

  // ── Modo editar — precarga de datos ──────────────────────────────────────────

  describe('modo editar', () => {
    it('debe mostrar spinner durante la carga', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe precargar campos con los datos de la ubicación existente', async () => {
      // Promise.all([almacenes, ubicacion])
      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(ubicacionFixture);

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('Editar ubicación');

      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      expect(nombreInput.value).toBe('Rack 1 Estante 1');

      const almacenSelect = q(container, '[name="almacenId"]') as HTMLSelectElement;
      expect(almacenSelect.value).toBe('alm-001');

      const activoCheckbox = q(container, '[name="activo"]') as HTMLInputElement;
      expect(activoCheckbox.checked).toBe(true);
    });

    it('debe llamar PUT al enviar el formulario y navegar al detalle', async () => {
      const ubicacionActualizada: Ubicacion = {
        ...ubicacionFixture,
        nombre: 'Rack 1 Estante 1 Editado',
      };
      mockApiFetch
        .mockResolvedValueOnce(almacenesResponse)
        .mockResolvedValueOnce(ubicacionFixture)
        .mockResolvedValueOnce(ubicacionActualizada);

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/ubicaciones/ubi-001',
          expect.objectContaining({ method: 'PUT' })
        );
      });

      expect(window.location.hash).toBe('#/ubicaciones/ubi-001');
    });

    it('debe realizar fetch en paralelo de almacenes y ubicación', async () => {
      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockResolvedValueOnce(ubicacionFixture);

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Verificar que se hicieron ambos fetches
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/almacenes'),
        expect.any(Object)
      );
      expect(mockApiFetch).toHaveBeenCalledWith('/api/ubicaciones/ubi-001', expect.any(Object));
    });

    it('debe preseleccionar almacenId desde el query string del hash', async () => {
      window.location.hash = '#/ubicaciones/nuevo?almacenId=alm-002';

      mockApiFetch.mockResolvedValueOnce(almacenesResponse);

      renderUbicacionesForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const almacenSelect = q(container, '[name="almacenId"]') as HTMLSelectElement;
      expect(almacenSelect.value).toBe('alm-002');
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

      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockRejectedValueOnce(apiError);

      renderUbicacionesForm(container, { signal });

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

      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockRejectedValueOnce(apiError);

      renderUbicacionesForm(container, { signal });

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

      mockApiFetch.mockResolvedValueOnce(almacenesResponse).mockRejectedValueOnce(apiError);

      renderUbicacionesForm(container, { signal });

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
        'Error al guardar la ubicación'
      );
      expect(container.innerHTML).toContain('alert-danger');
    });
  });

  // ── Rol consulta — redirección inmediata ─────────────────────────────────────

  describe('rol consulta', () => {
    it('debe redirigir a #/ubicaciones sin renderizar el formulario', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderUbicacionesForm(container, { signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/ubicaciones');
    });

    it('no debe mostrar formulario para rol consulta en modo editar', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/ubicaciones');
    });
  });

  // ── Estado de error al cargar datos ─────────────────────────────────────────

  describe('error al cargar datos iniciales', () => {
    it('debe mostrar alerta de error si falla la carga de datos en paralelo', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      renderUbicacionesForm(container, { id: 'ubi-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-danger')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo cargar el formulario');
    });
  });
});
