import type { Almacen, Movimiento, Producto, Proveedor } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo movimientos-form.
// Se mockean apiFetch para aislar el comportamiento del componente.

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

import { renderMovimientosForm } from './movimientos-form';

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

/** Fixture de proveedores para tests */
const proveedoresFixture: Proveedor[] = [
  {
    id: 'prov-001',
    codigo: 'TECH',
    razonSocial: 'Tecno Distribuciones S.A.',
    ruc: '20123456789',
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
    codigo: 'MOU-INL-001',
    nombre: 'Mouse Inalámbrico',
    categoriaId: 'cat-001',
    categoriaNombre: 'Periféricos',
    unidadMedida: 'unidad',
    precioUnitario: 8900,
    stockMinimo: 10,
    status: 'active',
    createdAt: '2025-01-10T08:00:00.000Z',
    updatedAt: '2025-01-10T08:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Fixture de movimiento creado para la respuesta del POST */
const movimientoCreado: Movimiento = {
  id: 'mov-nuevo-001',
  numero: 'MOV-2025-0100',
  tipo: 'entrada',
  estado: 'borrador',
  almacenDestinoId: 'alm-001',
  almacenDestinoNombre: 'Depósito Central',
  proveedorId: 'prov-001',
  proveedorNombre: 'Tecno Distribuciones S.A.',
  items: [
    {
      id: 'movi-new-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidad: 5,
      precioUnitario: 28500,
    },
  ],
  createdAt: '2025-04-01T10:00:00.000Z',
  updatedAt: '2025-04-01T10:00:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Respuesta de catálogos exitosa para setupCatalogs */
function setupCatalogs(): void {
  mockApiFetch
    .mockResolvedValueOnce({ data: almacenesFixture })
    .mockResolvedValueOnce({ data: proveedoresFixture })
    .mockResolvedValueOnce({ data: productosFixture });
}

describe('renderMovimientosForm', () => {
  let container: HTMLElement;
  let signal: AbortSignal;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    signal = new AbortController().signal;
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga de catálogos', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    renderMovimientosForm(container, { signal });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando formulario');
  });

  // ── Renderizado del formulario ─────────────────────────────────────────────

  it('debe renderizar el formulario con el selector de tipo', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    expect(container.querySelector('#tipo')).not.toBeNull();
    expect(container.innerHTML).toContain('Nuevo Movimiento');
  });

  it('debe renderizar los campos de cabecera: tipo, fecha y notas', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    expect(container.querySelector('[name="tipo"]')).not.toBeNull();
    expect(container.querySelector('[name="fecha"]')).not.toBeNull();
    expect(container.querySelector('[name="notas"]')).not.toBeNull();
  });

  it('debe renderizar las opciones de tipo de movimiento', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#tipo')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Entrada');
    expect(html).toContain('Salida');
    expect(html).toContain('Transferencia');
    expect(html).toContain('Ajuste');
    expect(html).toContain('Devolución');
  });

  it('debe cargar datos de los tres catálogos en paralelo', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(3);
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/almacenes'),
      expect.any(Object)
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/proveedores'),
      expect.any(Object)
    );
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/productos'),
      expect.any(Object)
    );
  });

  // ── Secciones condicionales según tipo ────────────────────────────────────

  it('debe ocultar todas las secciones de almacén/proveedor al inicio', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('[data-section]')).not.toBeNull();
    });

    const sections = container.querySelectorAll<HTMLElement>('[data-section]');
    sections.forEach((section) => {
      expect(section.style.display).toBe('none');
    });
  });

  it('debe mostrar almacén destino y proveedor al seleccionar tipo "entrada"', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#tipo')).not.toBeNull();
    });

    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'entrada';
    tipoSelect.dispatchEvent(new Event('change'));

    const sectionDestino = container.querySelector<HTMLElement>('[data-section="almacen-destino"]');
    const sectionProveedor = container.querySelector<HTMLElement>('[data-section="proveedor"]');
    const sectionOrigen = container.querySelector<HTMLElement>('[data-section="almacen-origen"]');

    expect(sectionDestino?.style.display).toBe('');
    expect(sectionProveedor?.style.display).toBe('');
    expect(sectionOrigen?.style.display).toBe('none');
  });

  it('debe mostrar almacén origen y destino al seleccionar tipo "transferencia"', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#tipo')).not.toBeNull();
    });

    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'transferencia';
    tipoSelect.dispatchEvent(new Event('change'));

    const sectionOrigen = container.querySelector<HTMLElement>('[data-section="almacen-origen"]');
    const sectionDestino = container.querySelector<HTMLElement>('[data-section="almacen-destino"]');
    const sectionProveedor = container.querySelector<HTMLElement>('[data-section="proveedor"]');

    expect(sectionOrigen?.style.display).toBe('');
    expect(sectionDestino?.style.display).toBe('');
    expect(sectionProveedor?.style.display).toBe('none');
  });

  it('debe mostrar solo almacén origen al seleccionar tipo "salida"', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#tipo')).not.toBeNull();
    });

    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'salida';
    tipoSelect.dispatchEvent(new Event('change'));

    const sectionOrigen = container.querySelector<HTMLElement>('[data-section="almacen-origen"]');
    const sectionDestino = container.querySelector<HTMLElement>('[data-section="almacen-destino"]');
    const sectionProveedor = container.querySelector<HTMLElement>('[data-section="proveedor"]');

    expect(sectionOrigen?.style.display).toBe('');
    expect(sectionDestino?.style.display).toBe('none');
    expect(sectionProveedor?.style.display).toBe('none');
  });

  // ── Tabla de ítems dinámica ────────────────────────────────────────────────

  it('debe mostrar mensaje vacío cuando no hay ítems', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#items-tbody')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Sin ítems agregados');
  });

  it('debe agregar una fila al hacer clic en "Agregar ítem"', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-item')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const rows = container.querySelectorAll('#items-tbody tr:not(#items-empty-row)');
    expect(rows.length).toBe(1);
    expect(container.querySelector('#items-empty-row')).toBeNull();
  });

  it('debe agregar múltiples filas con clics sucesivos', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-item')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();
    btnAgregar.click();
    btnAgregar.click();

    const rows = container.querySelectorAll('#items-tbody tr[data-row-id]');
    expect(rows.length).toBe(3);
  });

  it('debe eliminar una fila al hacer clic en el botón eliminar', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-item')).not.toBeNull();
    });

    // Agregar dos ítems
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();
    btnAgregar.click();

    expect(container.querySelectorAll('#items-tbody tr[data-row-id]').length).toBe(2);

    // Eliminar el primer ítem
    const firstRemoveBtn = container.querySelector<HTMLButtonElement>('.item-remove-btn');
    if (!firstRemoveBtn) throw new Error('Botón eliminar no encontrado');
    firstRemoveBtn.click();

    expect(container.querySelectorAll('#items-tbody tr[data-row-id]').length).toBe(1);
  });

  it('debe mostrar el mensaje vacío después de eliminar todos los ítems', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-agregar-item')).not.toBeNull();
    });

    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const removeBtn = container.querySelector<HTMLButtonElement>('.item-remove-btn');
    if (!removeBtn) throw new Error('Botón eliminar no encontrado');
    removeBtn.click();

    expect(container.innerHTML).toContain('Sin ítems agregados');
  });

  // ── Validación del formulario ──────────────────────────────────────────────

  it('debe mostrar error de validación si se envía sin ítems', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo pero no agregar ítems
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'entrada';
    tipoSelect.dispatchEvent(new Event('change'));

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-global')).not.toBeNull();
    });

    expect(container.querySelector('.alert-global')?.textContent).toContain(
      'Debe agregar al menos un ítem'
    );
  });

  it('debe mostrar error si se envía sin tipo seleccionado', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-global')).not.toBeNull();
    });

    expect(container.querySelector('.alert-global')?.textContent).toContain(
      'tipo de movimiento es requerido'
    );
  });

  // ── POST exitoso → redirección al detalle ──────────────────────────────────

  it('debe hacer POST y redirigir al detalle tras creación exitosa', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'entrada';
    tipoSelect.dispatchEvent(new Event('change'));

    // Seleccionar almacén destino — requerido para tipo "entrada"
    const almacenDestinoSelect = container.querySelector<HTMLSelectElement>('#almacenDestinoId');
    if (!almacenDestinoSelect) throw new Error('Select de almacén destino no encontrado');
    almacenDestinoSelect.value = 'alm-001';

    // Proveedor es opcional para "entrada" — NO se selecciona para verificar que el POST se realiza igual

    // Agregar un ítem
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    // Seleccionar producto en el ítem — bubbles: true para que llegue al delegation handler del tbody
    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // Configurar mock del POST
    mockApiFetch.mockResolvedValueOnce(movimientoCreado);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/movimientos',
        expect.objectContaining({ method: 'POST' })
      );
    });

    expect(window.location.hash).toBe('#/movimientos/mov-nuevo-001');
  });

  // ── Respuesta 422 → alerta global con mensaje de ProblemDetails ────────────

  it('debe mostrar alerta global con el detail del ProblemDetails en 422', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'salida';
    tipoSelect.dispatchEvent(new Event('change'));

    // Seleccionar almacén origen — requerido para tipo "salida"
    const almacenOrigenSelect = container.querySelector<HTMLSelectElement>('#almacenOrigenId');
    if (!almacenOrigenSelect) throw new Error('Select de almacén origen no encontrado');
    almacenOrigenSelect.value = 'alm-001';

    // Agregar ítem con producto
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // Mock del POST que retorna 422
    const apiError = new ApiError(422, {
      status: 422,
      type: '/errors/insufficient-stock',
      title: 'Stock insuficiente',
      detail: 'Stock insuficiente para el producto TEC-MEC-001',
    });
    mockApiFetch.mockRejectedValueOnce(apiError);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-global')).not.toBeNull();
    });

    expect(container.querySelector('.alert-global')?.textContent).toContain(
      'Stock insuficiente para el producto TEC-MEC-001'
    );
  });

  it('debe mostrar alerta genérica en error 500', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'salida';
    tipoSelect.dispatchEvent(new Event('change'));

    // Seleccionar almacén origen — requerido para tipo "salida"
    const almacenOrigenSelect = container.querySelector<HTMLSelectElement>('#almacenOrigenId');
    if (!almacenOrigenSelect) throw new Error('Select de almacén origen no encontrado');
    almacenOrigenSelect.value = 'alm-001';

    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
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
      'Error al guardar el movimiento'
    );
  });

  // ── Validación de campos requeridos por tipo ──────────────────────────────────

  it('debe mostrar error de validación si "entrada" no tiene almacenDestinoId y no hace POST', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo entrada
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'entrada';
    tipoSelect.dispatchEvent(new Event('change'));

    // Agregar ítem con producto
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // NO seleccionar almacén destino — debe fallar la validación
    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const almacenDestino = container.querySelector('#almacenDestinoId');
      expect(almacenDestino?.classList.contains('is-invalid')).toBe(true);
    });

    // No debe haber llamado al POST
    expect(mockApiFetch).toHaveBeenCalledTimes(3); // Solo las 3 llamadas de catálogos
  });

  it('debe mostrar error de validación si "transferencia" no tiene almacenOrigenId y no hace POST', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo transferencia
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'transferencia';
    tipoSelect.dispatchEvent(new Event('change'));

    // Agregar ítem con producto
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // NO seleccionar almacén origen — debe fallar la validación
    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const almacenOrigen = container.querySelector('#almacenOrigenId');
      expect(almacenOrigen?.classList.contains('is-invalid')).toBe(true);
    });

    // No debe haber llamado al POST
    expect(mockApiFetch).toHaveBeenCalledTimes(3); // Solo las 3 llamadas de catálogos
  });

  it('debe hacer POST para "entrada" sin proveedorId — proveedor es opcional', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo entrada
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'entrada';
    tipoSelect.dispatchEvent(new Event('change'));

    // Seleccionar almacén destino — requerido
    const almacenDestinoSelect = container.querySelector<HTMLSelectElement>('#almacenDestinoId');
    if (!almacenDestinoSelect) throw new Error('Select de almacén destino no encontrado');
    almacenDestinoSelect.value = 'alm-001';

    // NO seleccionar proveedor — es opcional para entrada

    // Agregar ítem con producto
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    mockApiFetch.mockResolvedValueOnce(movimientoCreado);

    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // El POST debe realizarse a pesar de no tener proveedor
    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/movimientos',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('debe mostrar error de validación si "devolucion" no tiene proveedorId y no hace POST', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('form')).not.toBeNull();
    });

    // Seleccionar tipo devolucion
    const tipoSelect = q(container, '#tipo') as HTMLSelectElement;
    tipoSelect.value = 'devolucion';
    tipoSelect.dispatchEvent(new Event('change'));

    // Seleccionar almacén destino — requerido
    const almacenDestinoSelect = container.querySelector<HTMLSelectElement>('#almacenDestinoId');
    if (!almacenDestinoSelect) throw new Error('Select de almacén destino no encontrado');
    almacenDestinoSelect.value = 'alm-001';

    // Agregar ítem con producto
    const btnAgregar = q(container, '#btn-agregar-item') as HTMLButtonElement;
    btnAgregar.click();

    const productoSelect = container.querySelector<HTMLSelectElement>('.item-producto-select');
    if (!productoSelect) throw new Error('Select de producto no encontrado');
    productoSelect.value = 'prod-001';
    productoSelect.dispatchEvent(new Event('change', { bubbles: true }));

    // NO seleccionar proveedor — debe fallar la validación para devolucion
    const form = q(container, 'form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await vi.waitFor(() => {
      const proveedorSelect = container.querySelector('#proveedorId');
      expect(proveedorSelect?.classList.contains('is-invalid')).toBe(true);
    });

    // No debe haber llamado al POST — solo las 3 llamadas de catálogos
    expect(mockApiFetch).toHaveBeenCalledTimes(3);
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  it('debe navegar a #/movimientos al hacer clic en Volver', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/movimientos');
  });

  it('debe navegar a #/movimientos al hacer clic en Cancelar', async () => {
    setupCatalogs();

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-cancel')).not.toBeNull();
    });

    const btnCancel = q(container, '#btn-cancel') as HTMLButtonElement;
    btnCancel.click();

    expect(window.location.hash).toBe('#/movimientos');
  });

  // ── Error al cargar catálogos ──────────────────────────────────────────────

  it('debe mostrar alerta de error si falla la carga de catálogos', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    renderMovimientosForm(container, { signal });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el formulario');
  });
});
