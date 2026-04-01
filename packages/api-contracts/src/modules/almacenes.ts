import type { AuditFields } from '../common/audit';

/** Almacén físico de inventario */
export type Almacen = AuditFields & {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  direccion?: string;
  responsableId?: string;
  responsableNombre?: string;
  status: 'active' | 'inactive';
  /** Cantidad de ubicaciones asociadas — incluido solo en respuesta GET /api/almacenes/:id */
  ubicacionCount?: number;
};

/** DTO para crear un almacén */
export type CreateAlmacenDto = Omit<Almacen, 'id' | keyof AuditFields>;

/** DTO para actualizar un almacén */
export type UpdateAlmacenDto = Partial<CreateAlmacenDto>;
