import type { Preview } from '@storybook/html';
import '@ngr-inventory/bootstrap-theme';

// Toolbar global para alternar entre temas light/dark/warm/cold
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Tema Bootstrap',
      defaultValue: 'light',
      toolbar: {
        title: 'Tema',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Claro', icon: 'sun' },
          { value: 'dark', title: 'Oscuro', icon: 'moon' },
          { value: 'warm', title: 'Cálido', icon: 'contrast' },
          { value: 'cold', title: 'Frío', icon: 'paintbrush' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      // Actualiza data-bs-theme cuando el usuario cambia el tema en la toolbar
      const theme = (context.globals['theme'] as string) ?? 'light';
      const rendered = story();
      const content = typeof rendered === 'string' ? rendered : '';
      return `<div id="storybook-theme-root" data-bs-theme="${theme}">${content}</div>`;
    },
  ],
};

export default preview;
