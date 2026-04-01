import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/pagination';

// Story del patrón Pagination — control de paginación con elipsis
const meta: Meta = {
  title: 'UI Patterns/Pagination',
  parameters: {
    docs: {
      description: {
        component:
          'Control de paginación accesible con elipsis automática. ' +
          'Emite ngr:page-change con { page } al navegar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con pocas páginas (sin elipsis)
export const PocasPaginas: Story = {
  name: 'Pocas páginas (sin elipsis)',
  render: () => `
    <div class="p-3">
      ${render({ currentPage: 2, totalPages: 5 })}
    </div>
  `,
};

// Historia con muchas páginas (con elipsis)
export const MuchasPaginas: Story = {
  name: 'Muchas páginas (con elipsis)',
  render: () => `
    <div class="p-3">
      ${render({ currentPage: 5, totalPages: 20 })}
    </div>
  `,
};

// Historia en la primera página
export const PrimeraPagina: Story = {
  name: 'Primera página (prev deshabilitado)',
  render: () => `
    <div class="p-3">
      ${render({ currentPage: 1, totalPages: 10 })}
    </div>
  `,
};

// Historia en la última página
export const UltimaPagina: Story = {
  name: 'Última página (next deshabilitado)',
  render: () => `
    <div class="p-3">
      ${render({ currentPage: 10, totalPages: 10 })}
    </div>
  `,
};

// Historia en página intermedia — con navegación activa en ambos extremos
export const PaginaIntermedia: Story = {
  name: 'Página intermedia',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-2">Página 5 de 12 — prev y next habilitados, elipsis a ambos lados.</p>
      ${render({ currentPage: 5, totalPages: 12 })}
    </div>
  `,
};

// Historia interactiva con evento ngr:page-change
export const Interactivo: Story = {
  name: 'Interactivo — emite ngr:page-change',
  render: () => {
    const rootId = 'story-pagination';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
      root.addEventListener('ngr:page-change', (event: Event) => {
        const ce = event as CustomEvent<{ page: number }>;
        const output = document.getElementById('story-page-output');
        if (output) output.textContent = `Página seleccionada: ${ce.detail.page}`;
        console.log('ngr:page-change recibido:', ce.detail);
      });
    }, 0);

    return `
      <div class="p-3">
        <div id="${rootId}">
          ${render({ currentPage: 3, totalPages: 15 })}
        </div>
        <p id="story-page-output" class="mt-2 text-muted fst-italic">
          Hacé clic en una página para ver el evento...
        </p>
      </div>
    `;
  },
};
