import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-core/components/spinner';

// Story del componente Spinner — indicador de carga accesible
const meta: Meta = {
  title: 'UI Core/Spinner',
  parameters: {
    docs: {
      description: {
        component:
          'Indicador de carga accesible con role="status" y texto oculto para lectores de pantalla. ' +
          'Soporta variantes de color Bootstrap y tres tamaños.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia por defecto — spinner primario mediano
export const Default: Story = {
  name: 'Por defecto',
  render: () => `<div class="p-3">${render({})}</div>`,
};

// Historia con variantes de color
export const Variants: Story = {
  name: 'Variantes de color',
  render: () => `
    <div class="d-flex gap-3 align-items-center p-3">
      ${render({ variant: 'primary', label: 'Cargando primario...' })}
      ${render({ variant: 'secondary', label: 'Cargando secundario...' })}
      ${render({ variant: 'success', label: 'Cargando éxito...' })}
      ${render({ variant: 'danger', label: 'Cargando error...' })}
      ${render({ variant: 'warning', label: 'Cargando advertencia...' })}
      ${render({ variant: 'info', label: 'Cargando info...' })}
    </div>
  `,
};

// Historia con diferentes tamaños
export const Sizes: Story = {
  name: 'Tamaños',
  render: () => `
    <div class="d-flex gap-3 align-items-center p-3">
      ${render({ size: 'sm', label: 'Cargando pequeño...' })}
      ${render({ size: 'md', label: 'Cargando mediano...' })}
      ${render({ size: 'lg', label: 'Cargando grande...' })}
    </div>
  `,
};

// Historia con label personalizado
export const CustomLabel: Story = {
  name: 'Con label personalizado',
  render: () => `<div class="p-3">${render({ label: 'Sincronizando datos...' })}</div>`,
};

// Historia con init() para verificar accesibilidad
export const Initialized: Story = {
  name: 'Inicializado',
  render: () => {
    const html = render({ variant: 'primary' });
    setTimeout(() => {
      const root = document.querySelector('.story-spinner') as HTMLElement;
      if (root) init(root);
    }, 0);
    return `<div class="story-spinner p-3">${html}</div>`;
  },
};
