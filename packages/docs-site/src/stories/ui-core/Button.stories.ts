import { render, init } from '@ngr-inventory/ui-core/components/button';
import type { Meta, StoryObj } from '@storybook/html';

// Story del componente Button — botón de acción NGR
const meta: Meta = {
  title: 'UI Core/Button',
  parameters: {
    docs: {
      description: {
        component:
          'Botón de acción con soporte de variantes Bootstrap, íconos Bootstrap Icons, ' +
          'estados de carga y discapacitado. Emite el CustomEvent ngr:action al hacer clic.',
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
      ${render({ variant: 'primary', label: 'Primario' })}
      ${render({ variant: 'secondary', label: 'Secundario' })}
      ${render({ variant: 'success', label: 'Éxito' })}
      ${render({ variant: 'danger', label: 'Peligro' })}
      ${render({ variant: 'warning', label: 'Advertencia' })}
      ${render({ variant: 'info', label: 'Información' })}
      ${render({ variant: 'ghost', label: 'Ghost' })}
    </div>
  `,
};

// Historia con tamaños
export const Sizes: Story = {
  name: 'Tamaños',
  render: () => `
    <div class="d-flex flex-wrap gap-2 align-items-center p-3">
      ${render({ variant: 'primary', label: 'Pequeño', size: 'sm' })}
      ${render({ variant: 'primary', label: 'Mediano' })}
      ${render({ variant: 'primary', label: 'Grande', size: 'lg' })}
    </div>
  `,
};

// Historia con íconos
export const WithIcons: Story = {
  name: 'Con íconos',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ variant: 'primary', label: 'Guardar', icon: 'floppy' })}
      ${render({ variant: 'secondary', label: 'Editar', icon: 'pencil' })}
      ${render({ variant: 'danger', label: 'Eliminar', icon: 'trash' })}
      ${render({ variant: 'success', label: 'Siguiente', icon: 'arrow-right', iconPosition: 'end' })}
    </div>
  `,
};

// Historia con estado de carga
export const Loading: Story = {
  name: 'Estado de carga',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ variant: 'primary', label: 'Guardando...', loading: true })}
      ${render({ variant: 'secondary', label: 'Procesando...', loading: true })}
    </div>
  `,
};

// Historia con estado deshabilitado
export const Disabled: Story = {
  name: 'Estado deshabilitado',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ variant: 'primary', label: 'Deshabilitado', disabled: true })}
      ${render({ variant: 'danger', label: 'No disponible', disabled: true })}
    </div>
  `,
};

// Historia con evento ngr:action
export const WithAction: Story = {
  name: 'Con delegación de eventos',
  render: () => {
    const html = render({ variant: 'primary', label: 'Hacer clic', dataAction: 'demo-action' });
    const rootId = 'story-button-action';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (root) {
        init(root);
        root.addEventListener('ngr:action', () => {
          // Evento de acción registrado — ver panel Actions de Storybook
        });
      }
    }, 0);

    return `<div id="${rootId}" class="p-3">${html}</div>`;
  },
};
