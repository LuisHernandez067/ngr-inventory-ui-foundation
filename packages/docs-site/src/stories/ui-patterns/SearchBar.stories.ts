import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/search-bar';

// Story del patrón SearchBar — barra de búsqueda con debounce
const meta: Meta = {
  title: 'UI Patterns/SearchBar',
  parameters: {
    docs: {
      description: {
        component:
          'Barra de búsqueda con debounce de 300ms. ' +
          'Emite ngr:search con { query } al escribir o limpiar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia básica de la barra de búsqueda
export const Default: Story = {
  name: 'Por defecto',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({})}
    </div>
  `,
};

// Historia con placeholder personalizado
export const ConPlaceholder: Story = {
  name: 'Con placeholder personalizado',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({ placeholder: 'Buscar producto por nombre o código...' })}
    </div>
  `,
};

// Historia con valor inicial
export const ConValorInicial: Story = {
  name: 'Con valor inicial',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({ placeholder: 'Buscar...', initialValue: 'Laptop HP' })}
    </div>
  `,
};

// Historia interactiva con debounce y evento ngr:search
export const Interactivo: Story = {
  name: 'Interactivo — debounce y ngr:search',
  render: () => {
    const rootId = 'story-search-bar';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
      root.addEventListener('ngr:search', (event: Event) => {
        const ce = event as CustomEvent<{ query: string }>;
        const output = document.getElementById('story-search-output');
        if (output) output.textContent = `Última búsqueda: "${ce.detail.query}"`;
        console.log('ngr:search recibido:', ce.detail);
      });
    }, 0);

    return `
      <div class="p-3" style="max-width:400px">
        <div id="${rootId}">
          ${render({ placeholder: 'Buscar en inventario...' })}
        </div>
        <p id="story-search-output" class="mt-2 text-muted fst-italic">
          Escribí para ver el evento con debounce de 300ms...
        </p>
      </div>
    `;
  },
};
