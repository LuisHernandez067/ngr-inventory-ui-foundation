import type { Meta, StoryObj } from '@storybook/html';
import { render, initTooltips } from '@ngr-inventory/ui-core/components/tooltip';
import { render as renderButton } from '@ngr-inventory/ui-core/components/button';

// Story del componente Tooltip — wrapper de Bootstrap Tooltip JS
const meta: Meta = {
  title: 'UI Core/Tooltip',
  parameters: {
    docs: {
      description: {
        component:
          'Wrapper del Tooltip de Bootstrap 5. Usa data-bs-toggle="tooltip" para activar. ' +
          'initTooltips(root) inicializa todas las instancias dentro del contenedor.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con posiciones
export const Placements: Story = {
  name: 'Posiciones',
  render: () => {
    const html = `
      <div class="d-flex flex-wrap gap-3 justify-content-center p-5">
        ${render({ title: 'Tooltip arriba', placement: 'top', content: renderButton({ variant: 'secondary', label: 'Arriba' }) })}
        ${render({ title: 'Tooltip abajo', placement: 'bottom', content: renderButton({ variant: 'secondary', label: 'Abajo' }) })}
        ${render({ title: 'Tooltip izquierda', placement: 'left', content: renderButton({ variant: 'secondary', label: 'Izquierda' }) })}
        ${render({ title: 'Tooltip derecha', placement: 'right', content: renderButton({ variant: 'secondary', label: 'Derecha' }) })}
      </div>
    `;

    setTimeout(() => {
      const root = document.querySelector('.story-tooltips') as HTMLElement;
      if (root) initTooltips(root);
    }, 0);

    return `<div class="story-tooltips">${html}</div>`;
  },
};

// Historia con texto en el tooltip
export const WithText: Story = {
  name: 'Con texto informativo',
  render: () => {
    const html = `
      <div class="d-flex gap-3 align-items-center p-3">
        ${render({
          title: 'Eliminar este producto permanentemente',
          content: renderButton({ variant: 'danger', label: 'Eliminar', icon: 'trash' }),
        })}
        ${render({
          title: 'Descargar el reporte en formato Excel',
          content: renderButton({ variant: 'ghost', label: 'Exportar', icon: 'download' }),
        })}
      </div>
    `;

    setTimeout(() => {
      const root = document.querySelector('.story-tooltips-text') as HTMLElement;
      if (root) initTooltips(root);
    }, 0);

    return `<div class="story-tooltips-text">${html}</div>`;
  },
};
