// Widget del panel de alertas — muestra alertas operacionales activas.
// Solo visible para roles admin y operador — el rol consulta debe ser ocultado antes de montar.
import { Spinner, Alert, Badge, EmptyState } from '@ngr-inventory/ui-core';

import { authService } from '../../../services/authService';
import { fetchAlerts } from '../dashboardService';
import type { DashboardAlert } from '../types';

// ── Mapeo de severity a variante de Badge ────────────────────────────────────

/** Devuelve el HTML del badge de severidad */
function renderSeverityBadge(severity: DashboardAlert['severity']): string {
  const labelMap: Record<DashboardAlert['severity'], string> = {
    danger: 'Crítico',
    warning: 'Advertencia',
    info: 'Información',
  };
  return Badge.render({ variant: severity, text: labelMap[severity], pill: true });
}

// ── Renderizado individual de alerta ─────────────────────────────────────────

/** Genera el HTML de una fila de alerta */
function renderAlertRow(alert: DashboardAlert): string {
  const severityBadge = renderSeverityBadge(alert.severity);
  const enlaceHtml = alert.enlace
    ? `<a href="${alert.enlace}" class="stretched-link text-decoration-none">
         <i class="bi bi-arrow-right-circle ms-2" aria-hidden="true"></i>
       </a>`
    : '';

  return `
    <li class="list-group-item d-flex align-items-start gap-2 position-relative">
      <div class="mt-1">${severityBadge}</div>
      <div class="flex-grow-1">
        <div class="fw-semibold">${alert.titulo}</div>
        <div class="text-muted small">${alert.descripcion}</div>
      </div>
      ${enlaceHtml}
    </li>
  `.trim();
}

// ── Estado de error con reintento ─────────────────────────────────────────────

/** Inyecta el estado de error con botón de reintento y configura el listener */
function showError(container: HTMLElement, signal: AbortSignal, retryId: string): void {
  const errorHtml = Alert.render({
    variant: 'danger',
    message: 'Error al cargar las alertas.',
    showIcon: true,
  });

  container.innerHTML = `
    <div>
      ${errorHtml}
      <button id="${retryId}" type="button" class="btn btn-sm btn-outline-secondary mt-2">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Reintentar
      </button>
    </div>
  `.trim();

  // Listener con { once: true } para evitar acumulación de handlers en reintentos
  container.querySelector(`#${retryId}`)?.addEventListener(
    'click',
    () => {
      renderAlertsPanel(container, signal);
    },
    { once: true }
  );
}

// ── Función exportada del widget ──────────────────────────────────────────────

/**
 * Renderiza el widget del panel de alertas dentro del contenedor dado.
 * Para el rol `consulta` el widget se oculta por completo (display:none).
 * Muestra spinner durante la carga, la lista al recibir datos,
 * o un mensaje de error con reintento si la petición falla.
 *
 * @param container - Elemento HTML donde se montará el widget
 * @param signal - Señal de cancelación provista por el orquestador
 */
export function renderAlertsPanel(container: HTMLElement, signal: AbortSignal): void {
  // El rol consulta no tiene acceso a las alertas operacionales
  const profile = authService.getProfile();
  if (profile === 'consulta') {
    container.style.display = 'none';
    return;
  }

  // Mostrar spinner de carga
  container.innerHTML = `<div class="text-center py-3">${Spinner.render({ variant: 'primary', label: 'Cargando alertas...' })}</div>`;

  fetchAlerts(signal)
    .then((alerts) => {
      if (alerts.length === 0) {
        // Estado vacío: sin alertas activas
        container.innerHTML = EmptyState.render({
          icon: 'bell-slash',
          title: 'Sin alertas activas',
          description: 'No hay alertas operacionales en este momento.',
        });
        return;
      }

      // Renderizar lista de alertas
      const rows = alerts.map(renderAlertRow).join('');
      container.innerHTML = `<ul class="list-group list-group-flush">${rows}</ul>`;
    })
    .catch((error: unknown) => {
      // AbortError es esperado al navegar — no mostrar error al usuario
      if (error instanceof Error && error.name === 'AbortError') return;
      showError(container, signal, 'alerts-retry-btn');
    });
}
