/**
 * @fileoverview Punto de entrada para los tokens de diseño de NGR Inventory.
 * Exporta todos los mapas de tokens tipados para uso en TypeScript/JavaScript.
 *
 * @example
 * ```typescript
 * import { colorBrandTokens, spaceTokens } from '@ngr-inventory/design-tokens';
 *
 * const brandColor = colorBrandTokens[600]; // 'var(--color-brand-600)'
 * const padding = spaceTokens.md;           // 'var(--space-4)'
 * ```
 */
export {
  colorBrandTokens,
  colorSuccessTokens,
  colorWarningTokens,
  colorDangerTokens,
  colorInfoTokens,
  colorSlateTokens,
  spaceTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
} from './tokens.js';
