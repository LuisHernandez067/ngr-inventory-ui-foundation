import type { Meta, StoryObj } from '@storybook/html';

import { render, init } from '../../../../../apps/prototype-shell/src/layout/navbar';

// Story del componente Navbar — barra de navegación superior del admin shell
const meta: Meta = {
  title: 'Layout/Navbar',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Barra de navegación superior fija del admin shell NGR Inventory. ' +
          'Contiene la marca, botón de toggle del sidebar (mobile), selector de tema, ' +
          'notificaciones y avatar de usuario.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Historia por defecto — navbar renderizado con sus controles
export const Default: Story = {
  name: 'Por defecto',
  render: () => {
    const html = render();
    // Inicializar listeners después del render
    setTimeout(() => {
      const root = document.querySelector('.navbar-ngr')?.closest('div') as HTMLElement;
      if (root) init(root);
    }, 0);
    return `
      <div style="position: relative; height: 80px;">
        ${html}
      </div>
    `;
  },
};

// Historia con tema oscuro
export const DarkTheme: Story = {
  name: 'Tema oscuro',
  render: () => {
    const html = render();
    return `
      <div data-bs-theme="dark" style="position: relative; height: 80px;">
        ${html}
      </div>
    `;
  },
};

// Historia mostrando el botón de toggle del sidebar (simulado en mobile)
export const WithSidebarToggle: Story = {
  name: 'Con toggle de sidebar',
  render: () => {
    const html = render();
    return `
      <div style="position: relative; height: 80px; max-width: 576px;">
        ${html}
      </div>
    `;
  },
};
