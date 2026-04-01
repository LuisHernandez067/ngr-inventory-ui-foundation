import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import * as apiFetchModule from '../_shared/apiFetch';

import { fetchKpis, fetchAlerts, fetchMovements } from './dashboardService';
import type { KpiMetric, DashboardAlert, MovementRow } from './types';

// Tests del servicio de datos del dashboard.
// Se mockea apiFetch para evitar dependencias de red — se verifica que:
//   1. Los helpers llaman al endpoint correcto con la señal correcta
//   2. El AbortError se propaga sin supresión
//   3. Los errores HTTP se propagan al llamador

describe('dashboardService.ts', () => {
  // Spy sobre apiFetch que sustituimos en cada caso
  let apiFetchSpy: MockInstance;

  beforeEach(() => {
    apiFetchSpy = vi.spyOn(apiFetchModule, 'apiFetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── fetchKpis() ──────────────────────────────────────────────────────────────

  describe('fetchKpis()', () => {
    it('debe llamar a /api/dashboard/kpis con la señal recibida', async () => {
      const mockKpis: KpiMetric[] = [
        {
          id: 'kpi-productos',
          label: 'Productos activos',
          value: 1247,
          trend: 'up',
          trendPercent: 3.5,
          icon: 'bi-box-seam',
          colorClass: 'text-primary',
        },
      ];

      apiFetchSpy.mockResolvedValueOnce(mockKpis);

      const controller = new AbortController();
      const result = await fetchKpis(controller.signal);

      expect(apiFetchSpy).toHaveBeenCalledOnce();
      expect(apiFetchSpy).toHaveBeenCalledWith('/api/dashboard/kpis', {
        signal: controller.signal,
      });
      expect(result).toEqual(mockKpis);
    });

    it('debe retornar un arreglo vacío cuando el endpoint responde con []', async () => {
      apiFetchSpy.mockResolvedValueOnce([]);

      const controller = new AbortController();
      const result = await fetchKpis(controller.signal);

      expect(result).toEqual([]);
    });

    it('debe propagar el AbortError cuando la señal es abortada', async () => {
      // Simular que apiFetch lanza DOMException con nombre AbortError
      const abortError = new DOMException('La petición fue cancelada', 'AbortError');
      apiFetchSpy.mockRejectedValueOnce(abortError);

      const controller = new AbortController();
      controller.abort();

      await expect(fetchKpis(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
      expect(apiFetchSpy).toHaveBeenCalledOnce();
    });

    it('debe propagar el error HTTP cuando el servidor responde con status no-ok', async () => {
      const httpError = new Error('Error 500: Internal Server Error');
      apiFetchSpy.mockRejectedValueOnce(httpError);

      const controller = new AbortController();

      await expect(fetchKpis(controller.signal)).rejects.toThrow('Error 500');
    });
  });

  // ── fetchAlerts() ────────────────────────────────────────────────────────────

  describe('fetchAlerts()', () => {
    it('debe llamar a /api/dashboard/alerts con la señal recibida', async () => {
      const mockAlerts: DashboardAlert[] = [
        {
          id: 'alert-001',
          tipo: 'bajo-stock',
          severity: 'warning',
          titulo: 'Stock bajo en Bodega Norte',
          descripcion: '3 productos por debajo del mínimo',
          enlace: '#/stock',
        },
      ];

      apiFetchSpy.mockResolvedValueOnce(mockAlerts);

      const controller = new AbortController();
      const result = await fetchAlerts(controller.signal);

      expect(apiFetchSpy).toHaveBeenCalledOnce();
      expect(apiFetchSpy).toHaveBeenCalledWith('/api/dashboard/alerts', {
        signal: controller.signal,
      });
      expect(result).toEqual(mockAlerts);
    });

    it('debe retornar un arreglo vacío cuando no hay alertas activas', async () => {
      apiFetchSpy.mockResolvedValueOnce([]);

      const controller = new AbortController();
      const result = await fetchAlerts(controller.signal);

      expect(result).toEqual([]);
    });

    it('debe propagar el AbortError cuando la señal es abortada', async () => {
      const abortError = new DOMException('La petición fue cancelada', 'AbortError');
      apiFetchSpy.mockRejectedValueOnce(abortError);

      const controller = new AbortController();
      controller.abort();

      await expect(fetchAlerts(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    });

    it('debe propagar el error HTTP cuando el servidor responde con status no-ok', async () => {
      const httpError = new Error('Error 503: Service Unavailable');
      apiFetchSpy.mockRejectedValueOnce(httpError);

      const controller = new AbortController();

      await expect(fetchAlerts(controller.signal)).rejects.toThrow('Error 503');
    });
  });

  // ── fetchMovements() ─────────────────────────────────────────────────────────

  describe('fetchMovements()', () => {
    it('debe llamar a /api/dashboard/movements con la señal recibida', async () => {
      const mockMovements: MovementRow[] = [
        {
          id: 'mov-001',
          numero: 'MOV-2024-001',
          tipo: 'entrada',
          descripcion: 'Recepción OC-2024-001',
          usuario: 'admin@ngr.com',
          fecha: '2024-03-31T14:30:00Z',
        },
      ];

      apiFetchSpy.mockResolvedValueOnce(mockMovements);

      const controller = new AbortController();
      const result = await fetchMovements(controller.signal);

      expect(apiFetchSpy).toHaveBeenCalledOnce();
      expect(apiFetchSpy).toHaveBeenCalledWith('/api/dashboard/movements', {
        signal: controller.signal,
      });
      expect(result).toEqual(mockMovements);
    });

    it('debe retornar un arreglo vacío cuando no hay movimientos recientes', async () => {
      apiFetchSpy.mockResolvedValueOnce([]);

      const controller = new AbortController();
      const result = await fetchMovements(controller.signal);

      expect(result).toEqual([]);
    });

    it('debe propagar el AbortError cuando la señal es abortada', async () => {
      const abortError = new DOMException('La petición fue cancelada', 'AbortError');
      apiFetchSpy.mockRejectedValueOnce(abortError);

      const controller = new AbortController();
      controller.abort();

      await expect(fetchMovements(controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    });

    it('debe propagar el error HTTP cuando el servidor responde con status no-ok', async () => {
      const httpError = new Error('Error 404: Not Found');
      apiFetchSpy.mockRejectedValueOnce(httpError);

      const controller = new AbortController();

      await expect(fetchMovements(controller.signal)).rejects.toThrow('Error 404');
    });
  });
});
