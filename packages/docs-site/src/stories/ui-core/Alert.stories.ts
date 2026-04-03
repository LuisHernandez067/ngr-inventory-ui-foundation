import { render } from '@ngr-inventory/ui-core/components/alert';
import type { Meta, StoryObj } from '@storybook/html';

// Story del componente Alert — mensajes de retroalimentación
const meta: Meta = {
  title: 'UI Core/Alert',
  parameters: {
    docs: {
      description: {
        component:
          'Mensaje de retroalimentación con soporte de variantes Bootstrap, íconos y cierre. ' +
          'Cumple WCAG 2.2 AA con role="alert" y aria-live="polite" en modo dismissible.',
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
    <div class="d-flex flex-column gap-2 p-3">
      ${render({ variant: 'success', message: 'Operación completada con éxito.' })}
      ${render({ variant: 'info', message: 'Este es un mensaje informativo.' })}
      ${render({ variant: 'warning', message: 'Revisa los datos antes de continuar.' })}
      ${render({ variant: 'danger', message: 'Se produjo un error. Intentá de nuevo.' })}
    </div>
  `,
};

// Historia con íconos
export const WithIcons: Story = {
  name: 'Con íconos',
  render: () => `
    <div class="d-flex flex-column gap-2 p-3">
      ${render({ variant: 'success', message: 'Guardado correctamente.', showIcon: true })}
      ${render({ variant: 'info', message: 'Hay una actualización disponible.', showIcon: true })}
      ${render({ variant: 'warning', message: 'El stock está bajo.', showIcon: true })}
      ${render({ variant: 'danger', message: 'No tenés permisos para esta acción.', showIcon: true })}
    </div>
  `,
};

// Historia con dismiss
export const Dismissible: Story = {
  name: 'Con cierre',
  render: () => `
    <div class="d-flex flex-column gap-2 p-3">
      ${render({ variant: 'success', message: 'Producto guardado. Cerrá este mensaje.', dismissible: true, showIcon: true })}
      ${render({ variant: 'warning', message: 'Advertencia que se puede cerrar.', dismissible: true })}
    </div>
  `,
};
