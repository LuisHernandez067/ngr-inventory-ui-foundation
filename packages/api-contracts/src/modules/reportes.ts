import type { AuditFields } from '../common/audit';

/** Tipo de reporte disponible */
export type TipoReporte =
  | 'stock_actual'
  | 'kardex'
  | 'movimientos'
  | 'valorizado'
  | 'bajo_stock'
  | 'auditoria';

/** Formato de exportación soportado */
export type FormatoExportacion = 'pdf' | 'xlsx' | 'csv';

/**
 * Definición de un reporte disponible en el sistema.
 * Nota: se mantiene como `type` (no `interface`) para ser compatible con
 * `createListPage<T extends Record<string, unknown>>` — los object-type aliases
 * satisfacen esa restricción estructuralmente, las interfaces no.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReporteDefinicion = {
  id: string;
  nombre: string;
  tipo: TipoReporte;
  descripcion: string;
  formatos: FormatoExportacion[];
};

/** Job de exportación de un reporte */
export type ExportacionJob = AuditFields & {
  id: string;
  reporteId: string;
  formato: FormatoExportacion;
  estado: 'pendiente' | 'procesando' | 'listo' | 'error';
  url?: string;
};

// ---------------------------------------------------------------------------
// Filtros por tipo de reporte — discriminated union
// ---------------------------------------------------------------------------

/** Filtros para el reporte de stock actual */
export interface ReporteFilterStockActual {
  tipo: 'stock_actual';
  almacenId?: string;
}

/** Filtros para el reporte de kardex — productoId es requerido */
export interface ReporteFilterKardex {
  tipo: 'kardex';
  productoId: string;
  almacenId?: string;
  fechaDesde?: string; // ISO date string
  fechaHasta?: string;
}

/** Filtros para el reporte de movimientos del período */
export interface ReporteFilterMovimientos {
  tipo: 'movimientos';
  fechaDesde?: string;
  fechaHasta?: string;
  almacenId?: string;
  tipoMovimiento?: 'entrada' | 'salida' | 'transferencia' | 'ajuste';
}

/** Filtros para el reporte de productos bajo mínimo */
export interface ReporteFilterBajoStock {
  tipo: 'bajo_stock';
  umbral?: number; // si se omite, usa stockMinimo del producto
}

/** Unión discriminada de todos los filtros de reporte */
export type ReporteFilter =
  | ReporteFilterStockActual
  | ReporteFilterKardex
  | ReporteFilterMovimientos
  | ReporteFilterBajoStock;

// ---------------------------------------------------------------------------
// Respuesta de datos de reporte
// ---------------------------------------------------------------------------

/** Respuesta del endpoint GET /api/reportes/:id/datos */
export interface ReporteDatos<T = unknown> {
  reporteId: string;
  tipo: TipoReporte;
  filtrosAplicados: ReporteFilter;
  data: T[];
  total: number;
}
