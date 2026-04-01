import type { AuditFields } from '../common/audit';

/** Ubicación física dentro de un almacén */
export type Ubicacion = AuditFields & {
  id: string;
  codigo: string;
  nombre: string;
  almacenId: string;
  almacenNombre: string;
  tipo: 'rack' | 'estante' | 'piso' | 'mezzanine';
  capacidad?: number;
  status: 'active' | 'inactive';
};

/** DTO para crear una ubicación */
export type CreateUbicacionDto = Omit<Ubicacion, 'id' | keyof AuditFields>;

/** DTO para actualizar una ubicación */
export type UpdateUbicacionDto = Partial<CreateUbicacionDto>;
