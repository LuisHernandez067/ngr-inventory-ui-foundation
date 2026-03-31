// Tipos compartidos para todos los componentes UI Core de NGR Inventory

/** Tamaños disponibles para los componentes */
export type Size = 'sm' | 'md' | 'lg';

/** Variantes de color disponibles en el sistema */
export type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark'
  | 'ghost';

/** Variantes permitidas para el componente Button */
export type ButtonVariant = Extract<
  Variant,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'ghost'
>;

/** Variantes permitidas para el componente Badge */
export type BadgeVariant = Extract<
  Variant,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
>;

/** Variantes permitidas para el componente Alert */
export type AlertVariant = Extract<
  Variant,
  'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
>;

/** Props base opcionales para todos los componentes */
export interface ComponentProps {
  /** Identificador HTML del elemento raíz */
  id?: string;
  /** Clases CSS adicionales para el elemento raíz */
  className?: string;
}
