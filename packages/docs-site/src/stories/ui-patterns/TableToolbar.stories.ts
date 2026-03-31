import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/table-toolbar';
import { render as renderButton } from '@ngr-inventory/ui-core/components/button';

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
