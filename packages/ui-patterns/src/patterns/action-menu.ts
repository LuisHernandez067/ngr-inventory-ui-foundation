// Patrón ActionMenu — menú desplegable de acciones con Bootstrap Dropdown
import { Dropdown } from 'bootstrap';
import type { ComponentProps, ActionMenuItem } from '../types';

/** Props para el componente ActionMenu */
export interface ActionMenuProps extends ComponentProps {
  /** Lista de ítems del menú */
  items: ActionMenuItem[];
  /** Texto del botón toggle (por defecto 'Acciones') */
  toggleLabel?: string;
  /** Ícono Bootstrap Icons del toggle (por defecto 'three-dots-vertical') */
  toggleIcon?: string;
  /** Tamaño del botón toggle */
  size?: 'sm' | 'md';
}

/**
 * Renderiza el HTML del menú de acciones desplegable.
 * Usa Bootstrap Dropdown con aria-label accesible.
 */
export function render(props: ActionMenuProps): string {
  const {
    items,
    toggleLabel = 'Acciones',
    toggleIcon = 'three-dots-vertical',
    size = 'md',
    id,
    className,
  } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';
  const sizeClass = size === 'sm' ? ' btn-sm' : '';
  const dropdownId = id ? `${id}-menu` : 'ngr-action-menu';

  const menuItems = items
    .map((item) => {
      if (item.disabled) {
        return (
          `<li><span class="dropdown-item disabled text-muted" aria-disabled="true">` +
          `${item.icon ? `<i class="bi bi-${item.icon} me-2" aria-hidden="true"></i>` : ''}${item.label}</span></li>`
        );
      }

      const dangerClass = item.variant === 'danger' ? ' text-danger' : '';
      return (
        `<li><button type="button" class="dropdown-item${dangerClass}" ` +
        `data-action-id="${item.id}">` +
        `${item.icon ? `<i class="bi bi-${item.icon} me-2" aria-hidden="true"></i>` : ''}${item.label}` +
        `</button></li>`
      );
    })
    .join('');

  return (
    `<div${idAttr} class="dropdown ngr-action-menu${extraClass}">` +
    `<button type="button" class="btn btn-outline-secondary${sizeClass}" ` +
    `data-bs-toggle="dropdown" aria-expanded="false" aria-label="${toggleLabel}">` +
    `<i class="bi bi-${toggleIcon}" aria-hidden="true"></i>` +
    `</button>` +
    `<ul id="${dropdownId}" class="dropdown-menu dropdown-menu-end">${menuItems}</ul>` +
    `</div>`
  );
}

/**
 * Inicializa el ActionMenu con Bootstrap Dropdown.
 * Emite 'ngr:action' al hacer clic en un ítem activo.
 */
export function init(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLElement>('[data-bs-toggle="dropdown"]');
  if (toggle) {
    // Inicializar Bootstrap Dropdown
    new Dropdown(toggle);
  }

  // Delegación de clic en ítems activos
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-action-id]');
    if (!btn || btn.classList.contains('disabled')) return;

    const actionId = btn.getAttribute('data-action-id') ?? '';

    // Emitir evento de acción con el id del ítem
    root.dispatchEvent(
      new CustomEvent('ngr:action', {
        bubbles: true,
        detail: { id: actionId },
      })
    );
  });
}
