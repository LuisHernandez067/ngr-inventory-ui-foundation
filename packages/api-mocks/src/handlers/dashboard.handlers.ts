import type { DashboardData } from '@ngr-inventory/api-contracts';
import { http, HttpResponse, delay } from 'msw';

import { resolveScenario } from '../scenarios/error-scenarios';

// Tipos locales que espeja los contratos de prototype-shell/dashboard/types.ts
// Se duplican aquí para no cruzar el límite packages/ → apps/ en el monorepo.

/** Métrica KPI del dashboard */
interface KpiMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent?: number;
  icon: string;
  colorClass: string;
}

/** Alerta operacional del dashboard */
interface DashboardAlert {
  id: string;
  tipo: 'bajo-stock' | 'orden-pendiente' | 'conteo-vencido';
  severity: 'danger' | 'warning' | 'info';
  titulo: string;
  descripcion: string;
  enlace?: string;
}

/** Fila de movimiento reciente */
interface MovementRow {
  id: string;
  numero: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  descripcion: string;
  usuario: string;
  fecha: string;
}

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
      unit: 'COP',
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

/** Métricas KPI granulares para el endpoint /api/dashboard/kpis */
const kpiMetrics: KpiMetric[] = [
  {
    id: 'kpi-productos-activos',
    label: 'Productos activos',
    value: 148,
    unit: 'productos',
    trend: 'up',
    trendPercent: 8.3,
    icon: 'bi-box-seam',
    colorClass: 'text-primary',
  },
  {
    id: 'kpi-movimientos-mes',
    label: 'Movimientos del mes',
    value: 34,
    unit: 'movimientos',
    trend: 'up',
    trendPercent: 12.0,
    icon: 'bi-arrow-left-right',
    colorClass: 'text-success',
  },
  {
    id: 'kpi-valor-stock',
    label: 'Valor del stock',
    value: 3850000,
    unit: 'COP',
    trend: 'down',
    trendPercent: 2.5,
    icon: 'bi-currency-dollar',
    colorClass: 'text-warning',
  },
  {
    id: 'kpi-alertas-activas',
    label: 'Alertas activas',
    value: 4,
    unit: 'alertas',
    trend: 'stable',
    icon: 'bi-exclamation-triangle',
    colorClass: 'text-danger',
  },
  {
    id: 'kpi-almacenes',
    label: 'Almacenes activos',
    value: 3,
    unit: 'almacenes',
    trend: 'stable',
    icon: 'bi-building',
    colorClass: 'text-info',
  },
  {
    id: 'kpi-conteos-pendientes',
    label: 'Conteos pendientes',
    value: 2,
    unit: 'conteos',
    trend: 'up',
    trendPercent: 100,
    icon: 'bi-clipboard-check',
    colorClass: 'text-secondary',
  },
];

/** Alertas operacionales para el endpoint /api/dashboard/alerts */
const dashboardAlerts: DashboardAlert[] = [
  {
    id: 'alert-001',
    tipo: 'bajo-stock',
    severity: 'danger',
    titulo: 'Stock crítico: Silla Ergonómica Gamer',
    descripcion: 'Stock actual (1) por debajo del mínimo (2) en Depósito Central.',
    enlace: '#/stock',
  },
  {
    id: 'alert-002',
    tipo: 'bajo-stock',
    severity: 'warning',
    titulo: 'Stock bajo: Auriculares con Micrófono',
    descripcion: 'Stock actual (3) por debajo del mínimo (5) en Depósito Central.',
    enlace: '#/stock',
  },
  {
    id: 'alert-003',
    tipo: 'orden-pendiente',
    severity: 'warning',
    titulo: 'Movimiento pendiente de confirmación',
    descripcion: 'El movimiento MOV-2026-0031 lleva más de 48hs en estado borrador.',
    enlace: '#/movimientos',
  },
  {
    id: 'alert-004',
    tipo: 'conteo-vencido',
    severity: 'info',
    titulo: 'Conteo de inventario vencido',
    descripcion: 'El conteo del Almacén Norte venció el 28/03/2026. Reprogramar.',
    enlace: '#/conteos',
  },
];

/** Movimientos recientes para el endpoint /api/dashboard/movements */
const recentMovements: MovementRow[] = [
  {
    id: 'mov-001',
    numero: 'MOV-2026-0034',
    tipo: 'entrada',
    descripcion: 'Recepción de mercadería — Proveedor TechZone',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-31T16:45:00Z',
  },
  {
    id: 'mov-002',
    numero: 'MOV-2026-0033',
    tipo: 'salida',
    descripcion: 'Entrega a sector Administración — 5 unidades Monitor LED',
    usuario: 'admin@ngr.com',
    fecha: '2026-03-31T14:20:00Z',
  },
  {
    id: 'mov-003',
    numero: 'MOV-2026-0032',
    tipo: 'transferencia',
    descripcion: 'Transferencia Depósito Central → Almacén Norte — Teclados',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-31T10:05:00Z',
  },
  {
    id: 'mov-004',
    numero: 'MOV-2026-0031',
    tipo: 'ajuste',
    descripcion: 'Ajuste de inventario por conteo físico — diferencia de 2 unidades',
    usuario: 'admin@ngr.com',
    fecha: '2026-03-30T17:30:00Z',
  },
  {
    id: 'mov-005',
    numero: 'MOV-2026-0030',
    tipo: 'entrada',
    descripcion: 'Reposición Cámara Web Full HD — 10 unidades',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-30T11:15:00Z',
  },
  {
    id: 'mov-006',
    numero: 'MOV-2026-0029',
    tipo: 'salida',
    descripcion: 'Préstamo a evento externo — 2 proyectores',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-29T09:50:00Z',
  },
  {
    id: 'mov-007',
    numero: 'MOV-2026-0028',
    tipo: 'ajuste',
    descripcion: 'Corrección por error de carga — Auriculares con Micrófono',
    usuario: 'admin@ngr.com',
    fecha: '2026-03-28T16:00:00Z',
  },
  {
    id: 'mov-008',
    numero: 'MOV-2026-0027',
    tipo: 'entrada',
    descripcion: 'Compra de insumos de oficina — resmas y bolígrafos',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-28T10:30:00Z',
  },
  {
    id: 'mov-009',
    numero: 'MOV-2026-0026',
    tipo: 'transferencia',
    descripcion: 'Transferencia Almacén Norte → Depósito Central — Sillas',
    usuario: 'operador@ngr.com',
    fecha: '2026-03-27T15:45:00Z',
  },
  {
    id: 'mov-010',
    numero: 'MOV-2026-0025',
    tipo: 'salida',
    descripcion: 'Descarte de equipos en desuso — 3 monitores obsoletos',
    usuario: 'admin@ngr.com',
    fecha: '2026-03-27T11:20:00Z',
  },
];

/** Handler del dashboard — retorna KPIs y alertas de bajo stock */
export const dashboardHandlers = [
  http.get('/api/dashboard', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    return HttpResponse.json({ ...dashboardData, updatedAt: new Date().toISOString() });
  }),

  // GET /api/dashboard/kpis — métricas KPI individuales por widget
  http.get('/api/dashboard/kpis', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    await delay(300);
    return HttpResponse.json(kpiMetrics);
  }),

  // GET /api/dashboard/alerts — alertas operacionales activas
  http.get('/api/dashboard/alerts', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    await delay(250);
    return HttpResponse.json(dashboardAlerts);
  }),

  // GET /api/dashboard/movements — movimientos recientes de inventario
  http.get('/api/dashboard/movements', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    await delay(400);
    return HttpResponse.json(recentMovements);
  }),
];
