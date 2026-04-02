import type { KardexEntry, PaginatedResponse, Producto } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo kardex.
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

import { apiFetch } from '../_shared/apiFetch';

import { kardexPage } from './kardex';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture de productos activos para tests */
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
    stockMinimo: 3,
    status: 'active',
    createdAt: '2025-01-12T09:00:00.000Z',
    updatedAt: '2025-01-12T09:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Fixture de entradas de kardex para prod-001 */
const kardexFixture: KardexEntry[] = [
  {
    id: 'krd-001',
    fecha: '2025-01-01T00:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'saldo_inicial',
    cantidadEntrada: 5,
    cantidadSalida: 0,
    saldoAnterior: 0,
    saldoActual: 5,
    precioUnitario: 26000,
    costoMovimiento: 130000,
  },
  {
    id: 'krd-002',
    fecha: '2025-01-20T10:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'entrada',
    movimientoId: 'mov-001',
    movimientoNumero: 'MOV-2025-0001',
    cantidadEntrada: 10,
    cantidadSalida: 0,
    saldoAnterior: 5,
    saldoActual: 15,
    precioUnitario: 28500,
    costoMovimiento: 285000,
  },
  {
    id: 'krd-003',
    fecha: '2025-01-28T14:30:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-009',
    movimientoNumero: 'MOV-2025-0009',
    cantidadEntrada: 0,
    cantidadSalida: 2,
    saldoAnterior: 15,
    saldoActual: 13,
    precioUnitario: 28500,
    costoMovimiento: 57000,
  },
];

/** Respuesta paginada de kardex con datos */
const kardexResponse: PaginatedResponse<KardexEntry> = {
  data: kardexFixture,
  total: 3,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

/** Respuesta paginada de kardex vacía */
const kardexEmptyResponse: PaginatedResponse<KardexEntry> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
};

/** Respuesta paginada de productos */
const productosResponse = {
  data: productosFixture,
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

describe('kardexPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    kardexPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga inicial ──────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga de productos', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    kardexPage.render(container);

    expect(container.innerHTML).toContain('spinner-border');
  });

  // ── Encabezado y selector de producto ───────────────────────────────────────

  it('debe renderizar el encabezado "Kardex de Movimientos"', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-title')).not.toBeNull();
    });

    expect(q(container, '#kardex-title').textContent).toContain('Kardex de Movimientos');
  });

  it('debe renderizar el selector de productos', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    expect(container.querySelector('#producto-select')).not.toBeNull();
  });

  // ── Selector poblado con productos del mock ──────────────────────────────────

  it('debe poblar el selector con los productos del mock', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;

    // Primer producto en las opciones
    expect(select.innerHTML).toContain('TEC-MEC-001');
    expect(select.innerHTML).toContain('Teclado Mecánico TKL');

    // Segundo producto
    expect(select.innerHTML).toContain('MON-IPS-001');
    expect(select.innerHTML).toContain('Monitor 27 pulgadas IPS');
  });

  it('debe incluir opciones con el formato "codigo — nombre"', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    expect(select.innerHTML).toContain('TEC-MEC-001 — Teclado Mecánico TKL');
  });

  // ── Estado inicial — placeholder ─────────────────────────────────────────────

  it('debe mostrar placeholder inicial sin tabla cuando no hay producto seleccionado', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-table-area')).not.toBeNull();
    });

    // No debe existir tabla kardex
    expect(container.querySelector('#kardex-table')).toBeNull();

    // Debe mostrar el texto placeholder
    expect(container.innerHTML).toContain('Seleccioná un producto para ver su kardex');
  });

  // ── Selección de producto → carga kardex ────────────────────────────────────

  it('debe cargar el kardex al seleccionar un producto', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockResolvedValueOnce(kardexResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    // Verificar que se llamó a la API del kardex con el productoId correcto
    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('productoId=prod-001'),
      expect.any(Object)
    );
  });

  it('debe renderizar la tabla de kardex tras seleccionar un producto', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockResolvedValueOnce(kardexResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-table')).not.toBeNull();
    });

    expect(container.querySelector('#kardex-table')).not.toBeNull();
  });

  it('debe renderizar las filas con los datos del kardex', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockResolvedValueOnce(kardexResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-tbody')).not.toBeNull();
    });

    const tbody = q(container, '#kardex-tbody');

    // Debe mostrar las referencias de los movimientos
    expect(tbody.innerHTML).toContain('MOV-2025-0001');
    expect(tbody.innerHTML).toContain('MOV-2025-0009');
  });

  it('debe mostrar los tipos de movimiento en badges', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockResolvedValueOnce(kardexResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-tbody')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('saldo_inicial');
    expect(html).toContain('entrada');
    expect(html).toContain('salida');
  });

  // ── Encabezados de columna ───────────────────────────────────────────────────

  it('debe renderizar los encabezados correctos de la tabla', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockResolvedValueOnce(kardexResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-table')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Fecha');
    expect(html).toContain('Tipo');
    expect(html).toContain('Entrada');
    expect(html).toContain('Salida');
    expect(html).toContain('Saldo');
    expect(html).toContain('Referencia');
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  it('debe mostrar estado vacío cuando el kardex retorna array vacío', async () => {
    mockApiFetch
      .mockResolvedValueOnce(productosResponse)
      .mockResolvedValueOnce(kardexEmptyResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-empty-row')).not.toBeNull();
    });

    expect(container.innerHTML).toContain(
      'No hay movimientos para este producto en el período seleccionado'
    );
  });

  // ── Estado de error en carga de kardex ──────────────────────────────────────

  it('debe mostrar error cuando el fetch del kardex falla', async () => {
    mockApiFetch
      .mockResolvedValueOnce(productosResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-error')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el kardex');
  });

  // ── Estado de error en carga de productos ───────────────────────────────────

  it('debe mostrar error cuando falla la carga de productos', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar la página de kardex');
  });

  // ── AbortError — no debe mostrar error si se aborta la petición ─────────────

  it('no debe mostrar error cuando la petición de productos es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  it('no debe mostrar error cuando la petición de kardex es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockResolvedValueOnce(productosResponse).mockRejectedValueOnce(abortError);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    expect(container.querySelector('#kardex-error')).toBeNull();
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    kardexPage.render(container);

    expect(() => {
      kardexPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      kardexPage.destroy();
    }).not.toThrow();
  });

  // ── Inputs de fecha opcionales ───────────────────────────────────────────────

  it('debe renderizar los inputs de fecha desde y hasta', async () => {
    mockApiFetch.mockResolvedValueOnce(productosResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#fecha-desde')).not.toBeNull();
    });

    expect(container.querySelector('#fecha-desde')).not.toBeNull();
    expect(container.querySelector('#fecha-hasta')).not.toBeNull();
  });

  it('debe incluir fechaDesde en la URL cuando está disponible al seleccionar producto', async () => {
    mockApiFetch
      .mockResolvedValueOnce(productosResponse)
      .mockResolvedValueOnce(kardexEmptyResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    // Llenar el input de fecha antes de seleccionar el producto
    const fechaDesdeInput = q(container, '#fecha-desde') as HTMLInputElement;
    fechaDesdeInput.value = '2025-01-01';

    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('fechaDesde=2025-01-01'),
      expect.any(Object)
    );
  });

  it('debe re-fetchear al cambiar fecha-desde cuando hay producto seleccionado', async () => {
    mockApiFetch
      .mockResolvedValueOnce(productosResponse)
      .mockResolvedValueOnce(kardexResponse)
      .mockResolvedValueOnce(kardexEmptyResponse);

    kardexPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('#producto-select')).not.toBeNull();
    });

    // Primero seleccionar un producto
    const select = q(container, '#producto-select') as HTMLSelectElement;
    select.value = 'prod-001';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(container.querySelector('#kardex-table')).not.toBeNull();
    });

    // Luego cambiar la fecha desde
    const fechaDesdeInput = q(container, '#fecha-desde') as HTMLInputElement;
    fechaDesdeInput.value = '2025-01-15';
    fechaDesdeInput.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(3);
    });

    const calls = mockApiFetch.mock.calls;
    const lastCall = calls[calls.length - 1];
    if (!lastCall) throw new Error('No API calls recorded');
    expect(lastCall[0]).toContain('fechaDesde=2025-01-15');
  });
});
