import type { AuditFields } from '../common/audit';

/** Estado del ciclo de vida de un producto */
export type NgrProductoStatus = 'active' | 'inactive' | 'discontinued';

/** Entidad completa de producto */
export type Producto = AuditFields & {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId: string;
  categoriaNombre: string;
  proveedorId?: string;
  proveedorNombre?: string;
  unidadMedida: string;
  precioUnitario: number;
  stockMinimo: number;
  stockMaximo?: number;
  status: NgrProductoStatus;
};

/** Vista resumida de producto para listados */
export type ProductoListItem = Omit<Producto, 'descripcion'>;

/** DTO para crear un nuevo producto */
export type CreateProductoDto = Omit<
  Producto,
  'id' | 'categoriaNombre' | 'proveedorNombre' | keyof AuditFields
>;

/** DTO para actualizar un producto existente */
export type UpdateProductoDto = Partial<CreateProductoDto>;
