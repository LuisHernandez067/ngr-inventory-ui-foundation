/**
 * @fileoverview Mapa de tokens tipados para NGR Inventory UI Foundation.
 * Cada objeto exporta referencias a variables CSS como literales `as const`,
 * lo que permite autocompletado y tipos literales en TypeScript estricto.
 */

// --- Tokens de color: NGR Blue (marca primaria) ---
export const colorBrandTokens = {
  50: 'var(--color-brand-50)',
  100: 'var(--color-brand-100)',
  200: 'var(--color-brand-200)',
  300: 'var(--color-brand-300)',
  400: 'var(--color-brand-400)',
  500: 'var(--color-brand-500)',
  600: 'var(--color-brand-600)',
  700: 'var(--color-brand-700)',
  800: 'var(--color-brand-800)',
  900: 'var(--color-brand-900)',
  950: 'var(--color-brand-950)',
} as const;

// --- Tokens de color semántico: Éxito ---
export const colorSuccessTokens = {
  light: 'var(--color-success-light)',
  default: 'var(--color-success-default)',
  dark: 'var(--color-success-dark)',
} as const;

// --- Tokens de color semántico: Advertencia ---
export const colorWarningTokens = {
  light: 'var(--color-warning-light)',
  default: 'var(--color-warning-default)',
  dark: 'var(--color-warning-dark)',
} as const;

// --- Tokens de color semántico: Peligro ---
export const colorDangerTokens = {
  light: 'var(--color-danger-light)',
  default: 'var(--color-danger-default)',
  dark: 'var(--color-danger-dark)',
} as const;

// --- Tokens de color semántico: Información ---
export const colorInfoTokens = {
  light: 'var(--color-info-light)',
  default: 'var(--color-info-default)',
  dark: 'var(--color-info-dark)',
} as const;

// --- Tokens de color: Paleta neutral Slate ---
export const colorSlateTokens = {
  50: 'var(--color-slate-50)',
  100: 'var(--color-slate-100)',
  200: 'var(--color-slate-200)',
  300: 'var(--color-slate-300)',
  400: 'var(--color-slate-400)',
  500: 'var(--color-slate-500)',
  600: 'var(--color-slate-600)',
  700: 'var(--color-slate-700)',
  800: 'var(--color-slate-800)',
  900: 'var(--color-slate-900)',
  950: 'var(--color-slate-950)',
} as const;

// --- Tokens de espaciado (base 4px) ---
export const spaceTokens = {
  1: 'var(--space-1)', // 4px
  2: 'var(--space-2)', // 8px
  3: 'var(--space-3)', // 12px
  4: 'var(--space-4)', // 16px
  5: 'var(--space-5)', // 20px
  6: 'var(--space-6)', // 24px
  8: 'var(--space-8)', // 32px
  10: 'var(--space-10)', // 40px
  12: 'var(--space-12)', // 48px
  16: 'var(--space-16)', // 64px
  20: 'var(--space-20)', // 80px
  24: 'var(--space-24)', // 96px
  // Aliases semánticos para uso expresivo
  xs: 'var(--space-2)', // 8px
  sm: 'var(--space-3)', // 12px
  md: 'var(--space-4)', // 16px
  lg: 'var(--space-6)', // 24px
  xl: 'var(--space-8)', // 32px
} as const;

// --- Tokens de radio de borde ---
export const radiusTokens = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
} as const;

// --- Tokens de sombra ---
export const shadowTokens = {
  xs: 'var(--shadow-xs)',
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
} as const;

// --- Tokens de tipografía ---
export const typographyTokens = {
  fontFamily: {
    sans: 'var(--font-family-sans)',
    mono: 'var(--font-family-mono)',
  },
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
  },
  fontWeight: {
    regular: 'var(--font-weight-regular)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  },
  lineHeight: {
    tight: 'var(--line-height-tight)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
} as const;
