// Patrón SearchBar — barra de búsqueda con debounce y botón de limpiar
import type { ComponentProps } from '../types';
import { debounce } from '../utils/debounce';

/** Props para el componente SearchBar */
export interface SearchBarProps extends ComponentProps {
  /** Texto de placeholder del input */
  placeholder?: string;
  /** Tiempo de debounce en ms (por defecto 300) */
  debounceMs?: number;
  /** Valor inicial del campo de búsqueda */
  initialValue?: string;
}

/**
 * Renderiza el HTML de la barra de búsqueda.
 * Incluye input con ícono de lupa y botón de limpiar.
 */
export function render(props: SearchBarProps): string {
  const { placeholder = 'Buscar...', initialValue = '', id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const inputId = id ? `${id}-input` : 'ngr-search-input';

  return (
    `<div${idAttr} class="input-group ngr-search-bar${extraClass}">` +
    `<span class="input-group-text"><i class="bi bi-search" aria-hidden="true"></i></span>` +
    `<input id="${inputId}" type="search" class="form-control" ` +
    `placeholder="${placeholder}" value="${initialValue}" aria-label="${placeholder}">` +
    `<button type="button" class="btn btn-outline-secondary" ` +
    `data-action="clear" aria-label="Limpiar búsqueda">` +
    `<i class="bi bi-x-lg" aria-hidden="true"></i>` +
    `</button>` +
    `</div>`
  );
}

/**
 * Inicializa los listeners de la barra de búsqueda.
 * Emite 'ngr:search' con debounce al escribir y al limpiar.
 */
export function init(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  if (!input) return;

  // Función que despacha el evento de búsqueda
  const dispatch = (query: string) => {
    root.dispatchEvent(
      new CustomEvent('ngr:search', {
        bubbles: true,
        detail: { query },
      })
    );
  };

  // Obtener el delay configurado — leer del atributo data o usar default
  const debounceMs = parseInt(root.getAttribute('data-debounce') ?? '300', 10);

  // Listener de input con debounce — emite ngr:search tras pausa en escritura
  const debouncedDispatch = debounce(dispatch, debounceMs || 300);
  input.addEventListener('input', () => {
    debouncedDispatch(input.value.trim());
  });

  // Botón de limpiar — limpia el input y emite ngr:search con string vacío
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-action="clear"]');
    if (!btn) return;

    input.value = '';
    input.focus();
    dispatch('');
  });
}
