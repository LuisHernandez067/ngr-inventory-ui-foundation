import { radiusTokens, shadowTokens } from '@ngr-inventory/design-tokens';
import type { Meta, StoryObj } from '@storybook/html';

/** Historia de bordes, radios y sombras del sistema */
const meta = {
  title: 'Tokens/Bordes y Sombras',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Escala de radio de bordes */
export const RadioDeBordes: Story = {
  render: () => {
    // Tokens de radio definidos en el sistema de diseño
    const radii: { name: string; cssVar: string; label: string }[] = [
      { name: 'none', cssVar: radiusTokens.none, label: '0px' },
      { name: 'sm', cssVar: radiusTokens.sm, label: '0.25rem (4px)' },
      { name: 'md', cssVar: radiusTokens.md, label: '0.375rem (6px)' },
      { name: 'lg', cssVar: radiusTokens.lg, label: '0.5rem (8px)' },
      { name: 'xl', cssVar: radiusTokens.xl, label: '1rem (16px)' },
      { name: 'full', cssVar: radiusTokens.full, label: '50rem (pill)' },
    ];

    return `
      <div style="padding: 1rem">
        <h5 style="margin-bottom: 1.5rem">Radio de bordes</h5>
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem">
          ${radii
            .map(
              (r) => `
            <div style="text-align: center">
              <div style="
                width: 64px;
                height: 64px;
                background: var(--bs-primary);
                border-radius: ${r.cssVar};
                margin: 0 auto 0.5rem;
              "></div>
              <code style="font-size: 0.7rem">${r.name}</code>
              <br><small style="color: var(--bs-secondary-color)">${r.label}</small>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  },
};

/** Escala de sombras del sistema */
export const SombrasDeSistema: Story = {
  name: 'Sombras',
  render: () => {
    // Tokens de sombra definidos en el sistema de diseño
    const shadows: { name: string; cssVar: string }[] = [
      { name: 'xs', cssVar: shadowTokens.xs },
      { name: 'sm', cssVar: shadowTokens.sm },
      { name: 'md', cssVar: shadowTokens.md },
      { name: 'lg', cssVar: shadowTokens.lg },
      { name: 'xl', cssVar: shadowTokens.xl },
    ];

    return `
      <div style="padding: 2rem">
        <h5 style="margin-bottom: 2rem">Sombras</h5>
        <div style="display: flex; flex-wrap: wrap; gap: 2.5rem; align-items: center">
          ${shadows
            .map(
              (s) => `
            <div style="text-align: center">
              <div style="
                width: 100px;
                height: 60px;
                background: var(--bs-body-bg);
                box-shadow: ${s.cssVar};
                border-radius: var(--radius-md);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.75rem;
              ">
                <code style="font-size: 0.7rem; color: var(--bs-body-color)">${s.name}</code>
              </div>
              <small style="color: var(--bs-secondary-color); font-family: monospace">${s.cssVar}</small>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  },
};
