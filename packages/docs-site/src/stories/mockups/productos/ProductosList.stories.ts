import type { PaginatedResponse } from '@ngr-inventory/api-contracts';
import { render as renderPageHeader } from '@ngr-inventory/ui-core/components/page-header';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';
import {
  render as renderDataTable,
  init as initDataTable,
} from '@ngr-inventory/ui-patterns/patterns/data-table';
import { render as renderStatusBadge } from '@ngr-inventory/ui-patterns/patterns/status-badge';
import {
  render as renderToolbar,
  init as initToolbar,
} from '@ngr-inventory/ui-patterns/patterns/table-toolbar';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Mockups/Productos/Lista de productos',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/productos', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          const productos = Array.from({ length: 8 }, (_, i) => ({
            id: String(i + 1),
            codigo: `PROD-00${String(i + 1)}`,
            nombre: [
              'Teclado Mecánico TKL',
              'Monitor 27" IPS',
              'Silla Ergonómica',
              'Mouse Inalámbrico',
              'Cable HDMI 2m',
              'Hub USB-C',
              'Auriculares BT',
              'Cámara Web FHD',
            ][i],
            categoriaId: '1',
            categoriaNombre: 'Periféricos',
            unidadMedida: 'unidad',
            precioUnitario: [8500, 45000, 32000, 4200, 850, 3600, 7800, 5500][i],
            stockMinimo: 5,
            status: i % 5 === 4 ? 'inactive' : 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          }));
          return HttpResponse.json({
            data: productos,
            total: 48,
            page,
            pageSize: 8,
            totalPages: 6,
          });
        }),
        http.delete('/api/productos/:id', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Columnas de la tabla de productos
const columnas: ColumnDef<Record<string, unknown>>[] = [
  { key: 'codigo', header: 'Código', width: '140px' },
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'categoriaNombre', header: 'Categoría', sortable: true },
  { key: 'unidadMedida', header: 'Unidad', width: '80px' },
  {
    key: 'status',
    header: 'Estado',
    width: '130px',
    render: (val) => renderStatusBadge({ status: String(val) }),
  },
];

export const Predeterminado: Story = {
  render: () => {
    const toolbarId = 'mockup-toolbar-productos';
    const tableId = 'mockup-table-productos';

    setTimeout(async () => {
      const toolbar = document.getElementById(toolbarId);
      const table = document.getElementById(tableId);
      if (toolbar) initToolbar(toolbar);
      if (!table) return;

      const response = await fetch('/api/productos?page=1&pageSize=8');
      const result = (await response.json()) as PaginatedResponse<Record<string, unknown>>;

      initDataTable(table, { columns: columnas, rows: result.data });
    }, 0);

    const pageHeader = renderPageHeader({
      title: 'Productos',
      breadcrumb:
        '<ol class="breadcrumb mb-0 small"><li class="breadcrumb-item"><a href="#">Inicio</a></li><li class="breadcrumb-item"><a href="#">Catálogo</a></li><li class="breadcrumb-item active">Productos</li></ol>',
    });

    const toolbar = renderToolbar({
      searchPlaceholder: 'Buscar productos...',
    });

    return `
      <div class="bg-body-secondary min-vh-100">
        ${pageHeader}
        <div class="container-fluid p-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div id="${toolbarId}" class="p-3 border-bottom">
                ${toolbar}
              </div>
              <div id="${tableId}">
                ${renderDataTable({ columns: columnas, rows: [], loading: true })}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

export const SinDatos: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/productos', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
        ),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100 p-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-5 text-center">
          <i class="bi bi-box-seam text-muted fs-1 mb-3 d-block"></i>
          <h5>Sin productos registrados</h5>
          <p class="text-muted">Aún no hay productos en el catálogo. Creá el primero.</p>
          <button class="btn btn-primary">Nuevo producto</button>
        </div>
      </div>
    </div>
  `,
};
