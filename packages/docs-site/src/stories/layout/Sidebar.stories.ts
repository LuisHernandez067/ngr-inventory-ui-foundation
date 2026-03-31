import type { Meta, StoryObj } from '@storybook/html';
import {
  render,
  init,
  setActive,
  NAV_ITEMS,
} from '../../../../apps/prototype-shell/src/layout/sidebar';

// Story del componente Sidebar — barra lateral de navegación del admin shell
const meta: Meta = {
  title: 'Layout/Sidebar',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Barra lateral de navegación con los 16 módulos NGR Inventory agrupados. ' +
          'En desktop (lg+) actúa como sidebar fija; en mobile usa Bootstrap offcanvas-lg.',
      },
    },
  },
  argTypes: {
    activeHash: {
      control: { type: 'select' },
      options: NAV_ITEMS.map((item) => item.hash),
      description: 'Hash de ruta activa',
    },
  },
};

export default meta;

type Story = StoryObj<{ activeHash: string }>;

// Historia por defecto — sidebar con Dashboard activo
export const Default: Story = {
  name: 'Por defecto',
  args: {
    activeHash: '#/',
  },
  render: ({ activeHash }) => {
    const html = render();
    setTimeout(() => {
      const root = document.querySelector('aside#sidebar')?.closest('div') as HTMLElement;
      if (root) {
        init(root);
        setActive(activeHash ?? '#/');
      }
    }, 0);
    return `
      <div style="position: relative; width: 260px; height: 100vh;">
        ${html}
      </div>
    `;
  },
};

// Historia con ítem activo — Productos
export const WithActiveItem: Story = {
  name: 'Con ítem activo',
  args: {
    activeHash: '#/productos',
  },
  render: ({ activeHash }) => {
    const html = render();
    setTimeout(() => {
      setActive(activeHash ?? '#/productos');
    }, 0);
    return `
      <div style="position: relative; width: 260px; height: 100vh;">
        ${html}
      </div>
    `;
  },
};

// Historia mostrando todos los grupos
export const AllGroups: Story = {
  name: 'Todos los grupos',
  args: {
    activeHash: '#/',
  },
  render: ({ activeHash }) => {
    const html = render();
    setTimeout(() => {
      setActive(activeHash ?? '#/');
    }, 0);
    return `
      <div style="position: relative; width: 260px; height: 100vh; overflow-y: auto;">
        ${html}
      </div>
    `;
  },
};

// Historia en tema oscuro
export const DarkTheme: Story = {
  name: 'Tema oscuro',
  args: {
    activeHash: '#/stock',
  },
  render: ({ activeHash }) => {
    const html = render();
    setTimeout(() => {
      setActive(activeHash ?? '#/stock');
    }, 0);
    return `
      <div data-bs-theme="dark" style="position: relative; width: 260px; height: 100vh;">
        ${html}
      </div>
    `;
  },
};
