// Componente Button — botón de acción con soporte de variantes, íconos y estados
import type { ComponentProps, ButtonVariant, Size } from '../types';

/** Props para el componente Button */
export interface NgrButtonProps extends ComponentProps {
  /** Variante de color del botón */
  variant: ButtonVariant;
  /** Texto visible del botón */
  label: string;
  /** Tamaño del botón (por defecto 'md') */
  size?: Size;
  /** Clase de Bootstrap Icons, e.g. 'save' → 'bi bi-save' */
  icon?: string;
  /** Posición del ícono respecto al texto (por defecto 'start') */
  iconPosition?: 'start' | 'end';
  /** Muestra spinner y deshabilita el botón en estado de carga */
  loading?: boolean;
  /** Deshabilita el botón */
  disabled?: boolean;
  /** Tipo HTML del botón (por defecto 'button') */
  type?: 'button' | 'submit' | 'reset';
  /** Valor del atributo data-action para delegación de eventos */
  dataAction?: string;
  /** Clases CSS adicionales */
  extraClasses?: string;
}

/**
 * Mapeo de tamaños a sufijos de clase Bootstrap.
 * md → sin sufijo, sm → btn-sm, lg → btn-lg
 */
function getSizeClass(size: Size): string {
  if (size === 'sm') return ' btn-sm';
  if (size === 'lg') return ' btn-lg';
  return '';
}

/**
 * Mapea la variante 'ghost' a 'btn-outline-secondary'.
 * El resto siguen el patrón 'btn-{variant}'.
 */
function getVariantClass(variant: ButtonVariant): string {
  if (variant === 'ghost') return 'btn-outline-secondary';
  return `btn-${variant}`;
}

/**
 * Renderiza el ícono de Bootstrap Icons como elemento <i>.
 */
function renderIcon(icon: string): string {
  return `<i class="bi bi-${icon}" aria-hidden="true"></i>`;
}

/**
 * Renderiza el spinner de carga con texto accesible oculto.
 */
function renderLoadingSpinner(): string {
  return `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span><span class="visually-hidden">Cargando...</span>`;
}

/**
 * Renderiza el HTML de un botón con soporte para variantes, íconos, estados de carga y discapacitado.
 * El estado loading deshabilita el botón automáticamente y reemplaza el ícono con un spinner.
 */
export function render(props: NgrButtonProps): string {
  const {
    variant,
    label,
    size = 'md',
    icon,
    iconPosition = 'start',
    loading = false,
    disabled = false,
    type = 'button',
    dataAction,
    id,
    className,
    extraClasses,
  } = props;

  const isDisabled = disabled || loading;
  const variantClass = getVariantClass(variant);
  const sizeClass = getSizeClass(size);
  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const extraClassesAttr = extraClasses ? ` ${extraClasses}` : '';
  const disabledAttr = isDisabled ? ' disabled' : '';
  const ariaDisabled = isDisabled ? ' aria-disabled="true"' : '';
  const dataActionAttr = dataAction ? ` data-action="${dataAction}"` : '';

  // Construir contenido interno del botón
  let content = '';

  if (loading) {
    // Estado de carga: spinner + texto accesible oculto
    content = `${renderLoadingSpinner()} ${label}`;
  } else if (icon && iconPosition === 'start') {
    // Ícono al inicio
    content = `${renderIcon(icon)} ${label}`;
  } else if (icon && iconPosition === 'end') {
    // Ícono al final
    content = `${label} ${renderIcon(icon)}`;
  } else {
    // Solo texto
    content = label;
  }

  return `<button${idAttr} type="${type}" class="btn ${variantClass}${sizeClass}${extraClass}${extraClassesAttr}"${disabledAttr}${ariaDisabled}${dataActionAttr}>${content}</button>`;
}

/**
 * Inicializa los listeners del botón.
 * Emite el CustomEvent 'ngr:action' en el root cuando se hace clic en botones con [data-action].
 */
export function init(root: HTMLElement): void {
  // Delegar clics via data-action — emite ngr:action en el root para manejo del consumidor
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLElement>('[data-action]');
    if (!button || button.hasAttribute('disabled')) return;

    const action = button.getAttribute('data-action');
    if (!action) return;

    root.dispatchEvent(
      new CustomEvent('ngr:action', {
        bubbles: true,
        detail: { action, originalEvent: event },
      })
    );
  });
}
