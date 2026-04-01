import { http, HttpResponse } from 'msw';
import type { DashboardData } from '@ngr-inventory/api-contracts';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Datos fijos del dashboard para el mock */
const dashboardData: DashboardData = {
  kpis: [
    {
      label: 'Total de Productos',
      value: 12,
      unit: 'productos',
      trend: 'up',
      trendPercent: 8.3,
    },
    {
      label: 'Movimientos del Mes',
      value: 28,
      unit: 'movimientos',
      trend: 'up',
      trendPercent: 12.0,
    },
    {
      label: 'Valor del Stock',
      value: 3850000,
      unit: 'ARS',
      trend: 'down',
      trendPercent: -2.5,
    },
    {
      label: 'Alertas de Stock',
      value: 3,
      unit: 'alertas',
      trend: 'stable',
    },
  ],
  alertasBajoStock: [
    {
      productoId: 'prod-003',
      productoCodigo: 'SIL-ERG-001',
      productoNombre: 'Silla Ergonómica Gamer',
      stockActual: 1,
      stockMinimo: 2,
      almacenId: 'alm-001',
      almacenNombre: 'Depósito Central',
    },
    {
      productoId: 'prod-007',
      productoCodigo: 'AUR-MIC-001',
      productoNombre: 'Auriculares con Micrófono',
      stockActual: 3,
      stockMinimo: 5,
      almacenId: 'alm-001',
      almacenNombre: 'Depósito Central',
    },
    {
      productoId: 'prod-008',
      productoCodigo: 'CAM-FHD-001',
      productoNombre: 'Cámara Web Full HD',
      stockActual: 2,
      stockMinimo: 3,
      almacenId: 'alm-001',
      almacenNombre: 'Depósito Central',
    },
  ],
  updatedAt: new Date().toISOString(),
};

/** Handler del dashboard — retorna KPIs y alertas de bajo stock */
export const dashboardHandlers = [
  http.get('/api/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    return HttpResponse.json({ ...dashboardData, updatedAt: new Date().toISOString() });
  }),
];
