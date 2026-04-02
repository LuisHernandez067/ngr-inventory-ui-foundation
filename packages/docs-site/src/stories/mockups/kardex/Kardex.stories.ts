import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para un ítem del kardex */
interface KardexEntryEjemplo {
  id: string;
  fecha: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  almacenId: string;
  almacenNombre: string;
  tipo: 'saldo_inicial' | 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'devolucion';
  movimientoId?: string;
  movimientoNumero?: string;
  cantidadEntrada: number;
  cantidadSalida: number;
  saldoAnterior: number;
  saldoActual: number;
  precioUnitario: number;
  costoMovimiento: number;
}

/** Tipo para un producto simplificado */
interface ProductoSimple {
  id: string;
  codigo: string;
  nombre: string;
}

// Producto de ejemplo para el kardex
const productoProd001: ProductoSimple = {
  id: 'prod-001',
  codigo: 'TEC-MEC-001',
  nombre: 'Teclado Mecánico TKL',
};

// Entradas de kardex para el producto prod-001 — 10 registros con saldo calculado
const kardexProd001: KardexEntryEjemplo[] = [
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
  {
    id: 'krd-004',
    fecha: '2025-02-05T09:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-010',
    movimientoNumero: 'MOV-2025-0010',
    cantidadEntrada: 0,
    cantidadSalida: 1,
    saldoAnterior: 13,
    saldoActual: 12,
    precioUnitario: 28500,
    costoMovimiento: 28500,
  },
  {
    id: 'krd-005',
    fecha: '2025-02-15T11:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'ajuste',
    movimientoId: 'mov-011',
    movimientoNumero: 'MOV-2025-0011',
    cantidadEntrada: 0,
    cantidadSalida: 1,
    saldoAnterior: 12,
    saldoActual: 11,
    precioUnitario: 28500,
    costoMovimiento: 28500,
  },
  {
    id: 'krd-006',
    fecha: '2025-02-22T16:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-012',
    movimientoNumero: 'MOV-2025-0012',
    cantidadEntrada: 0,
    cantidadSalida: 3,
    saldoAnterior: 11,
    saldoActual: 8,
    precioUnitario: 28500,
    costoMovimiento: 85500,
  },
  {
    id: 'krd-007',
    fecha: '2025-03-01T10:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-013',
    movimientoNumero: 'MOV-2025-0013',
    cantidadEntrada: 0,
    cantidadSalida: 2,
    saldoAnterior: 8,
    saldoActual: 6,
    precioUnitario: 28500,
    costoMovimiento: 57000,
  },
  {
    id: 'krd-008',
    fecha: '2025-03-10T09:30:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'entrada',
    movimientoId: 'mov-014',
    movimientoNumero: 'MOV-2025-0014',
    cantidadEntrada: 8,
    cantidadSalida: 0,
    saldoAnterior: 6,
    saldoActual: 14,
    precioUnitario: 29000,
    costoMovimiento: 232000,
  },
  {
    id: 'krd-009',
    fecha: '2025-03-18T14:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-015',
    movimientoNumero: 'MOV-2025-0015',
    cantidadEntrada: 0,
    cantidadSalida: 4,
    saldoAnterior: 14,
    saldoActual: 10,
    precioUnitario: 29000,
    costoMovimiento: 116000,
  },
  {
    id: 'krd-010',
    fecha: '2025-03-25T11:00:00.000Z',
    productoId: 'prod-001',
    productoCodigo: 'TEC-MEC-001',
    productoNombre: 'Teclado Mecánico TKL',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'salida',
    movimientoId: 'mov-016',
    movimientoNumero: 'MOV-2025-0016',
    cantidadEntrada: 0,
    cantidadSalida: 2,
    saldoAnterior: 10,
    saldoActual: 8,
    precioUnitario: 29000,
    costoMovimiento: 58000,
  },
];

// Productos disponibles para el selector
const productosDisponibles: ProductoSimple[] = [
  { id: 'prod-001', codigo: 'TEC-MEC-001', nombre: 'Teclado Mecánico TKL' },
  { id: 'prod-002', codigo: 'MON-IPS-001', nombre: 'Monitor 27 pulgadas IPS' },
  { id: 'prod-003', codigo: 'SIL-ERG-001', nombre: 'Silla Ergonómica Gamer' },
  { id: 'prod-004', codigo: 'MOU-INL-001', nombre: 'Mouse Inalámbrico' },
];

/** Devuelve el badge HTML según el tipo de movimiento en el kardex */
function tipoKardexBadge(tipo: KardexEntryEjemplo['tipo']): string {
  const config: Record<string, { cls: string; label: string }> = {
    saldo_inicial: { cls: 'bg-secondary', label: 'Saldo inicial' },
    entrada: {
      cls: 'bg-success-subtle text-success border border-success-subtle',
      label: 'Entrada',
    },
    salida: { cls: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Salida' },
    ajuste: { cls: 'bg-warning-subtle text-warning border border-warning-subtle', label: 'Ajuste' },
    transferencia: {
      cls: 'bg-primary-subtle text-primary border border-primary-subtle',
      label: 'Transferencia',
    },
    devolucion: { cls: 'bg-info-subtle text-info border border-info-subtle', label: 'Devolución' },
  };
  const { cls, label } = config[tipo] ?? { cls: 'bg-secondary', label: tipo };
  return `<span class="badge rounded-pill ${cls}">${label}</span>`;
}

/** Formatea una fecha ISO a formato legible en español */
function formatFechaKardex(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Formatea un monto en pesos colombianos (COP) */
function formatPrecioKardex(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);
}

/** Genera las filas HTML de la tabla del kardex */
function buildKardexRowsHtml(entries: KardexEntryEjemplo[]): string {
  if (entries.length === 0) {
    return `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">Sin movimientos registrados para este producto</td>
      </tr>
    `;
  }

  return entries
    .map(
      (entry) => `
      <tr>
        <td class="text-muted small">${formatFechaKardex(entry.fecha)}</td>
        <td>${tipoKardexBadge(entry.tipo)}</td>
        <td class="text-muted small">
          ${entry.movimientoNumero ? `<a href="#/movimientos/${entry.movimientoId ?? ''}" class="text-decoration-none">${entry.movimientoNumero}</a>` : '—'}
        </td>
        <td>${entry.almacenNombre}</td>
        <td class="text-end ${entry.cantidadEntrada > 0 ? 'text-success fw-semibold' : 'text-muted'}">
          ${entry.cantidadEntrada > 0 ? `+${String(entry.cantidadEntrada)}` : '—'}
        </td>
        <td class="text-end ${entry.cantidadSalida > 0 ? 'text-danger fw-semibold' : 'text-muted'}">
          ${entry.cantidadSalida > 0 ? `-${String(entry.cantidadSalida)}` : '—'}
        </td>
        <td class="text-end fw-semibold">${String(entry.saldoActual)}</td>
        <td class="text-end text-muted small">${formatPrecioKardex(entry.costoMovimiento)}</td>
      </tr>`
    )
    .join('');
}

/** Genera el bloque de selector de producto del kardex */
function buildProductSelectorHtml(selectedId: string | null): string {
  return `
    <div class="d-flex flex-wrap align-items-end gap-3 mb-4">
      <div>
        <label for="kardex-producto" class="form-label fw-semibold">
          Producto
        </label>
        <select id="kardex-producto" class="form-select" style="min-width:300px;">
          <option value="">— Seleccioná un producto para ver su kardex —</option>
          ${productosDisponibles
            .map(
              (p) =>
                `<option value="${p.id}" ${selectedId === p.id ? 'selected' : ''}>
              [${p.codigo}] ${p.nombre}
            </option>`
            )
            .join('')}
        </select>
      </div>
      <button class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-funnel me-1" aria-hidden="true"></i>
        Filtros
      </button>
    </div>
  `;
}

const meta = {
  title: 'Mockups/Kardex/Kardex',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        // Sin productoId — retorna lista vacía (requerido según handler real)
        http.get('/api/kardex', ({ request }) => {
          const url = new URL(request.url);
          const productoId = url.searchParams.get('productoId') ?? '';
          const page = Number(url.searchParams.get('page') ?? '1');

          if (!productoId) {
            return HttpResponse.json({
              data: [],
              total: 0,
              page,
              pageSize: 20,
              totalPages: 0,
            });
          }

          const data = productoId === 'prod-001' ? kardexProd001 : [];
          return HttpResponse.json({
            data,
            total: data.length,
            page,
            pageSize: 20,
            totalPages: data.length > 0 ? 1 : 0,
          });
        }),
        http.get('/api/productos', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          return HttpResponse.json({
            data: productosDisponibles.map((p) => ({
              ...p,
              categoriaId: 'cat-001',
              categoriaNombre: 'Periféricos',
              unidadMedida: 'unidad',
              precioUnitario: 28500,
              stockMinimo: 5,
              status: 'active',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              createdBy: 'admin@ngr.com',
              updatedBy: 'admin@ngr.com',
            })),
            total: productosDisponibles.length,
            page,
            pageSize: 100,
            totalPages: 1,
          });
        }),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story — estado inicial: selector visible, sin tabla, texto placeholder */
export const KardexSinProducto: Story = {
  name: 'Kardex — sin producto seleccionado',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Kardex</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Kardex de inventario</h1>
        </div>

        ${buildProductSelectorHtml(null)}

        <!-- Placeholder cuando no hay producto seleccionado -->
        <div class="card border-0 shadow-sm">
          <div class="card-body p-5 text-center">
            <i class="bi bi-journal-text text-muted fs-1 mb-3 d-block" aria-hidden="true"></i>
            <h5 class="text-muted">Seleccioná un producto</h5>
            <p class="text-muted mb-0">
              Elegí un producto del selector para ver su historial de movimientos de inventario.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — producto prod-001 pre-seleccionado: tabla con 10 entradas de kardex */
export const KardexConProducto: Story = {
  name: 'Kardex — con producto seleccionado (prod-001)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/kardex', ({ request }) => {
          const url = new URL(request.url);
          const productoId = url.searchParams.get('productoId') ?? '';
          const page = Number(url.searchParams.get('page') ?? '1');
          const data = productoId === 'prod-001' ? kardexProd001 : [];
          return HttpResponse.json({
            data,
            total: data.length,
            page,
            pageSize: 20,
            totalPages: data.length > 0 ? 1 : 0,
          });
        }),
        http.get('/api/productos', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          return HttpResponse.json({
            data: productosDisponibles.map((p) => ({
              ...p,
              categoriaId: 'cat-001',
              categoriaNombre: 'Periféricos',
              unidadMedida: 'unidad',
              precioUnitario: 28500,
              stockMinimo: 5,
              status: 'active',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              createdBy: 'admin@ngr.com',
              updatedBy: 'admin@ngr.com',
            })),
            total: productosDisponibles.length,
            page,
            pageSize: 100,
            totalPages: 1,
          });
        }),
      ],
    },
  },
  render: () => {
    const producto = productoProd001;
    const saldoActual = kardexProd001[kardexProd001.length - 1]?.saldoActual ?? 0;

    return `
      <div class="bg-body-secondary min-vh-100">
        <div class="bg-body border-bottom px-4 py-3">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Inicio</a></li>
              <li class="breadcrumb-item active">Kardex</li>
            </ol>
          </nav>
        </div>
        <div class="container-fluid p-4">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <h1 class="h3 mb-0">Kardex de inventario</h1>
          </div>

          ${buildProductSelectorHtml(producto.id)}

          <!-- Resumen del producto seleccionado -->
          <div class="alert alert-info d-flex align-items-center gap-3 mb-4" role="status">
            <i class="bi bi-box-seam fs-4" aria-hidden="true"></i>
            <div>
              <strong>[${producto.codigo}] ${producto.nombre}</strong>
              <span class="ms-3 text-muted">Saldo actual:</span>
              <strong class="ms-1">${String(saldoActual)} unidades</strong>
            </div>
          </div>

          <!-- Tabla del kardex -->
          <div class="card border-0 shadow-sm">
            <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
              <span>
                <i class="bi bi-table me-2" aria-hidden="true"></i>
                Historial de movimientos
              </span>
              <span class="text-muted small fw-normal">${String(kardexProd001.length)} registros</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style="width:110px;">Fecha</th>
                      <th style="width:140px;">Tipo</th>
                      <th style="width:160px;">Movimiento</th>
                      <th>Almacén</th>
                      <th style="width:90px;" class="text-end">Entrada</th>
                      <th style="width:90px;" class="text-end">Salida</th>
                      <th style="width:90px;" class="text-end">Saldo</th>
                      <th style="width:130px;" class="text-end">Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${buildKardexRowsHtml(kardexProd001)}
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="6" class="text-end fw-semibold">Saldo actual</td>
                      <td class="text-end fw-bold">${String(saldoActual)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
