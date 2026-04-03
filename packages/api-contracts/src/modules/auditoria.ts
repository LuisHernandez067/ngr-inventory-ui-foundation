/** Tipo de acción registrada en la auditoría */
export type TipoAccionAuditoria =
  | 'crear'
  | 'actualizar'
  | 'eliminar'
  | 'login'
  | 'logout'
  | 'exportar';

/** Entrada del registro de auditoría del sistema */
export interface AuditoriaEntry {
  id: string;
  fecha: string; // ISO 8601
  usuarioId: string;
  usuarioEmail: string;
  accion: TipoAccionAuditoria;
  modulo: string;
  entidadId?: string;
  entidadTipo?: string;
  descripcion: string;
  ipAddress?: string;
  datosAnteriores?: unknown;
  datosNuevos?: unknown;
}
