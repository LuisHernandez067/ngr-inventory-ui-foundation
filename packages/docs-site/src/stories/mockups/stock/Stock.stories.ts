import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para un ítem de stock por ubicación */
interface StockItemEjemplo {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  almacenId: string;
  almacenNombre: string;
  ubicacionId?: string;
  ubicacionNombre?: string;
  cantidadDisponible: number;
  cantidadReservada: number;
  cantidadTotal: number;
  unidadMedida?: string;
}

/** Tipo para un ítem de stock consolidado */
interface StockConsolidadoEjemplo {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidadTotal: number;
  stockMinimo: number;
  stockMaximo?: number;
  bajoMinimo: boolean;
}

// Almacenes para el select de filtros
const almacenesDisponibles = [
  { id: 'alm-001', nombre: 'Depósito Central' },
  { id: 'alm-002', nombre: 'Depósito Sur' },
];

// Datos de ejemplo: stock por ubicación
const stockItemsEjemplo: StockItemEjemplo[] = [
  {
    productoId: 'prod-001',
    productoCodigo: 'TECLADO-USB',
    productoNombre: 'Teclado USB',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    ubicacionId: 'ubi-001',
    ubicacionNombre: 'Rack 1 Estante 1',
    cantidadDisponible: 15,
    cantidadReservada: 2,
    cantidadTotal: 17,
    unidadMedida: 'unidad',
  },
  {
    productoId: 'prod-002',
    productoCodigo: 'MOUSE-OPT',
    productoNombre: 'Mouse Óptico',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    ubicacionId: 'ubi-002',
    ubicacionNombre: 'Rack 1 Estante 2',
    cantidadDisponible: 0,
    cantidadReservada: 0,
    cantidadTotal: 0,
    unidadMedida: 'unidad',
  },
  {
    productoId: 'prod-003',
    productoCodigo: 'MONITOR-24',
    productoNombre: 'Monitor 24"',
    almacenId: 'alm-002',
    almacenNombre: 'Depósito Sur',
    ubicacionId: 'ubi-004',
    ubicacionNombre: 'Zona Fría 1',
    cantidadDisponible: 5,
    cantidadReservada: 1,
    cantidadTotal: 6,
    unidadMedida: 'unidad',
  },
  {
    productoId: 'prod-004',
    productoCodigo: 'CABLE-HDMI',
    productoNombre: 'Cable HDMI 2m',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    cantidadDisponible: 30,
    cantidadReservada: 0,
    cantidadTotal: 30,
    unidadMedida: 'metro',
  },
];

// Datos de ejemplo: stock consolidado
const stockConsolidadoEjemplo: StockConsolidadoEjemplo[] = [
  {
    productoId: 'prod-001',
    productoCodigo: 'TECLADO-USB',
    productoNombre: 'Teclado USB',
    cantidadTotal: 17,
    stockMinimo: 10,
    stockMaximo: 50,
    bajoMinimo: false,
  },
  {
    productoId: 'prod-002',
    productoCodigo: 'MOUSE-OPT',
    productoNombre: 'Mouse Óptico',
    cantidadTotal: 0,
    stockMinimo: 5,
    stockMaximo: 30,
    bajoMinimo: true,
  },
  {
    productoId: 'prod-003',
    productoCodigo: 'MONITOR-24',
    productoNombre: 'Monitor 24"',
    cantidadTotal: 6,
    stockMinimo: 8,
    stockMaximo: 20,
    bajoMinimo: true,
  },
  {
    productoId: 'prod-004',
    productoCodigo: 'CABLE-HDMI',
    productoNombre: 'Cable HDMI 2m',
    cantidadTotal: 30,
    stockMinimo: 10,
    bajoMinimo: false,
  },
];

/** Devuelve un badge HTML según la cantidad disponible (2 niveles) */
function availabilityBadge(cantidadDisponible: number): string {
  if (cantidadDisponible === 0) {
    return '<span class="badge bg-danger">Sin stock</span>';
  }
  return '<span class="badge bg-success">Disponible</span>';
}

/** Devuelve un badge HTML con tres niveles para stock consolidado */
function consolidadoBadge(item: StockConsolidadoEjemplo): string {
  if (item.cantidadTotal === 0) {
    return '<span class="badge bg-danger">Sin stock</span>';
  }
  if (item.bajoMinimo) {
    return '<span class="badge bg-warning text-dark">Bajo mínimo</span>';
  }
  return '<span class="badge bg-success">Disponible</span>';
}

/** Genera las filas HTML para la tabla de stock por ubicación */
function buildStockRows(items: StockItemEjemplo[]): string {
  if (items.length === 0) {
    return `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">Sin registros de stock</td>
      </tr>
    `;
  }
  return items
    .map(
      (s) => `<tr data-id="${s.productoId}">
        <td>${s.productoNombre}</td>
        <td>${s.ubicacionNombre ?? '—'}</td>
        <td>${s.almacenNombre}</td>
        <td class="text-end">${String(s.cantidadDisponible)}</td>
        <td>${s.unidadMedida ?? '—'}</td>
        <td>${availabilityBadge(s.cantidadDisponible)}</td>
      </tr>`
    )
    .join('');
}

/** Genera las filas HTML para la tabla de stock consolidado */
function buildConsolidadoRows(items: StockConsolidadoEjemplo[]): string {
  if (items.length === 0) {
    return `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">Sin registros de stock consolidado</td>
      </tr>
    `;
  }
  return items
    .map(
      (s) => `<tr data-producto-id="${s.productoId}">
        <td>${s.productoCodigo}</td>
        <td>${s.productoNombre}</td>
        <td class="text-end">${String(s.cantidadTotal)}</td>
        <td>${consolidadoBadge(s)}</td>
        <td>
          <a href="#/stock?productoId=${encodeURIComponent(s.productoId)}"
             class="btn btn-sm btn-outline-secondary ver-detalle-btn">
            Ver detalle
          </a>
        </td>
      </tr>`
    )
    .join('');
}

const meta = {
  title: 'Mockups/Stock/Stock',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/stock', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          const almacenId = url.searchParams.get('almacenId');
          const data = almacenId
            ? stockItemsEjemplo.filter((s) => s.almacenId === almacenId)
            : stockItemsEjemplo;
          return HttpResponse.json({
            data,
            total: data.length,
            page,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/stock/consolidado', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          return HttpResponse.json({
            data: stockConsolidadoEjemplo,
            total: stockConsolidadoEjemplo.length,
            page,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/almacenes', () =>
          HttpResponse.json({
            data: almacenesDisponibles.map((a) => ({
              ...a,
              codigo: a.id.toUpperCase(),
              status: 'active',
              ubicacionCount: 2,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'admin@ngr.com',
              updatedBy: 'admin@ngr.com',
            })),
            total: almacenesDisponibles.length,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })
        ),
        http.get('/api/ubicaciones', () =>
          HttpResponse.json({
            data: [],
            total: 0,
            page: 1,
            pageSize: 100,
            totalPages: 0,
          })
        ),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story principal — lista de stock por ubicación con filtros */
export const StockList: Story = {
  name: 'Lista de stock (por ubicación)',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Stock</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Stock</h1>
          <a href="#/stock/consolidado" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-table" aria-hidden="true"></i>
            Ver consolidado
          </a>
        </div>

        <!-- Barra de filtros -->
        <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <div>
            <label for="almacen-filter" class="form-label small mb-1">Almacén</label>
            <select id="almacen-filter" class="form-select form-select-sm" style="min-width:200px;">
              <option value="">Todos los almacenes</option>
              ${almacenesDisponibles
                .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
                .join('')}
            </select>
          </div>
          <div>
            <label for="ubicacion-filter" class="form-label small mb-1">Ubicación</label>
            <select id="ubicacion-filter" class="form-select form-select-sm" style="min-width:200px;">
              <option value="">Todas las ubicaciones</option>
            </select>
          </div>
          <div>
            <label for="estado-filter" class="form-label small mb-1">Estado</label>
            <select id="estado-filter" class="form-select form-select-sm" style="min-width:160px;">
              <option value="">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="sinstock">Sin stock</option>
            </select>
          </div>
          <div class="d-flex align-items-center gap-2 pb-1">
            <input type="checkbox" id="bajo-minimo-check" class="form-check-input">
            <label for="bajo-minimo-check" class="form-check-label small">Bajo mínimo</label>
          </div>
        </div>

        <!-- Tabla de stock -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Ubicación</th>
                <th>Almacén</th>
                <th style="width:100px;" class="text-end">Disponible</th>
                <th style="width:100px;">Unidad</th>
                <th style="width:120px;">Estado</th>
              </tr>
            </thead>
            <tbody id="stock-tbody">
              ${buildStockRows(stockItemsEjemplo)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};

/** Story — vista consolidada de stock totales por producto con badges de 3 niveles */
export const StockConsolidado: Story = {
  name: 'Stock Consolidado',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Stock</a></li>
            <li class="breadcrumb-item active">Consolidado</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Stock Consolidado</h1>
          <a href="#/stock" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left" aria-hidden="true"></i>
            Volver
          </a>
        </div>

        <!-- Tabla de stock consolidado -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width:130px;">Código</th>
                <th>Producto</th>
                <th style="width:110px;" class="text-end">Total</th>
                <th style="width:130px;">Estado</th>
                <th style="width:110px;"></th>
              </tr>
            </thead>
            <tbody id="consolidado-tbody">
              ${buildConsolidadoRows(stockConsolidadoEjemplo)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};
