// Widget de tarjetas KPI — muestra una grilla de métricas del dashboard.
// Gestiona sus propios estados de carga, error y datos de forma asíncrona.
import { Spinner, Alert } from '@ngr-inventory/ui-core';

import { fetchKpis } from '../dashboardService';
import type { KpiMetric } from '../types';

// ── Iconos de tendencia ───────────────────────────────────────────────────────

/** Devuelve el HTML del indicador de tendencia según la dirección */
function renderTrendIndicator(trend: KpiMetric['trend'], trendPercent?: number): string {
  const percent = trendPercent !== undefined ? ` ${String(trendPercent)}%` : '';
  switch (trend) {
    case 'up':
      return `<span class="text-success small"><i class="bi bi-arrow-up-short" aria-hidden="true"></i>${percent}</span>`;
    case 'down':
      return `<span class="text-danger small"><i class="bi bi-arrow-down-short" aria-hidden="true"></i>${percent}</span>`;
    case 'stable':
    default:
      return `<span class="text-muted small"><i class="bi bi-dash" aria-hidden="true"></i>${percent}</span>`;
  }
}

// ── Renderizado individual de tarjeta KPI ────────────────────────────────────

/** Genera el HTML de una tarjeta KPI individual */
function renderKpiCard(metric: KpiMetric): string {
  const unit = metric.unit ? ` <span class="text-muted small">${metric.unit}</span>` : '';
  const trendHtml = renderTrendIndicator(metric.trend, metric.trendPercent);

  return `
    <div class="col">
      <div class="card h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="fs-1 ${metric.colorClass}">
            <i class="bi ${metric.icon}" aria-hidden="true"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fs-4 fw-bold">${metric.value.toLocaleString('es-CO')}${unit}</div>
            <div class="text-muted small">${metric.label}</div>
            <div>${trendHtml}</div>
          </div>
        </div>
      </div>
    </div>
  `.trim();
}

// ── Renderizado de grilla de KPIs ─────────────────────────────────────────────

/** Genera el HTML de la grilla completa de tarjetas KPI */
function renderKpiGrid(metrics: KpiMetric[]): string {
  const cards = metrics.map(renderKpiCard).join('');
  return `<div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">${cards}</div>`;
}

// ── Estado de error con reintento ─────────────────────────────────────────────

/** Inyecta el estado de error con botón de reintento y configura el listener */
function showError(container: HTMLElement, signal: AbortSignal, retryId: string): void {
  const errorHtml = Alert.render({
    variant: 'danger',
    message: 'Error al cargar los KPIs.',
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
      renderKpiCards(container, signal);
    },
    { once: true }
  );
}

// ── Función exportada del widget ──────────────────────────────────────────────

/**
 * Renderiza el widget de tarjetas KPI dentro del contenedor dado.
 * Muestra spinner durante la carga, la grilla al recibir datos,
 * o un mensaje de error con reintento si la petición falla.
 *
 * @param container - Elemento HTML donde se montará el widget
 * @param signal - Señal de cancelación provista por el orquestador
 */
export function renderKpiCards(container: HTMLElement, signal: AbortSignal): void {
  // Mostrar spinner de carga
  container.innerHTML = `<div class="text-center py-3">${Spinner.render({ variant: 'primary', label: 'Cargando KPIs...' })}</div>`;

  fetchKpis(signal)
    .then((metrics) => {
      if (metrics.length === 0) {
        // Estado vacío: sin métricas disponibles
        container.innerHTML = `<p class="text-muted text-center py-3">Sin métricas disponibles.</p>`;
        return;
      }
      container.innerHTML = renderKpiGrid(metrics);
    })
    .catch((error: unknown) => {
      // AbortError es esperado al navegar — no mostrar error al usuario
      if (error instanceof Error && error.name === 'AbortError') return;
      showError(container, signal, 'kpi-retry-btn');
    });
}
