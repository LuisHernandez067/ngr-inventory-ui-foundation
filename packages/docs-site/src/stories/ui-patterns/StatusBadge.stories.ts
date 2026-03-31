import type { Meta, StoryObj } from '@storybook/html';
import { render } from '@ngr-inventory/ui-patterns/patterns/status-badge';

// Story del patrón StatusBadge — badge semántico de estado NGR
const meta: Meta = {
  title: 'UI Patterns/StatusBadge',
  parameters: {
    docs: {
      description: {
        component:
          'Badge semántico que mapea estados del dominio NGR Inventory a variantes de color Bootstrap. ' +
          'Incluye ícono Bootstrap Icons y etiqueta en español.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con todos los estados semánticos del dominio
export const TodosLosEstados: Story = {
  name: 'Todos los estados',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ status: 'activo' })}
      ${render({ status: 'inactivo' })}
      ${render({ status: 'pendiente' })}
      ${render({ status: 'aprobado' })}
      ${render({ status: 'rechazado' })}
      ${render({ status: 'en_transito' })}
      ${render({ status: 'reservado' })}
    </div>
  `,
};

// Historia con estilo pill
export const EstiloPill: Story = {
  name: 'Estilo píldora',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ status: 'activo', pill: true })}
      ${render({ status: 'pendiente', pill: true })}
      ${render({ status: 'rechazado', pill: true })}
      ${render({ status: 'en_transito', pill: true })}
    </div>
  `,
};

// Historia con estado desconocido (fallback)
export const EstadoDesconocido: Story = {
  name: 'Estado desconocido (fallback)',
  render: () => `
    <div class="d-flex flex-wrap gap-2 p-3">
      ${render({ status: 'en_revision' })}
      ${render({ status: 'devuelto' })}
    </div>
  `,
};

// Historia de uso en tabla de productos
export const EnTablaProductos: Story = {
  name: 'Uso en tabla de productos',
  render: () => `
    <table class="table p-3">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Stock</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Laptop HP EliteBook</td>
          <td>12</td>
          <td>${render({ status: 'activo' })}</td>
        </tr>
        <tr>
          <td>Monitor Dell 27"</td>
          <td>0</td>
          <td>${render({ status: 'inactivo' })}</td>
        </tr>
        <tr>
          <td>Teclado Logitech MX</td>
          <td>3</td>
          <td>${render({ status: 'reservado' })}</td>
        </tr>
        <tr>
          <td>Mouse Razer DeathAdder</td>
          <td>8</td>
          <td>${render({ status: 'en_transito' })}</td>
        </tr>
      </tbody>
    </table>
  `,
};
