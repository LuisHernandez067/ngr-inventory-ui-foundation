import { render as renderButton } from '@ngr-inventory/ui-core/components/button';
import { render } from '@ngr-inventory/ui-core/components/page-header';
import type { Meta, StoryObj } from '@storybook/html';

// Story del componente PageHeader — encabezado de página landmark
const meta: Meta = {
  title: 'UI Core/PageHeader',
  parameters: {
    docs: {
      description: {
        component:
          'Encabezado de página semántico usando la etiqueta <header>. ' +
          'Contiene un h1 para el título, subtítulo opcional y slot de acciones para botones.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia básica solo con título
export const TitleOnly: Story = {
  name: 'Solo título',
  render: () => `
    <div class="p-3">
      ${render({ title: 'Productos' })}
    </div>
  `,
};

// Historia con título y subtítulo
export const WithSubtitle: Story = {
  name: 'Con subtítulo',
  render: () => `
    <div class="p-3">
      ${render({ title: 'Gestión de Productos', subtitle: 'Administrá el catálogo de tu inventario' })}
    </div>
  `,
};

// Historia completa con título, subtítulo y acciones
export const WithActions: Story = {
  name: 'Con acciones',
  render: () => `
    <div class="p-3">
      ${render({
        title: 'Gestión de Productos',
        subtitle: 'Administrá el catálogo de tu inventario',
        actions: `
          <div class="d-flex gap-2">
            ${renderButton({ variant: 'ghost', label: 'Exportar', icon: 'download' })}
            ${renderButton({ variant: 'primary', label: 'Nuevo Producto', icon: 'plus' })}
          </div>
        `,
      })}
    </div>
  `,
};

// Historia con breadcrumb
export const WithBreadcrumb: Story = {
  name: 'Con breadcrumb',
  render: () => `
    <div class="p-3">
      ${render({
        title: 'Detalle del Producto',
        subtitle: 'Tornillo M6 x 20mm',
        breadcrumb: `
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Productos</a></li>
            <li class="breadcrumb-item active" aria-current="page">Tornillo M6</li>
          </ol>
        `,
        actions: renderButton({ variant: 'primary', label: 'Editar', icon: 'pencil' }),
      })}
    </div>
  `,
};
