/** Alerta de producto con bajo nivel de stock */
export interface AlertaBajoStock {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  almacenId: string;
  almacenNombre: string;
}

/** Indicador clave de rendimiento del dashboard */
export interface DashboardKPI {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
}

/** Datos completos del dashboard principal */
export interface DashboardData {
  kpis: DashboardKPI[];
  alertasBajoStock: AlertaBajoStock[];
  updatedAt: string; // ISO 8601
}
