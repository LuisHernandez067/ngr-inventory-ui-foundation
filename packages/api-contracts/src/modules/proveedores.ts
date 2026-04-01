import type { AuditFields } from '../common/audit';

/** Proveedor de productos */
export type Proveedor = AuditFields & {
  id: string;
  codigo: string;
  razonSocial: string;
  ruc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  status: 'active' | 'inactive' | 'suspended';
};

/** DTO para crear un proveedor */
export type CreateProveedorDto = Omit<Proveedor, 'id' | keyof AuditFields>;

/** DTO para actualizar un proveedor */
export type UpdateProveedorDto = Partial<CreateProveedorDto>;
