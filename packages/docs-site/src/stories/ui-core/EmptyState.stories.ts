import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-core/components/empty-state';

// Story del componente EmptyState — pantalla de estado vacío
const meta: Meta = {
  title: 'UI Core/EmptyState',
  parameters: {
    docs: {
      description: {
        component:
          'Pantalla de estado vacío centrada con ícono Bootstrap Icons, título, ' +
          'descripción opcional y botón CTA opcional. El CTA emite ngr:action al ser presionado.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia sin CTA
export const WithoutCta: Story = {
  name: 'Sin CTA',
  render: () => `
    <div class="p-3">
      ${render({
        icon: 'inbox',
        title: 'No hay datos disponibles',
        description: 'Todavía no se han registrado elementos en este módulo.',
      })}
    </div>
  `,
};

// Historia con CTA
export const WithCta: Story = {
  name: 'Con CTA',
  render: () => {
    const html = render({
      icon: 'box-seam',
      title: 'No hay productos',
      description: 'Comenzá agregando tu primer producto al inventario.',
      ctaLabel: 'Agregar Producto',
      ctaAction: 'add-product',
      ctaVariant: 'primary',
    });
    const rootId = 'story-empty-state-cta';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (root) {
        init(root);
        root.addEventListener('ngr:action', (event: Event) => {
          const customEvent = event as CustomEvent;
          console.log('ngr:action recibido:', customEvent.detail);
          alert(`Acción: ${customEvent.detail.action}`);
        });
      }
    }, 0);

    return `<div id="${rootId}" class="p-3">${html}</div>`;
  },
};

// Historia con variantes de ícono
export const IconVariants: Story = {
  name: 'Variantes de ícono',
  render: () => `
    <div class="row p-3">
      <div class="col-4">
        ${render({ icon: 'search', title: 'Sin resultados', description: 'No encontramos nada con ese criterio.' })}
      </div>
      <div class="col-4">
        ${render({ icon: 'exclamation-circle', title: 'Error al cargar', description: 'No se pudo obtener los datos.' })}
      </div>
      <div class="col-4">
        ${render({ icon: 'lock', title: 'Sin acceso', description: 'No tenés permisos para ver este módulo.' })}
      </div>
    </div>
  `,
};
