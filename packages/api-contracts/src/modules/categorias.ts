import type { AuditFields } from '../common/audit';

/** Categoría de productos */
export type Categoria = AuditFields & {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  /** Cantidad de productos asociados — campo computado, solo presente en el detalle GET /:id */
  productoCount?: number;
};

/** DTO para crear una categoría */
export type CreateCategoriaDto = Omit<Categoria, 'id' | keyof AuditFields>;

/** DTO para actualizar una categoría */
export type UpdateCategoriaDto = Partial<CreateCategoriaDto>;
