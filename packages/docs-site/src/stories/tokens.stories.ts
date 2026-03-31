import type { Meta, StoryObj } from '@storybook/html';
import {
  colorBrandTokens,
  colorSlateTokens,
  colorSuccessTokens,
  colorDangerTokens,
  colorWarningTokens,
} from '@ngr-inventory/design-tokens';

// Story de paleta de tokens de color — verifica que los tokens CSS se resuelven correctamente
const meta: Meta = {
  title: 'Fundamentos/Tokens de Color',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Paleta completa de tokens de color del design system NGR Inventory. ' +
          'Los swatches muestran las variables CSS en el contexto del tema activo.',
      },
    },
  },
};

export default meta;

// Función auxiliar para renderizar un grupo de swatches de color
function renderSwatchGroup(title: string, tokens: Record<string | number, string>): string {
  const swatches = Object.entries(tokens)
    .map(
      ([key, cssVar]) => `
        <div class="d-flex align-items-center gap-3 mb-2">
          <div
            style="
              width: 48px;
              height: 48px;
              background: ${cssVar};
              border-radius: 6px;
              border: 1px solid rgba(0,0,0,.1);
              flex-shrink: 0;
            "
          ></div>
          <div>
            <div class="fw-semibold small">${key}</div>
            <code class="text-muted small">${cssVar}</code>
          </div>
        </div>
      `
    )
    .join('');

  return `
    <div class="mb-4">
      <h5 class="border-bottom pb-2 mb-3">${title}</h5>
      ${swatches}
    </div>
  `;
}

type Story = StoryObj;

// Historia principal con todos los grupos de tokens de color
export const PaletaCompleta: Story = {
  name: 'Paleta completa',
  render: () => `
    <div class="container py-4">
      <h3 class="mb-4">Design Tokens — Paleta de Color</h3>
      ${renderSwatchGroup('NGR Brand (Azul primario)', colorBrandTokens)}
      ${renderSwatchGroup('Slate (Neutral)', colorSlateTokens)}
      ${renderSwatchGroup('Éxito', colorSuccessTokens)}
      ${renderSwatchGroup('Peligro', colorDangerTokens)}
      ${renderSwatchGroup('Advertencia', colorWarningTokens)}
    </div>
  `,
};

// Historia individual mostrando solo la paleta brand
export const NGRBrand: Story = {
  name: 'NGR Brand',
  render: () => `
    <div class="container py-4">
      ${renderSwatchGroup('NGR Brand (Azul primario)', colorBrandTokens)}
    </div>
  `,
};
