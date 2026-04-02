import type { Almacen, Conteo, Producto } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo conteos-nuevo.
// Se mockea apiFetch para aislar el comportamiento del componente.

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

import { apiFetch, ApiError } from '../_shared/apiFetch';

import { conteosNuevoPage } from './conteos-nuevo';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture de almacenes para tests */
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
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Fixture de productos para tests */
const productosFixture: Producto[] = [
  {
    id: 'prod-001',
    codigo: 'TEC-MEC-001',
    nombre: 'Teclado Mecánico TKL',
    categoriaId: 'cat-001',
    categoriaNombre: 'Periféricos',
    unidadMedida: 'unidad',
    precioUnitario: 28500,
    stockMinimo: 5,
    status: 'active',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-10T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'prod-002',
    codigo: 'MON-IPS-001',
    nombre: 'Monitor 27 pulgadas IPS',
    categoriaId: 'cat-002',
    categoriaNombre: 'Monitores',
    unidadMedida: 'unidad',
    precioUnitario: 185000,
    stockMinimo: 2,
    status: 'active',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-10T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Fixture de conteo creado para la respuesta del POST */
const conteoCreado: Conteo = {
  id: 'cnt-nuevo-001',
  numero: 'CNT-2025-0099',
  descripcion: 'Conteo de prueba',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'planificado',
  items: [
    {
      id: 'cnt-nuevo-001-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidadSistema: 5,
      ajustado: false,
    },
  ],
  createdAt: '2025-04-01T10:00:00.000Z',
  updatedAt: '2025-04-01T10:00:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Configura mocks de catálogos exitosos (almacenes + productos) */
function setupCatalogs(): void {
  mockApiFetch
    .mockResolvedValueOnce({ data: almacenesFixture })
    .mockResolvedValueOnce({ data: productosFixture });
}

describe('conteosNuevoPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    conteosNuevoPage.destroy();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga de catálogos', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    conteosNuevoPage.render(container);

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando formulario');
  });

  // ── Renderizado del formulario ─────────────────────────────────────────────

  it('debe renderizar el formulario con título "Nuevo Conteo"', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    expect(container.querySelector('#conteos-nuevo-form')).not.toBeNull();
    expect(container.innerHTML).toContain('Nuevo Conteo');
  });

  it('debe cargar datos de los dos catálogos en paralelo', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/almacenes'),
      expect.any(Object)
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/productos'),
      expect.any(Object)
    );
  });

  it('debe renderizar los campos requeridos: almacenId y descripcion', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacenId')).not.toBeNull();
    });

    expect(container.querySelector('#almacenId')).not.toBeNull();
    expect(container.querySelector('#descripcion')).not.toBeNull();
    expect(container.querySelector('#fechaInicio')).not.toBeNull();
    expect(container.querySelector('#fechaFin')).not.toBeNull();
  });

  it('debe renderizar los almacenes en el select', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#almacenId')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Depósito Central');
    expect(html).toContain('Almacén Norte');
  });

  // ── Tabla de productos dinámica ────────────────────────────────────────────

  it('debe mostrar fila vacía cuando no hay productos agregados', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#items-tbody')).not.toBeNull();
    });

    expect(container.querySelector('#items-empty-row')).not.toBeNull();
    expect(container.innerHTML).toContain('Sin productos agregados');
  });

  it('debe agregar una fila al hacer clic en "Agregar Producto"', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-producto')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const rows = container.querySelectorAll('#items-tbody tr[data-row-id]');
    expect(rows.length).toBe(1);
    expect(container.querySelector('#items-empty-row')).toBeNull();
  });

  it('debe agregar múltiples filas con clics sucesivos', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-producto')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();
    btnAgregar.click();
    btnAgregar.click();

    const rows = container.querySelectorAll('#items-tbody tr[data-row-id]');
    expect(rows.length).toBe(3);
  });

  it('debe eliminar una fila al hacer clic en el botón eliminar', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-producto')).not.toBeNull();
    });

    // Agregar dos productos
    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();
    btnAgregar.click();

    expect(container.querySelectorAll('#items-tbody tr[data-row-id]').length).toBe(2);

    // Eliminar el primer producto
    const firstRemoveBtn = container.querySelector<HTMLButtonElement>('.item-remove-btn');
    if (!firstRemoveBtn) throw new Error('Botón eliminar no encontrado');
    firstRemoveBtn.click();

    expect(container.querySelectorAll('#items-tbody tr[data-row-id]').length).toBe(1);
  });

  it('debe mostrar el mensaje vacío después de eliminar todos los productos', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-producto')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const removeBtn = container.querySelector<HTMLButtonElement>('.item-remove-btn');
    if (!removeBtn) throw new Error('Botón eliminar no encontrado');
    removeBtn.click();

    expect(container.innerHTML).toContain('Sin productos agregados');
  });

  // ── Validación del formulario ──────────────────────────────────────────────

  it('debe marcar almacenId como inválido si se envía sin seleccionar almacén', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Llenar descripción pero no seleccionar almacén
    const descripcionInput = q(container, '#descripcion') as HTMLInputElement;
    descripcionInput.value = 'Conteo de prueba';

    // Agregar un producto
    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const almacenSelect = container.querySelector('#almacenId');
      expect(almacenSelect?.classList.contains('is-invalid')).toBe(true);
    });

    // No debe haber llamado al POST (solo las 2 de catálogos)
    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  it('debe marcar descripcion como inválida si se envía vacía', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar almacén pero dejar descripción vacía
    const almacenSelect = q(container, '#almacenId') as HTMLSelectElement;
    almacenSelect.value = 'alm-001';

    // Agregar un producto
    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const descripcionInput = container.querySelector('#descripcion');
      expect(descripcionInput?.classList.contains('is-invalid')).toBe(true);
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  it('debe mostrar error en #items-error si no hay productos agregados', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Llenar campos requeridos pero sin agregar productos
    const almacenSelect = q(container, '#almacenId') as HTMLSelectElement;
    almacenSelect.value = 'alm-001';

    const descripcionInput = q(container, '#descripcion') as HTMLInputElement;
    descripcionInput.value = 'Conteo de prueba';

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const itemsError = container.querySelector('#items-error');
      expect(itemsError?.textContent).toContain('Debe agregar al menos un producto');
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(2);
  });

  // ── POST exitoso → redirección al detalle ──────────────────────────────────

  it('debe hacer POST y redirigir al detalle tras creación exitosa', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar almacén
    const almacenSelect = q(container, '#almacenId') as HTMLSelectElement;
    almacenSelect.value = 'alm-001';

    // Llenar descripción
    const descripcionInput = q(container, '#descripcion') as HTMLInputElement;
    descripcionInput.value = 'Conteo de prueba';

    // Agregar un producto
    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // Configurar mock del POST
    mockApiFetch.mockResolvedValueOnce(conteoCreado);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/conteos',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(window.location.hash).toBe('#/conteos/cnt-nuevo-001');
  });

  // ── Respuesta 422 → alerta global ─────────────────────────────────────────

  it('debe mostrar alerta global con el detail del ProblemDetails en 422', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    const almacenSelect = q(container, '#almacenId') as HTMLSelectElement;
    almacenSelect.value = 'alm-001';

    const descripcionInput = q(container, '#descripcion') as HTMLInputElement;
    descripcionInput.value = 'Conteo de prueba';

    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const apiError = new ApiError(422, {
      status: 422,
      type: '/errors/validation',
      title: 'Error de validación',
      detail: 'El almacén seleccionado no está activo.',
    });
    mockApiFetch.mockRejectedValueOnce(apiError);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-global')).not.toBeNull();
    });

    expect(container.querySelector('.alert-global')?.textContent).toContain(
      'El almacén seleccionado no está activo.'
    );
  });

  it('debe mostrar alerta genérica en error 500', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    const almacenSelect = q(container, '#almacenId') as HTMLSelectElement;
    almacenSelect.value = 'alm-001';

    const descripcionInput = q(container, '#descripcion') as HTMLInputElement;
    descripcionInput.value = 'Conteo de prueba';

    const btnAgregar = q(container, '#btn-agregar-producto') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const apiError = new ApiError(500, { title: 'Internal Server Error' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-global')).not.toBeNull();
    });

    expect(container.querySelector('.alert-global')?.textContent).toContain(
      'Error al crear el conteo'
    );
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  it('debe navegar a #/conteos al hacer clic en Volver', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/conteos');
  });

  it('debe navegar a #/conteos al hacer clic en Cancelar', async () => {
    setupCatalogs();

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-cancel')).not.toBeNull();
    });

    const btnCancel = q(container, '#btn-cancel') as HTMLButtonElement;
    btnCancel.click();

    expect(window.location.hash).toBe('#/conteos');
  });

  // ── Error al cargar catálogos ──────────────────────────────────────────────

  it('debe mostrar alerta de error si falla la carga de catálogos', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el formulario');
  });

  it('debe mostrar botón "Volver a Conteos" en la página de error de catálogos', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    conteosNuevoPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back-error')).not.toBeNull();
    });

    const btnBackError = q(container, '#btn-back-error') as HTMLButtonElement;
    btnBackError.click();

    expect(window.location.hash).toBe('#/conteos');
  });
});
