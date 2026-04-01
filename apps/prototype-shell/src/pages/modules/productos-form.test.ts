import type { Categoria, Producto } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo productos-form.
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

import { renderProductosForm } from './productos-form';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

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

/** Fixture de categorías para el select */
const categoriasFixture: Categoria[] = [
  {
    id: 'cat-001',
    codigo: 'PERI',
    nombre: 'Periféricos',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'cat-002',
    codigo: 'MONI',
    nombre: 'Monitores',
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Respuesta paginada de categorías */
const categoriasResponse = {
  data: categoriasFixture,
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

describe('renderProductosForm', () => {
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
      // Categorías nunca resuelven en este test
      mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

      renderProductosForm(container, { signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe renderizar el formulario vacío una vez que cargan las categorías', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriasResponse);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo crear
      expect(container.innerHTML).toContain('Nuevo producto');
      // Todos los campos deben estar vacíos
      const nombreInput = container.querySelector<HTMLInputElement>('[name="nombre"]');
      expect(nombreInput?.value).toBe('');
    });

    it('debe mostrar las opciones de categoría en el select', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriasResponse);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('select[name="categoriaId"]')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('Periféricos');
      expect(container.innerHTML).toContain('Monitores');
    });

    it('debe llamar POST al enviar el formulario y navegar a la lista de productos', async () => {
      const nuevoProd: Producto = { ...productoFixture, id: 'prod-nuevo-123' };
      // Primera llamada: categorías; segunda: POST respuesta
      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockResolvedValueOnce(nuevoProd);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Rellenar campos requeridos
      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;

      nombreInput.value = 'Nuevo Producto Test';
      skuInput.value = 'NUEVO-001';
      precioInput.value = '15000';
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        // Debe haber llamado apiFetch con POST
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/productos',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      // Debe navegar a la lista de productos (no al detalle)
      expect(window.location.hash).toBe('#/productos');
    });

    it('debe deshabilitar el botón de envío durante la petición en vuelo', async () => {
      // Categorías resuelven rápido, POST nunca resuelve
      let resolvePost!: (value: Producto) => void;
      const postPromise = new Promise<Producto>((resolve) => {
        resolvePost = resolve;
      });
      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockReturnValueOnce(postPromise);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;

      nombreInput.value = 'Producto X';
      skuInput.value = 'SKU-X';
      precioInput.value = '1000';
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      // El botón debe estar deshabilitado mientras el POST está pendiente
      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(true);
      });

      // Resolver para limpiar
      resolvePost(productoFixture);
    });
  });

  // ── Modo editar — precarga de datos ──────────────────────────────────────────

  describe('modo editar', () => {
    it('debe mostrar spinner durante la carga', () => {
      mockApiFetch.mockReturnValue(new Promise(vi.fn()));

      renderProductosForm(container, { id: 'prod-001', signal });

      expect(container.innerHTML).toContain('spinner-border');
    });

    it('debe precarga de campos con los datos del producto existente', async () => {
      // Primera llamada: categorías; segunda: GET producto
      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockResolvedValueOnce(productoFixture);

      renderProductosForm(container, { id: 'prod-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // El título debe indicar modo editar
      expect(container.innerHTML).toContain('Editar producto');

      // Los campos deben estar precargados con los datos del fixture
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;

      expect(nombreInput.value).toBe('Teclado Mecánico TKL');
      expect(skuInput.value).toBe('TEC-MEC-001');
      expect(precioInput.value).toBe('28500');
    });

    it('debe llamar PUT al enviar el formulario y navegar al detalle', async () => {
      const productoActualizado: Producto = { ...productoFixture, nombre: 'Teclado Editado' };
      mockApiFetch
        .mockResolvedValueOnce(categoriasResponse)
        .mockResolvedValueOnce(productoFixture)
        .mockResolvedValueOnce(productoActualizado);

      renderProductosForm(container, { id: 'prod-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(mockApiFetch).toHaveBeenCalledWith(
          '/api/productos/prod-001',
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });

      // Navegar al detalle del producto editado
      expect(window.location.hash).toBe('#/productos/prod-001');
    });

    it('debe solicitar datos del producto con el id correcto', async () => {
      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockResolvedValueOnce(productoFixture);

      renderProductosForm(container, { id: 'prod-001', signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      // Verificar que se llamó con la URL correcta del producto
      expect(mockApiFetch).toHaveBeenCalledWith('/api/productos/prod-001', expect.any(Object));
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
          sku: 'El SKU ya existe',
        },
      };
      const apiError = new ApiError(422, validationErrorBody);

      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockRejectedValueOnce(apiError);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;

      nombreInput.value = '';
      skuInput.value = 'TEC-MEC-001';
      precioInput.value = '1000';
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        // El campo nombre debe tener la clase is-invalid
        expect(container.querySelector('[name="nombre"]')?.classList.contains('is-invalid')).toBe(
          true
        );
      });

      // El SKU en el form se mapea desde "codigo" del contrato
      expect(container.querySelector('[name="sku"]')?.classList.contains('is-invalid')).toBe(true);
    });

    it('debe mapear el campo "codigo" del servidor al input "sku" del form', async () => {
      const apiError = new ApiError(422, {
        status: 422,
        type: '/errors/validation',
        title: 'Error de validación',
        fields: { codigo: 'El código ya está en uso' },
      });

      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockRejectedValueOnce(apiError);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Test';
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      skuInput.value = 'TEC-001';
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      precioInput.value = '1000';
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        // "codigo" del servidor debe mapear al input "sku"
        expect(container.querySelector('[name="sku"]')?.classList.contains('is-invalid')).toBe(
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

      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockRejectedValueOnce(apiError);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const btnSubmit = q(container, '#btn-submit') as HTMLButtonElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Test';
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      skuInput.value = 'SKU-001';
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      precioInput.value = '1000';
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(btnSubmit.disabled).toBe(false);
      });
    });
  });

  // ── Error 409 — SKU duplicado ────────────────────────────────────────────────

  describe('error 409 — SKU duplicado', () => {
    it('debe mostrar alerta global con mensaje de SKU duplicado', async () => {
      const apiError = new ApiError(409, {
        type: '/errors/conflict',
        title: 'Conflicto de datos',
        status: 409,
      });

      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockRejectedValueOnce(apiError);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Producto Duplicado';
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      skuInput.value = 'TEC-MEC-001'; // SKU existente
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      precioInput.value = '5000';
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-global')).not.toBeNull();
      });

      expect(container.querySelector('.alert-global')?.textContent).toContain(
        'Ya existe un producto con este SKU'
      );
      expect(container.innerHTML).toContain('alert-danger');
    });
  });

  // ── Error 500 / errores genéricos ────────────────────────────────────────────

  describe('error 500 — error genérico del servidor', () => {
    it('debe mostrar alerta global con mensaje genérico de error', async () => {
      const apiError = new ApiError(500, {
        type: '/errors/server-error',
        title: 'Error interno del servidor',
        status: 500,
      });

      mockApiFetch.mockResolvedValueOnce(categoriasResponse).mockRejectedValueOnce(apiError);

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('form')).not.toBeNull();
      });

      const form = q(container, 'form') as HTMLFormElement;
      const nombreInput = q(container, '[name="nombre"]') as HTMLInputElement;
      nombreInput.value = 'Producto Test';
      const skuInput = q(container, '[name="sku"]') as HTMLInputElement;
      skuInput.value = 'SKU-500';
      const precioInput = q(container, '[name="precio"]') as HTMLInputElement;
      precioInput.value = '1000';
      const categoriaSelect = q(container, '[name="categoriaId"]') as HTMLSelectElement;
      categoriaSelect.value = 'cat-001';

      form.dispatchEvent(new Event('submit', { bubbles: true }));

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-global')).not.toBeNull();
      });

      expect(container.querySelector('.alert-global')?.textContent).toContain(
        'Error al guardar el producto'
      );
    });
  });

  // ── Rol consulta — redirección inmediata ─────────────────────────────────────

  describe('rol consulta', () => {
    it('debe redirigir a #/productos sin renderizar el formulario', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderProductosForm(container, { signal });

      // No debe haber llamado apiFetch — salió antes
      expect(mockApiFetch).not.toHaveBeenCalled();
      // No hay formulario ni spinner en el DOM
      expect(container.querySelector('form')).toBeNull();
      // Debe haber navegado a la lista
      expect(window.location.hash).toBe('#/productos');
    });

    it('no debe mostrar formulario para rol consulta en modo editar', () => {
      mockAuthService.getProfile.mockReturnValue('consulta');

      renderProductosForm(container, { id: 'prod-001', signal });

      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(container.querySelector('form')).toBeNull();
      expect(window.location.hash).toBe('#/productos');
    });
  });

  // ── Estado de error al cargar datos ─────────────────────────────────────────

  describe('error al cargar datos iniciales', () => {
    it('debe mostrar alerta de error si falla la carga de categorías', async () => {
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

      renderProductosForm(container, { signal });

      await vi.waitFor(() => {
        expect(container.querySelector('.alert-danger')).not.toBeNull();
      });

      expect(container.innerHTML).toContain('No se pudo cargar el formulario');
    });
  });
});
