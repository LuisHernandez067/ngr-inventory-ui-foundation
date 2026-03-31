import type { StorybookConfig } from '@storybook/html-vite';
import { resolve } from 'path';
import { getViteAliases, getScssOptions } from '../../apps/prototype-shell/config/vite-aliases';

// Configuración principal de Storybook 8 para el design system NGR Inventory
const config: StorybookConfig = {
  // Descubrimiento de stories desde ui-core, ui-patterns y docs locales
  stories: [
    '../../ui-core/src/**/*.stories.ts',
    '../../ui-patterns/src/**/*.stories.ts',
    '../src/stories/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  // Hereda aliases desde el helper compartido para evitar duplicación
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string> | undefined),
      ...getViteAliases(resolve(__dirname, '../..')),
    };

    config.css ??= {};
    config.css.preprocessorOptions = getScssOptions(resolve(__dirname, '../..'));

    return config;
  },
};

export default config;
