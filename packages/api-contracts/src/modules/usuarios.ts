import type { AuditFields } from '../common/audit';

/** Usuario del sistema */
export type Usuario = AuditFields & {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rolId: string;
  rolNombre: string;
  activo: boolean;
  ultimoAcceso?: string; // ISO 8601
};

/** DTO para crear un usuario */
export type CreateUsuarioDto = Omit<
  Usuario,
  'id' | 'rolNombre' | 'ultimoAcceso' | keyof AuditFields
> & { password: string };

/** DTO para actualizar un usuario (sin contraseña) */
export type UpdateUsuarioDto = Partial<Omit<CreateUsuarioDto, 'password'>>;
