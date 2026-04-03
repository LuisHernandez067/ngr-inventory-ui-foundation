import type { PaginatedResponse } from '@ngr-inventory/api-contracts';
import { render as renderButton } from '@ngr-inventory/ui-core/components/button';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';
import {
  render as renderDataTable,
  init as initDataTable,
} from '@ngr-inventory/ui-patterns/patterns/data-table';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/table-toolbar';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

// Story del patrón TableToolbar — barra de herramientas compuesta
const meta: Meta = {
  title: 'UI Patterns/TableToolbar',
  parameters: {
    docs: {
      description: {
        component:
          'Barra de herramientas que compone SearchBar y FilterChips en un flex row responsivo. ' +
          'Los eventos ngr:search y ngr:filter-remove burbujean naturalmente.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con búsqueda solamente
export const SoloBusqueda: Story = {
  name: 'Solo búsqueda',
  render: () => {
    const rootId = 'story-toolbar-search';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({ searchPlaceholder: 'Buscar producto...' })}
        </div>
      </div>
    `;
  },
};

// Historia con búsqueda y filtros activos
export const BusquedaYFiltros: Story = {
  name: 'Búsqueda + filtros activos',
  render: () => {
    const rootId = 'story-toolbar-filters';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({
            searchPlaceholder: 'Buscar...',
            filters: [
              { key: 'categoria', label: 'Categoría', value: 'Electrónica' },
              { key: 'estado', label: 'Estado', value: 'Activo' },
            ],
          })}
        </div>
      </div>
    `;
  },
};

// Historia completa con búsqueda, filtros y acciones
export const Completo: Story = {
  name: 'Completo — búsqueda + filtros + acciones',
  render: () => {
    const rootId = 'story-toolbar-full';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    const actions =
      renderButton({ variant: 'primary', label: 'Nuevo producto', icon: 'plus-lg' }) +
      renderButton({ variant: 'ghost', label: 'Exportar', icon: 'download', extraClasses: 'ms-1' });

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({
            searchPlaceholder: 'Buscar en inventario...',
            filters: [
              { key: 'proveedor', label: 'Proveedor', value: 'Samsung' },
              { key: 'deposito', label: 'Depósito', value: 'A' },
            ],
            actions,
          })}
        </div>
      </div>
    `;
  },
};

// Columnas para las historias MSW
const columnasApi: ColumnDef<Record<string, unknown>>[] = [
  { key: 'codigo', header: 'Código', width: '140px' },
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'categoriaNombre', header: 'Categoría', sortable: true },
  { key: 'unidadMedida', header: 'Unidad', width: '80px' },
];

// Historia combinada: TableToolbar + DataTable en estado de carga — handler que nunca resuelve
export const Cargando: Story = {
  name: 'Cargando (MSW)',
  parameters: {
    msw: {
      handlers: [http.get('/api/productos', () => new Promise(() => undefined))],
    },
  },
  render: () => {
    const toolbarId = 'story-toolbar-cargando';
    const tableId = 'story-table-cargando';

    setTimeout(() => {
      const toolbar = document.getElementById(toolbarId);
      if (toolbar) init(toolbar);
      // Disparar fetch — el handler nunca resuelve, la tabla queda en carga
      fetch('/api/productos').catch(() => undefined);
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          Barra de búsqueda funcional, tabla bloqueada mientras carga la API (handler que nunca resuelve).
        </p>
        <div id="${toolbarId}">
          ${render({ searchPlaceholder: 'Buscar productos...' })}
        </div>
        <div id="${tableId}" class="mt-2">
          ${renderDataTable({ columns: columnasApi, rows: [], loading: true })}
        </div>
      </div>
    `;
  },
};

// Historia combinada: TableToolbar + DataTable sin resultados — API devuelve lista vacía
export const SinDatos: Story = {
  name: 'Sin datos (MSW)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/productos', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
        ),
      ],
    },
  },
  render: () => {
    const toolbarId = 'story-toolbar-sin-datos';
    const tableId = 'story-table-sin-datos';

    setTimeout(async () => {
      const toolbar = document.getElementById(toolbarId);
      const table = document.getElementById(tableId);
      if (toolbar) init(toolbar);
      if (!table) return;

      table.innerHTML = renderDataTable({ columns: columnasApi, rows: [], loading: true });

      const response = await fetch('/api/productos');
      const result = (await response.json()) as PaginatedResponse<Record<string, unknown>>;

      initDataTable(table, {
        columns: columnasApi,
        rows: result.data,
        emptyIcon: 'search',
        emptyTitle: 'Sin resultados',
        emptyDescription: 'No se encontraron productos con los filtros aplicados.',
      });
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          La API devuelve una lista vacía — la tabla muestra el estado vacío.
        </p>
        <div id="${toolbarId}">
          ${render({ searchPlaceholder: 'Buscar productos...' })}
        </div>
        <div id="${tableId}" class="mt-2">
          ${renderDataTable({ columns: columnasApi, rows: [], loading: true })}
        </div>
      </div>
    `;
  },
};

// Historia combinada: TableToolbar + DataTable con error — API devuelve 500
export const ConError: Story = {
  name: 'Con error (MSW)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/productos', () =>
          HttpResponse.json(
            { type: 'about:blank', title: 'Error del servidor', status: 500 },
            { status: 500 }
          )
        ),
      ],
    },
  },
  render: () => {
    const toolbarId = 'story-toolbar-con-error';
    const tableId = 'story-table-con-error';

    setTimeout(async () => {
      const toolbar = document.getElementById(toolbarId);
      const table = document.getElementById(tableId);
      if (toolbar) init(toolbar);
      if (!table) return;

      table.innerHTML = renderDataTable({ columns: columnasApi, rows: [], loading: true });

      const response = await fetch('/api/productos');
      if (!response.ok) {
        table.innerHTML = renderDataTable({
          columns: columnasApi,
          rows: [],
          emptyIcon: 'exclamation-triangle',
          emptyTitle: 'Error al cargar',
          emptyDescription: `Error ${response.status.toString()}: No se pudo obtener la lista de productos.`,
        });
      }
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          La API devuelve error 500 — la tabla muestra el estado de error.
        </p>
        <div id="${toolbarId}">
          ${render({ searchPlaceholder: 'Buscar productos...' })}
        </div>
        <div id="${tableId}" class="mt-2">
          ${renderDataTable({ columns: columnasApi, rows: [], loading: true })}
        </div>
      </div>
    `;
  },
};

// Historia interactiva con eventos
export const Interactivo: Story = {
  name: 'Interactivo — todos los eventos',
  render: () => {
    const rootId = 'story-toolbar-interactive';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);

      root.addEventListener('ngr:search', (event: Event) => {
        const ce = event as CustomEvent<{ query: string }>;
        const output = document.getElementById('story-toolbar-output');
        if (output) output.textContent = `ngr:search → query: "${ce.detail.query}"`;
      });

      root.addEventListener('ngr:filter-remove', (event: Event) => {
        const ce = event as CustomEvent<{ key: string; value: string }>;
        const output = document.getElementById('story-toolbar-output');
        if (output)
          output.textContent = `ngr:filter-remove → key: "${ce.detail.key}", value: "${ce.detail.value}"`;
      });
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({
            searchPlaceholder: 'Buscar producto...',
            filters: [
              { key: 'estado', label: 'Estado', value: 'Activo' },
              { key: 'marca', label: 'Marca', value: 'HP' },
            ],
          })}
        </div>
        <p id="story-toolbar-output" class="mt-2 text-muted fst-italic">
          Interactuá con la barra para ver los eventos...
        </p>
      </div>
    `;
  },
};
