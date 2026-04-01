// Servicio de datos del dashboard — wrappers sobre apiFetch para los tres endpoints.
// Cada función acepta un AbortSignal que se propaga al fetch subyacente,
// permitiendo al orquestador cancelar todas las peticiones en vuelo con un solo abort().
import { apiFetch } from '../_shared/apiFetch';

import type { KpiMetric, DashboardAlert, MovementRow } from './types';

/**
 * Obtiene las métricas KPI del dashboard.
 * El endpoint devuelve un arreglo de KpiMetric.
 *
 * @param signal - Señal de cancelación provista por el orquestador
 * @returns Arreglo de métricas KPI
 * @throws Error con mensaje HTTP si el servidor responde con status no-ok
 */
export async function fetchKpis(signal: AbortSignal): Promise<KpiMetric[]> {
  return apiFetch<KpiMetric[]>('/api/dashboard/kpis', { signal });
}

/**
 * Obtiene las alertas operacionales activas del dashboard.
 * Solo visible para roles admin y operador — el filtrado es responsabilidad del orquestador.
 *
 * @param signal - Señal de cancelación provista por el orquestador
 * @returns Arreglo de alertas activas
 * @throws Error con mensaje HTTP si el servidor responde con status no-ok
 */
export async function fetchAlerts(signal: AbortSignal): Promise<DashboardAlert[]> {
  return apiFetch<DashboardAlert[]>('/api/dashboard/alerts', { signal });
}

/**
 * Obtiene los movimientos de inventario más recientes.
 * Visible para todos los roles en modo solo lectura.
 *
 * @param signal - Señal de cancelación provista por el orquestador
 * @returns Arreglo de filas de movimientos recientes
 * @throws Error con mensaje HTTP si el servidor responde con status no-ok
 */
export async function fetchMovements(signal: AbortSignal): Promise<MovementRow[]> {
  return apiFetch<MovementRow[]>('/api/dashboard/movements', { signal });
}
