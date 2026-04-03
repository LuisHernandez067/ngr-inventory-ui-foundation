// Componente EmptyState — pantalla vacía con ícono, mensaje y CTA opcional
import type { ComponentProps, ButtonVariant } from '../types';

import { render as renderButton } from './button';

/** Props para el componente EmptyState */
export interface NgrEmptyStateProps extends ComponentProps {
  /** Clase de Bootstrap Icons para el ícono principal, e.g. 'inbox' */
  icon: string;
  /** Título del estado vacío */
  title: string;
  /** Descripción adicional opcional */
  description?: string;
  /** Texto del botón de acción principal (opcional) */
  ctaLabel?: string;
  /** Valor de data-action para el botón CTA (delegación de eventos) */
  ctaAction?: string;
  /** Variante del botón CTA (por defecto 'primary') */
  ctaVariant?: ButtonVariant;
}

/**
 * Renderiza el HTML del estado vacío centrado.
 * Si ctaLabel se proporciona, incluye un botón CTA usando el componente Button.
 */
export function render(props: NgrEmptyStateProps): string {
  const {
    icon,
    title,
    description,
    ctaLabel,
    ctaAction,
    ctaVariant = 'primary',
    id,
    className,
  } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  const descriptionHtml = description ? `<p class="text-muted">${description}</p>` : '';

  const ctaHtml = ctaLabel
    ? renderButton({
        variant: ctaVariant,
        label: ctaLabel,
        dataAction: ctaAction ?? 'empty-state-cta',
      })
    : '';

  return `<div${idAttr} class="ngr-empty-state text-center py-5${extraClass}"><i class="bi bi-${icon} display-1 text-muted" aria-hidden="true"></i><h3 class="mt-3">${title}</h3>${descriptionHtml}${ctaHtml ? `<div class="mt-3">${ctaHtml}</div>` : ''}</div>`;
}

/**
 * Inicializa el EmptyState.
 * Si hay un botón CTA, escucha clics y emite el CustomEvent 'ngr:action' en el root.
 */
export function init(root: HTMLElement): void {
  // Delegar clic del CTA vía data-action — emite ngr:action en el root
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
