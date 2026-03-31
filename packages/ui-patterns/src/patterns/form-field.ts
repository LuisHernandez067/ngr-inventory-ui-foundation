// Patrón FormField — campo de formulario accesible con helper text y estado de error
import type { ComponentProps } from '../types';

/** Props para el componente FormField */
export interface FormFieldProps extends ComponentProps {
  /** Etiqueta visible del campo */
  label: string;
  /** Nombre del campo (atributo name e id) */
  name: string;
  /** Tipo HTML del input (por defecto 'text') */
  type?: string;
  /** Valor del campo */
  value?: string;
  /** Texto de placeholder */
  placeholder?: string;
  /** Texto de ayuda visible debajo del campo */
  helperText?: string;
  /** Mensaje de error — activa el estado inválido */
  error?: string;
  /** Marca el campo como requerido */
  required?: boolean;
  /** Deshabilita el campo */
  disabled?: boolean;
}

/**
 * Renderiza el HTML de un campo de formulario accesible.
 * Vincula el input con helper text y mensajes de error via aria-describedby.
 */
export function render(props: FormFieldProps): string {
  const {
    label,
    name,
    type = 'text',
    value = '',
    placeholder,
    helperText,
    error,
    required = false,
    disabled = false,
    id,
    className,
  } = props;

  const fieldId = id ?? name;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const extraClass = className ? ` ${className}` : '';

  // Construir aria-describedby solo con los IDs que existen
  const ariaIds: string[] = [];
  if (helperText) ariaIds.push(helperId);
  if (error) ariaIds.push(errorId);
  const ariaDescribedBy = ariaIds.length ? ` aria-describedby="${ariaIds.join(' ')}"` : '';

  // Estado de error
  const isInvalid = Boolean(error);
  const inputClass = isInvalid ? ' is-invalid' : '';
  const ariaInvalid = isInvalid ? ' aria-invalid="true"' : '';

  const requiredAttr = required ? ' required aria-required="true"' : '';
  const disabledAttr = disabled ? ' disabled' : '';
  const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : '';
  const valueAttr = value ? ` value="${value}"` : '';

  // Helper text — se oculta cuando hay error
  const helperHtml = helperText
    ? `<div id="${helperId}" class="form-text text-muted">${helperText}</div>`
    : '';

  // Mensaje de error
  const errorHtml = error ? `<div id="${errorId}" class="invalid-feedback">${error}</div>` : '';

  return (
    `<div class="mb-3${extraClass}">` +
    `<label for="${fieldId}" class="form-label${required ? ' fw-semibold' : ''}">${label}${required ? ' <span class="text-danger" aria-hidden="true">*</span>' : ''}</label>` +
    `<input id="${fieldId}" type="${type}" name="${name}" class="form-control${inputClass}"${valueAttr}${placeholderAttr}${ariaDescribedBy}${ariaInvalid}${requiredAttr}${disabledAttr}>` +
    helperHtml +
    errorHtml +
    `</div>`
  );
}

/**
 * Inicializa el FormField.
 * Sin comportamiento interactivo — la accesibilidad se maneja en el HTML.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — solo estructura HTML accesible
}
