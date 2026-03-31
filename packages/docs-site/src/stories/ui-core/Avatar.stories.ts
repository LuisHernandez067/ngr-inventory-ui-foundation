import type { Meta, StoryObj } from '@storybook/html';
import { render } from '@ngr-inventory/ui-core/components/avatar';

// Story del componente Avatar — representación visual de usuario
const meta: Meta = {
  title: 'UI Core/Avatar',
  parameters: {
    docs: {
      description: {
        component:
          'Avatar circular con iniciales generadas automáticamente desde el nombre del usuario. ' +
          'El color de fondo es determinístico (hash del nombre) entre 8 colores del sistema. ' +
          'Soporta imagen de perfil y tres tamaños.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia con iniciales y paleta de colores
export const Initials: Story = {
  name: 'Iniciales',
  render: () => `
    <div class="d-flex flex-wrap gap-3 align-items-center p-3">
      ${render({ name: 'Juan Pérez' })}
      ${render({ name: 'María García' })}
      ${render({ name: 'Carlos López' })}
      ${render({ name: 'Ana Martínez' })}
      ${render({ name: 'Luis Rodríguez' })}
      ${render({ name: 'Admin' })}
    </div>
  `,
};

// Historia con diferentes tamaños
export const Sizes: Story = {
  name: 'Tamaños',
  render: () => `
    <div class="d-flex flex-wrap gap-3 align-items-center p-3">
      ${render({ name: 'Juan Pérez', size: 'sm' })}
      ${render({ name: 'Juan Pérez', size: 'md' })}
      ${render({ name: 'Juan Pérez', size: 'lg' })}
    </div>
  `,
};

// Historia con imagen de perfil
export const WithImage: Story = {
  name: 'Con imagen',
  render: () => `
    <div class="d-flex flex-wrap gap-3 align-items-center p-3">
      ${render({ name: 'Usuario Admin', src: 'https://i.pravatar.cc/150?img=1', size: 'sm' })}
      ${render({ name: 'Usuario Admin', src: 'https://i.pravatar.cc/150?img=1', size: 'md' })}
      ${render({ name: 'Usuario Admin', src: 'https://i.pravatar.cc/150?img=1', size: 'lg' })}
    </div>
  `,
};
