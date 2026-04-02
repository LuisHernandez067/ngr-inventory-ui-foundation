// Patrón StatusBadge — badge semántico para estados del dominio NGR Inventory
import type { BadgeVariant, ComponentProps, NgrStatus } from '../types';

/** Props para el componente StatusBadge */
export interface StatusBadgeProps extends ComponentProps {
  /** Estado del dominio a representar — puede ser un NgrStatus conocido o un string libre */
  status: string;
  /** Aplica bordes redondeados tipo píldora (por defecto false) */
  pill?: boolean;
}

/** Mapeo de estados del dominio a variantes de Bootstrap e íconos */
const STATUS_MAP: Record<NgrStatus, { variant: BadgeVariant; icon: string; label: string }> = {
  active: { variant: 'success', icon: 'bi-check-circle-fill', label: 'Activo' },
  inactive: { variant: 'secondary', icon: 'bi-dash-circle', label: 'Inactivo' },
  pending: { variant: 'warning', icon: 'bi-clock', label: 'Pendiente' },
  error: { variant: 'danger', icon: 'bi-x-circle-fill', label: 'Error' },
  warning: { variant: 'warning', icon: 'bi-exclamation-triangle-fill', label: 'Advertencia' },
};

/**
 * Renderiza el HTML del badge de estado semántico.
 * Si el estado es desconocido, usa la variante secondary con el texto crudo.
 */
export function render(props: StatusBadgeProps): string {
  const { status, pill = false, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const pillClass = pill ? ' rounded-pill' : '';
  const extraClass = className ? ` ${className}` : '';

  // Obtener configuración del estado — fallback para estados desconocidos
  const config = Object.hasOwn(STATUS_MAP, status)
    ? STATUS_MAP[status as NgrStatus]
    : { variant: 'secondary' as BadgeVariant, icon: 'bi-question-circle', label: status };

  return `<span${idAttr} class="badge bg-${config.variant}${pillClass} ngr-status-badge${extraClass}"><i class="bi ${config.icon} me-1" aria-hidden="true"></i>${config.label}</span>`;
}

/**
 * Inicializa el StatusBadge — sin comportamiento interactivo.
 * Incluido por consistencia con el patrón render/init.
 */
export function init(_root: HTMLElement): void {
  // Sin comportamiento interactivo — el badge es solo visual
}
