/** Alerta de producto con bajo nivel de stock */
export type AlertaBajoStock = {
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  stockActual: number;
  stockMinimo: number;
  almacenId: string;
  almacenNombre: string;
};

/** Indicador clave de rendimiento del dashboard */
export type DashboardKPI = {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
};

/** Datos completos del dashboard principal */
export type DashboardData = {
  kpis: DashboardKPI[];
  alertasBajoStock: AlertaBajoStock[];
  updatedAt: string; // ISO 8601
};
