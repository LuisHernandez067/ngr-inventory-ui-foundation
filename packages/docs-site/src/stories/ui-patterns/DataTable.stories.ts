import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/data-table';
import { render as renderStatusBadge } from '@ngr-inventory/ui-patterns/patterns/status-badge';
import {
  render as renderActionMenu,
  init as initActionMenu,
} from '@ngr-inventory/ui-patterns/patterns/action-menu';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';
import type { ActionMenuItem } from '@ngr-inventory/ui-patterns';
import type { Producto, PaginatedResponse } from '@ngr-inventory/api-contracts';

// Story del patrón DataTable — tabla de datos completa
const meta: Meta = {
  title: 'UI Patterns/DataTable',
  parameters: {
    docs: {
      description: {
        component:
          'Tabla de datos con ordenamiento por columnas, estado vacío, overlay de carga y soporte de clic en filas. ' +
          'Usa WeakMap para aislar estado de ordenamiento por instancia.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Datos de ejemplo del dominio NGR Inventory
interface Producto {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
  estado: string;
}

const productos: Producto[] = [
  {
    id: 1,
    sku: 'HP-840-G9',
    nombre: 'Laptop HP EliteBook 840',
    categoria: 'Computadoras',
    stock: 12,
    precio: 450000,
    estado: 'activo',
  },
  {
    id: 2,
    sku: 'DELL-27-P27',
    nombre: 'Monitor Dell P2722H',
    categoria: 'Monitores',
    stock: 5,
    precio: 180000,
    estado: 'activo',
  },
  {
    id: 3,
    sku: 'LG-MX-KB',
    nombre: 'Teclado Logitech MX Keys',
    categoria: 'Periféricos',
    stock: 0,
    precio: 45000,
    estado: 'inactivo',
  },
  {
    id: 4,
    sku: 'HUB-USB-7P',
    nombre: 'Hub USB 7 puertos',
    categoria: 'Accesorios',
    stock: 3,
    precio: 15000,
    estado: 'reservado',
  },
  {
    id: 5,
    sku: 'CAM-LOGI-C920',
    nombre: 'Webcam Logitech C920',
    categoria: 'Periféricos',
    stock: 8,
    precio: 35000,
    estado: 'pendiente',
  },
];

const columns: ColumnDef<Producto>[] = [
  { key: 'sku', header: 'SKU', width: '120px' },
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'categoria', header: 'Categoría', sortable: true },
  { key: 'stock', header: 'Stock', sortable: true, width: '80px' },
  {
    key: 'estado',
    header: 'Estado',
    width: '130px',
    render: (val) => renderStatusBadge({ status: String(val) }),
  },
];

// Columnas para la historia con datos de la API real
const columnasApi: ColumnDef<Producto>[] = [
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

// Historia básica con datos
export const ConDatos: Story = {
  name: 'Con datos',
  render: () => {
    const rootId = 'story-datatable-basic';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root, { columns, rows: productos });
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({ columns, rows: productos })}
        </div>
      </div>
    `;
  },
};

// Historia en estado de carga
export const EstadoCarga: Story = {
  name: 'Estado de carga',
  render: () => `
    <div class="p-3">
      ${render({ columns, rows: [], loading: true })}
    </div>
  `,
};

// Historia con estado vacío
export const EstadoVacio: Story = {
  name: 'Estado vacío',
  render: () => `
    <div class="p-3">
      ${render({
        columns,
        rows: [],
        emptyIcon: 'inbox',
        emptyTitle: 'Sin productos',
        emptyDescription: 'No se encontraron productos con los filtros aplicados.',
      })}
    </div>
  `,
};

// Historia con ordenamiento interactivo
export const OrdenamientoInteractivo: Story = {
  name: 'Ordenamiento interactivo',
  render: () => {
    const rootId = 'story-datatable-sort';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root, { columns, rows: productos });

      root.addEventListener('ngr:sort-change', (event: Event) => {
        const ce = event as CustomEvent<{ key: string; direction: string | null }>;
        const output = document.getElementById('story-sort-output');
        if (output) {
          output.textContent = `Orden: columna="${ce.detail.key}", dirección="${ce.detail.direction ?? 'ninguna'}"`;
        }
      });
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({ columns, rows: productos })}
        </div>
        <p id="story-sort-output" class="mt-2 text-muted fst-italic">
          Hacé clic en "Nombre", "Categoría" o "Stock" para ordenar...
        </p>
      </div>
    `;
  },
};

// Historia con clic en fila
export const ConClicEnFila: Story = {
  name: 'Con clic en fila',
  render: () => {
    const rootId = 'story-datatable-rowclick';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;

      const onRowClick = (row: Producto) => {
        const output = document.getElementById('story-rowclick-output');
        if (output) output.textContent = `Fila clicada: ${row.nombre} (SKU: ${row.sku})`;
        console.log('Row click:', row);
      };

      init(root, { columns, rows: productos, onRowClick });
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({ columns, rows: productos, onRowClick: () => {} })}
        </div>
        <p id="story-rowclick-output" class="mt-2 text-muted fst-italic">
          Hacé clic en una fila...
        </p>
      </div>
    `;
  },
};

// Historia con ActionMenu en columna de acciones
export const ConMenuDeAcciones: Story = {
  name: 'Con menú de acciones por fila',
  render: () => {
    const acciones: ActionMenuItem[] = [
      { id: 'editar', label: 'Editar', icon: 'pencil' },
      { id: 'ajustar-stock', label: 'Ajustar stock', icon: 'boxes' },
      { id: 'eliminar', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ];

    const columnsWithActions: ColumnDef<Producto>[] = [
      ...columns,
      {
        key: 'id',
        header: '',
        width: '50px',
        render: (val) =>
          renderActionMenu({ items: acciones, size: 'sm', id: `row-actions-${val}` }),
      },
    ];

    setTimeout(() => {
      document.querySelectorAll('.ngr-action-menu').forEach((el) => {
        initActionMenu(el as HTMLElement);
        el.addEventListener('ngr:action', (event: Event) => {
          const ce = event as CustomEvent<{ id: string }>;
          console.log('Acción en fila:', ce.detail);
        });
      });
    }, 0);

    return `
      <div class="p-3">
        ${render({ columns: columnsWithActions, rows: productos })}
      </div>
    `;
  },
};

// Historia con carga async desde MSW — demuestra integración real con la API mock
export const DesdeMSW: Story = {
  name: 'Desde API (MSW)',
  render: () => {
    const rootId = 'story-datatable-msw';

    setTimeout(async () => {
      const root = document.getElementById(rootId);
      if (!root) return;

      // Mostrar estado de carga mientras se obtienen los datos
      root.innerHTML = render({
        columns: columnasApi as ColumnDef<Record<string, unknown>>[],
        rows: [],
        loading: true,
      });

      try {
        const response = await fetch('/api/productos?page=1&pageSize=10');
        const result = (await response.json()) as PaginatedResponse<Producto>;

        init(root, {
          columns: columnasApi as ColumnDef<Record<string, unknown>>[],
          rows: result.data as Record<string, unknown>[],
        });
      } catch {
        root.innerHTML = render({
          columns: columnasApi as ColumnDef<Record<string, unknown>>[],
          rows: [],
          emptyIcon: 'exclamation-triangle',
          emptyTitle: 'Error al cargar datos',
          emptyDescription: 'No se pudo conectar con la API. Verificá que MSW está activo.',
        });
      }
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          Cargando productos desde <code>GET /api/productos</code> via MSW...
        </p>
        <div id="${rootId}">
          ${render({ columns: columnasApi as ColumnDef<Record<string, unknown>>[], rows: [], loading: true })}
        </div>
      </div>
    `;
  },
};

// Historia con error simulado via ?_scenario=error-500
export const ConErrorDeRed: Story = {
  name: 'Con error de red (MSW override)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/productos', () =>
          HttpResponse.json(
            {
              type: '/errors/server-error',
              title: 'Error interno del servidor',
              status: 500,
              detail: 'Ocurrió un error inesperado al cargar los productos.',
            },
            { status: 500 }
          )
        ),
      ],
    },
  },
  render: () => {
    const rootId = 'story-datatable-error';

    setTimeout(async () => {
      const root = document.getElementById(rootId);
      if (!root) return;

      root.innerHTML = render({
        columns: columnasApi as ColumnDef<Record<string, unknown>>[],
        rows: [],
        loading: true,
      });

      const response = await fetch('/api/productos');
      if (!response.ok) {
        root.innerHTML = render({
          columns: columnasApi as ColumnDef<Record<string, unknown>>[],
          rows: [],
          emptyIcon: 'exclamation-triangle',
          emptyTitle: 'Error al cargar productos',
          emptyDescription: `Error ${response.status.toString()}: El servidor no pudo procesar la solicitud.`,
        });
      }
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          Esta historia sobreescribe el handler para simular un error 500...
        </p>
        <div id="${rootId}">
          ${render({ columns: columnasApi as ColumnDef<Record<string, unknown>>[], rows: [], loading: true })}
        </div>
      </div>
    `;
  },
};
