import type { AuditFields } from '../common/audit';

/** Categoría de productos */
export type Categoria = AuditFields & {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  parentId?: string;
  status: 'active' | 'inactive';
};

/** DTO para crear una categoría */
export type CreateCategoriaDto = Omit<Categoria, 'id' | keyof AuditFields>;

/** DTO para actualizar una categoría */
export type UpdateCategoriaDto = Partial<CreateCategoriaDto>;
