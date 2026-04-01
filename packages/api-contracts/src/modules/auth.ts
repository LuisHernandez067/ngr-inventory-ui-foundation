/** Usuario autenticado en el sistema */
export type AuthUser = {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  permisos: string[];
};

/** Payload para inicio de sesión */
export type LoginRequest = {
  email: string;
  password: string;
};

/** Respuesta al iniciar sesión exitosamente */
export type LoginResponse = {
  user: AuthUser;
  token: string;
  expiresAt: string; // ISO 8601
};
