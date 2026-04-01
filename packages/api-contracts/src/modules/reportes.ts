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

/** Definición de un reporte disponible en el sistema */
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
