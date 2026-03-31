import type { Meta, StoryObj } from '@storybook/html';
import { render } from '@ngr-inventory/ui-core/components/badge';

// Story del componente Badge — etiqueta de estado
const meta: Meta = {
  title: 'UI Core/Badge',
  parameters: {
    docs: {
      description: {
        component:
          'Etiqueta de estado y categorización. Soporta variantes de color Bootstrap, ' +
          'forma de píldora y modo dot para indicadores de estado.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con variantes de color
export const Variants: Story = {
  name: 'Variantes de color',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ variant: 'primary', text: 'Primario' })}
      ${render({ variant: 'secondary', text: 'Secundario' })}
      ${render({ variant: 'success', text: 'Éxito' })}
      ${render({ variant: 'danger', text: 'Error' })}
      ${render({ variant: 'warning', text: 'Advertencia' })}
      ${render({ variant: 'info', text: 'Información' })}
      ${render({ variant: 'light', text: 'Claro' })}
      ${render({ variant: 'dark', text: 'Oscuro' })}
    </div>
  `,
};

// Historia como píldora
export const Pills: Story = {
  name: 'Píldoras',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ variant: 'primary', text: 'Primario', pill: true })}
      ${render({ variant: 'success', text: 'Activo', pill: true })}
      ${render({ variant: 'danger', text: 'Inactivo', pill: true })}
    </div>
  `,
};

// Historia en modo dot (indicadores)
export const Dots: Story = {
  name: 'Indicadores (dot)',
  render: () => `
    <div class="d-flex flex-wrap gap-3 align-items-center p-3">
      <span>Primario ${render({ variant: 'primary', text: '', dot: true })}</span>
      <span>Éxito ${render({ variant: 'success', text: '', dot: true })}</span>
      <span>Error ${render({ variant: 'danger', text: '', dot: true })}</span>
      <span>Advertencia ${render({ variant: 'warning', text: '', dot: true })}</span>
    </div>
  `,
};
