import type { Meta, StoryObj } from '@storybook/html';

import { initLayout } from '../../../../../apps/prototype-shell/src/layout/index';

// Story del admin shell completo — combina todos los módulos de layout
const meta: Meta = {
  title: 'Layout/Admin Shell',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Shell completo del administrador NGR Inventory. ' +
          'Combina navbar, sidebar, breadcrumb, área de contenido y footer. ' +
          'Demuestra el comportamiento responsive con offcanvas-lg en mobile.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Historia del shell completo — light theme
export const FullShell: Story = {
  name: 'Shell completo',
  render: () => {
    const container = document.createElement('div');
    container.id = 'app-storybook';
    container.style.cssText = 'position: relative; height: 100vh; overflow: hidden;';

    setTimeout(() => {
      initLayout(container);
    }, 0);

    return container.outerHTML;
  },
};

// Historia en tema oscuro
export const DarkTheme: Story = {
  name: 'Tema oscuro',
  render: () => {
    const html = `
      <div data-bs-theme="dark" style="height: 100vh; overflow: hidden;">
        <div id="app-dark"></div>
      </div>
    `;
    setTimeout(() => {
      const appEl = document.getElementById('app-dark');
      if (appEl) initLayout(appEl);
    }, 0);
    return html;
  },
};

// Historia simulando vista mobile (max-width 576px)
export const MobileView: Story = {
  name: 'Vista mobile',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => {
    const html = `
      <div style="max-width: 375px; height: 100vh; overflow: hidden;">
        <div id="app-mobile"></div>
      </div>
    `;
    setTimeout(() => {
      const appEl = document.getElementById('app-mobile');
      if (appEl) initLayout(appEl);
    }, 0);
    return html;
  },
};
