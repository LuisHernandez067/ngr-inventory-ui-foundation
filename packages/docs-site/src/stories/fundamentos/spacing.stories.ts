import type { Meta, StoryObj } from '@storybook/html';
import { spaceTokens } from '@ngr-inventory/design-tokens';

/** Historia de la escala de espaciado del sistema de diseño */
const meta = {
  title: 'Tokens/Espaciado',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Escala completa de espaciado con barras visuales */
export const EscalaDeEspaciado: Story = {
  render: () => {
    // Escala numérica de tokens: clave → valor CSS + equivalente en px
    const spacingScale: Array<{ name: string; cssVar: string; px: number }> = [
      { name: '1', cssVar: spaceTokens[1], px: 4 },
      { name: '2', cssVar: spaceTokens[2], px: 8 },
      { name: '3', cssVar: spaceTokens[3], px: 12 },
      { name: '4', cssVar: spaceTokens[4], px: 16 },
      { name: '5', cssVar: spaceTokens[5], px: 20 },
      { name: '6', cssVar: spaceTokens[6], px: 24 },
      { name: '8', cssVar: spaceTokens[8], px: 32 },
      { name: '10', cssVar: spaceTokens[10], px: 40 },
      { name: '12', cssVar: spaceTokens[12], px: 48 },
      { name: '16', cssVar: spaceTokens[16], px: 64 },
      { name: '20', cssVar: spaceTokens[20], px: 80 },
      { name: '24', cssVar: spaceTokens[24], px: 96 },
    ];

    return `
      <div style="padding: 1rem; max-width: 600px">
        <h5 style="margin-bottom: 1.5rem">Escala de espaciado</h5>
        ${spacingScale
          .map(
            (s) => `
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem">
            <code style="width: 140px; font-size: 0.75rem; flex-shrink: 0">${s.cssVar}</code>
            <div style="height: 1.25rem; width: ${s.px.toString()}px; background: var(--bs-primary); border-radius: 2px; flex-shrink: 0"></div>
            <small style="color: var(--bs-secondary-color)">${s.px.toString()}px</small>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  },
};

/** Aliases semánticos de espaciado */
export const AliasesSemanticos: Story = {
  name: 'Aliases semánticos',
  render: () => {
    // Aliases legibles para uso expresivo en código
    const aliases: Array<{ alias: string; cssVar: string; px: number }> = [
      { alias: 'xs', cssVar: spaceTokens.xs, px: 8 },
      { alias: 'sm', cssVar: spaceTokens.sm, px: 12 },
      { alias: 'md', cssVar: spaceTokens.md, px: 16 },
      { alias: 'lg', cssVar: spaceTokens.lg, px: 24 },
      { alias: 'xl', cssVar: spaceTokens.xl, px: 32 },
    ];

    return `
      <div style="padding: 1rem; max-width: 600px">
        <h5 style="margin-bottom: 1.5rem">Aliases semánticos</h5>
        ${aliases
          .map(
            (a) => `
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem">
            <code style="width: 80px; font-size: 0.75rem; flex-shrink: 0; color: var(--bs-primary)">${a.alias}</code>
            <code style="width: 120px; font-size: 0.75rem; flex-shrink: 0">${a.cssVar}</code>
            <div style="height: 1.25rem; width: ${a.px.toString()}px; background: var(--bs-primary); border-radius: 2px; flex-shrink: 0"></div>
            <small style="color: var(--bs-secondary-color)">${a.px.toString()}px</small>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  },
};
