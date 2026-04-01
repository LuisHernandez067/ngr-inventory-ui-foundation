import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import * as dashboardService from '../dashboardService';
import type { KpiMetric } from '../types';

import { renderKpiCards } from './kpiCards';

// Tests del widget kpiCards.
// Se mockea dashboardService para aislar el comportamiento de renderizado.

// Fixture de datos de prueba
const mockKpis: KpiMetric[] = [
  {
    id: 'kpi-productos',
    label: 'Productos activos',
    value: 1247,
    unit: 'productos',
    trend: 'up',
    trendPercent: 3.5,
    icon: 'bi-box-seam',
    colorClass: 'text-primary',
  },
  {
    id: 'kpi-stock',
    label: 'Stock bajo mínimo',
    value: 23,
    trend: 'down',
    trendPercent: 2.1,
    icon: 'bi-exclamation-triangle',
    colorClass: 'text-warning',
  },
  {
    id: 'kpi-movimientos',
    label: 'Movimientos hoy',
    value: 156,
    trend: 'stable',
    icon: 'bi-arrow-left-right',
    colorClass: 'text-info',
  },
];

describe('kpiCards.ts', () => {
  let container: HTMLElement;
  let fetchKpisSpy: MockInstance;

  beforeEach(() => {
    container = document.createElement('div');
    fetchKpisSpy = vi.spyOn(dashboardService, 'fetchKpis');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Caso exitoso ─────────────────────────────────────────────────────────────

  it('debe renderizar las tarjetas KPI cuando fetchKpis resuelve con datos', async () => {
    fetchKpisSpy.mockResolvedValueOnce(mockKpis);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    // Primero debe mostrar el spinner
    expect(container.innerHTML).toContain('spinner-border');

    // Esperar resolución de la promesa
    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    // Verificar que se renderizaron las tarjetas
    expect(container.querySelectorAll('.col').length).toBe(mockKpis.length);
    expect(container.innerHTML).toContain('Productos activos');
    expect(container.innerHTML).toContain('1.247');
    expect(container.innerHTML).toContain('Stock bajo mínimo');
  });

  it('debe mostrar el indicador de tendencia ascendente correctamente', async () => {
    fetchKpisSpy.mockResolvedValueOnce([mockKpis[0]]);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    // Tendencia 'up' debe mostrar flecha arriba en verde
    expect(container.innerHTML).toContain('text-success');
    expect(container.innerHTML).toContain('bi-arrow-up-short');
    expect(container.innerHTML).toContain('3.5%');
  });

  it('debe mostrar el indicador de tendencia descendente correctamente', async () => {
    fetchKpisSpy.mockResolvedValueOnce([mockKpis[1]]);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    // Tendencia 'down' debe mostrar flecha abajo en rojo
    expect(container.innerHTML).toContain('text-danger');
    expect(container.innerHTML).toContain('bi-arrow-down-short');
  });

  it('debe mostrar el indicador neutro para tendencia stable', async () => {
    fetchKpisSpy.mockResolvedValueOnce([mockKpis[2]]);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    // Tendencia 'stable' debe mostrar guión en gris
    expect(container.innerHTML).toContain('text-muted');
    expect(container.innerHTML).toContain('bi-dash');
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    // fetchKpis nunca resuelve en este test — verificamos el estado de carga
    fetchKpisSpy.mockReturnValueOnce(new Promise(vi.fn()));

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando KPIs');
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  it('debe mostrar mensaje de sin métricas cuando el arreglo está vacío', async () => {
    fetchKpisSpy.mockResolvedValueOnce([]);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin métricas disponibles');
    });

    expect(container.querySelector('.row')).toBeNull();
  });

  // ── Estado de error + reintento ───────────────────────────────────────────────

  it('debe mostrar alerta de error y botón de reintento cuando fetchKpis falla', async () => {
    fetchKpisSpy.mockRejectedValueOnce(new Error('Error 500: Internal Server Error'));

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#kpi-retry-btn')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('alert-danger');
    expect(container.innerHTML).toContain('Error al cargar los KPIs');
    expect(container.querySelector('#kpi-retry-btn')).not.toBeNull();
  });

  it('debe reintentar la carga al hacer clic en el botón de reintento', async () => {
    // Primer intento falla, segundo resuelve
    fetchKpisSpy.mockRejectedValueOnce(new Error('Error 503')).mockResolvedValueOnce(mockKpis);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    // Esperar que aparezca el botón de reintento
    await vi.waitFor(() => {
      expect(container.querySelector('#kpi-retry-btn')).not.toBeNull();
    });

    // Hacer clic en reintento
    const retryBtn = container.querySelector<HTMLButtonElement>('#kpi-retry-btn');
    retryBtn?.click();

    // Esperar que se rendericen las tarjetas
    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    // El spy debe haberse llamado dos veces
    expect(fetchKpisSpy).toHaveBeenCalledTimes(2);
  });

  it('debe usar { once: true } — el botón de reintento no acumula listeners', async () => {
    fetchKpisSpy
      .mockRejectedValueOnce(new Error('Error 503'))
      .mockRejectedValueOnce(new Error('Error 503'))
      .mockResolvedValueOnce(mockKpis);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#kpi-retry-btn')).not.toBeNull();
    });

    // Primer reintento — falla de nuevo
    container.querySelector<HTMLButtonElement>('#kpi-retry-btn')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#kpi-retry-btn')).not.toBeNull();
    });

    // Segundo reintento — éxito
    container.querySelector<HTMLButtonElement>('#kpi-retry-btn')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('.row')).not.toBeNull();
    });

    expect(fetchKpisSpy).toHaveBeenCalledTimes(3);
  });

  it('no debe mostrar error cuando la señal es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    fetchKpisSpy.mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    renderKpiCards(container, controller.signal);

    await vi.waitFor(() => {
      // Debe quedarse en estado vacío (el spinner fue sobreescrito por el abort)
      expect(fetchKpisSpy).toHaveBeenCalledOnce();
    });

    // No debe mostrar error — AbortError se suprime silenciosamente
    expect(container.innerHTML).not.toContain('alert-danger');
  });
});
