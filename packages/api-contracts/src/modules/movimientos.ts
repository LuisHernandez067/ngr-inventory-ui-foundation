import type { AuditFields } from '../common/audit';

/** Tipo de movimiento de inventario */
export type TipoMovimiento = 'entrada' | 'salida' | 'transferencia' | 'ajuste' | 'devolucion';

/** Estado del movimiento en su ciclo de vida */
export type EstadoMovimiento = 'borrador' | 'pendiente' | 'aprobado' | 'ejecutado' | 'anulado';

/** Ítem individual dentro de un movimiento */
export interface MovimientoItem {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  lote?: string;
  vencimiento?: string; // ISO 8601
}

/** Movimiento de inventario completo */
export type Movimiento = AuditFields & {
  id: string;
  numero: string;
  tipo: TipoMovimiento;
  estado: EstadoMovimiento;
  almacenOrigenId?: string;
  almacenOrigenNombre?: string;
  almacenDestinoId?: string;
  almacenDestinoNombre?: string;
  proveedorId?: string;
  proveedorNombre?: string;
  items: MovimientoItem[];
  observacion?: string;
  fechaEjecucion?: string; // ISO 8601
};

/** DTO para crear un movimiento */
export type CreateMovimientoDto = Omit<Movimiento, 'id' | 'numero' | keyof AuditFields>;

/** DTO para actualizar un movimiento */
export type UpdateMovimientoDto = Partial<CreateMovimientoDto>;
