import { render as renderBadge } from '@ngr-inventory/ui-core/components/badge';
import { render as renderButton } from '@ngr-inventory/ui-core/components/button';
import { render } from '@ngr-inventory/ui-core/components/card';
import type { Meta, StoryObj } from '@storybook/html';

// Story del componente Card — contenedor con slots opcionales
const meta: Meta = {
  title: 'UI Core/Card',
  parameters: {
    docs: {
      description: {
        component:
          'Contenedor card de Bootstrap con encabezado, cuerpo y pie opcionales. ' +
          'El cuerpo acepta cualquier HTML como segundo parámetro (patrón slot).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia básica solo con cuerpo
export const Basic: Story = {
  name: 'Solo cuerpo',
  render: () => `
    <div class="p-3" style="max-width: 400px;">
      ${render({}, '<p class="mb-0">Contenido del cuerpo de la tarjeta.</p>')}
    </div>
  `,
};

// Historia con encabezado y cuerpo
export const WithHeader: Story = {
  name: 'Con encabezado',
  render: () => `
    <div class="p-3" style="max-width: 400px;">
      ${render(
        { title: 'Lista de Productos' },
        '<p class="mb-0">El listado de productos aparece aquí.</p>'
      )}
    </div>
  `,
};

// Historia completa con encabezado, cuerpo y pie
export const Full: Story = {
  name: 'Completa',
  render: () => `
    <div class="p-3" style="max-width: 400px;">
      ${render(
        {
          title: 'Detalle del Producto',
          footer: `<div class="d-flex justify-content-end gap-2">${renderButton({ variant: 'ghost', label: 'Cancelar', size: 'sm' })}${renderButton({ variant: 'primary', label: 'Guardar', size: 'sm', icon: 'floppy' })}</div>`,
        },
        `<p>Nombre: <strong>Tornillo M6</strong></p><p class="mb-0">Stock: ${renderBadge({ variant: 'success', text: '450 unidades', pill: true })}</p>`
      )}
    </div>
  `,
};

// Historia con acciones en el encabezado
export const WithHeaderActions: Story = {
  name: 'Con acciones en encabezado',
  render: () => `
    <div class="p-3" style="max-width: 400px;">
      ${render(
        {
          title: 'Movimientos Recientes',
          headerActions: renderButton({
            variant: 'ghost',
            label: 'Ver todos',
            size: 'sm',
            icon: 'arrow-right',
            iconPosition: 'end',
          }),
        },
        '<p class="mb-0">Los movimientos recientes aparecen aquí.</p>'
      )}
    </div>
  `,
};
