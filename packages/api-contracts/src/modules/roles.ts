import type { AuditFields } from '../common/audit';

/** Permiso individual del sistema */
export type Permiso = {
  id: string;
  clave: string;
  nombre: string;
  modulo: string;
  descripcion?: string;
};

/** Rol de usuario con sus permisos asignados */
export type Rol = AuditFields & {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: Permiso[];
  esAdmin: boolean;
};

/** Permisos efectivos de un usuario (claves planas) */
export type PermisosEfectivos = {
  userId: string;
  permisos: string[]; // lista de claves de permisos
};

/** DTO para crear un rol */
export type CreateRolDto = Omit<Rol, 'id' | keyof AuditFields>;

/** DTO para actualizar un rol */
export type UpdateRolDto = Partial<CreateRolDto>;
