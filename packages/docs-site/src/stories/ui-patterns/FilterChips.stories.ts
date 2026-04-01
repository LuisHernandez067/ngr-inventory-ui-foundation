import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/filter-chips';

// Story del patrón FilterChips — chips dismissibles para filtros activos
const meta: Meta = {
  title: 'UI Patterns/FilterChips',
  parameters: {
    docs: {
      description: {
        component:
          'Chips dismissibles para mostrar filtros activos. ' +
          'Emite el CustomEvent ngr:filter-remove con { key, value } al descartar un filtro.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con múltiples filtros activos
export const FiltrosActivos: Story = {
  name: 'Filtros activos',
  render: () => `
    <div class="p-3">
      ${render({
        filters: [
          { key: 'categoria', label: 'Categoría', value: 'Electrónica' },
          { key: 'estado', label: 'Estado', value: 'Activo' },
          { key: 'proveedor', label: 'Proveedor', value: 'Samsung' },
        ],
      })}
    </div>
  `,
};

// Historia con un solo filtro
export const UnFiltro: Story = {
  name: 'Un filtro activo',
  render: () => `
    <div class="p-3">
      ${render({
        filters: [{ key: 'estado', label: 'Estado', value: 'Pendiente' }],
      })}
    </div>
  `,
};

// Historia sin filtros (estado vacío)
export const SinFiltros: Story = {
  name: 'Sin filtros',
  render: () => `
    <div class="p-3">
      <p class="text-muted">Sin filtros activos (render vacío):</p>
      ${render({ filters: [] }) || '<em class="text-muted">—</em>'}
    </div>
  `,
};

// Historia con múltiples chips activos — alias semántico de FiltrosActivos
export const MultiplesActivos: Story = {
  name: 'Múltiples activos',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-2">Varios filtros activos simultáneamente.</p>
      ${render({
        filters: [
          { key: 'categoria', label: 'Categoría', value: 'Periféricos' },
          { key: 'estado', label: 'Estado', value: 'Activo' },
          { key: 'proveedor', label: 'Proveedor', value: 'Samsung' },
          { key: 'deposito', label: 'Depósito', value: 'Central' },
        ],
      })}
    </div>
  `,
};

// Historia que simula el estado tras eliminar todos los chips
export const TodosEliminados: Story = {
  name: 'Todos eliminados',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-2">Todos los filtros fueron eliminados — no se renderizan chips.</p>
      <div class="py-2">
        ${render({ filters: [] }) || '<span class="text-muted small fst-italic">Sin filtros activos.</span>'}
      </div>
    </div>
  `,
};

// Historia con un único chip activo
export const SoloUno: Story = {
  name: 'Solo uno activo',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-2">Un único filtro activo.</p>
      ${render({ filters: [{ key: 'estado', label: 'Estado', value: 'Pendiente' }] })}
    </div>
  `,
};

// Historia interactiva con evento
export const Interactivo: Story = {
  name: 'Interactivo — emite ngr:filter-remove',
  render: () => {
    const rootId = 'story-filter-chips';
    const html = render({
      filters: [
        { key: 'categoria', label: 'Categoría', value: 'Laptops' },
        { key: 'marca', label: 'Marca', value: 'HP' },
        { key: 'ubicacion', label: 'Ubicación', value: 'Depósito A' },
      ],
    });

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
      root.addEventListener('ngr:filter-remove', (event: Event) => {
        const ce = event as CustomEvent;
        console.log('ngr:filter-remove recibido:', ce.detail);
      });
    }, 0);

    return `<div id="${rootId}" class="p-3">${html}</div>`;
  },
};
