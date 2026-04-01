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

// Historia con texto de búsqueda prellenado
export const ConTexto: Story = {
  name: 'Con texto ingresado',
  render: () => `
    <div class="p-3" style="max-width:400px">
      <p class="text-muted fst-italic mb-2">Campo con texto de búsqueda ya ingresado.</p>
      ${render({ placeholder: 'Buscar producto...', initialValue: 'teclado mecánico' })}
    </div>
  `,
};

// Historia que simula limpieza del texto de búsqueda
export const Limpiando: Story = {
  name: 'Limpiando búsqueda',
  render: () => {
    const rootId = 'story-search-clearing';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);

      // Limpiar el campo automáticamente después de 1.5 segundos
      setTimeout(() => {
        const input = root.querySelector('input') as HTMLInputElement | null;
        if (input) {
          input.value = '';
          input.dispatchEvent(new Event('input'));
        }
        const output = document.getElementById('story-search-clear-output');
        if (output) output.textContent = 'Búsqueda limpiada — mostrando todos los resultados.';
      }, 1500);
    }, 0);

    return `
      <div class="p-3" style="max-width:400px">
        <p class="text-muted fst-italic mb-2">El campo se limpia automáticamente en 1.5 segundos.</p>
        <div id="${rootId}">
          ${render({ placeholder: 'Buscar producto...', initialValue: 'monitor dell' })}
        </div>
        <p id="story-search-clear-output" class="mt-2 text-muted small fst-italic">Esperando limpieza...</p>
      </div>
    `;
  },
};

// Historia que simula búsqueda sin resultados — hint visual después de la búsqueda
export const SinResultados: Story = {
  name: 'Sin resultados',
  render: () => `
    <div class="p-3" style="max-width:400px">
      <p class="text-muted fst-italic mb-2">Búsqueda que no devuelve coincidencias.</p>
      ${render({ placeholder: 'Buscar producto...', initialValue: 'xyzproducto123' })}
      <div class="mt-3 text-center py-3 border rounded bg-body-secondary">
        <i class="bi bi-search fs-4 text-muted d-block mb-2"></i>
        <p class="text-muted small mb-0">Sin resultados para <strong>"xyzproducto123"</strong>. Intentá con otro término.</p>
      </div>
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
