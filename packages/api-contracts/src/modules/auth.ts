/** Usuario autenticado en el sistema */
export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  permisos: string[];
}

/** Payload para inicio de sesión */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Respuesta al iniciar sesión exitosamente */
export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresAt: string; // ISO 8601
}
