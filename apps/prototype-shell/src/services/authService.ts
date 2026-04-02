// Servicio de autenticación del prototipo — fuente única de verdad para el estado de sesión
// Gestiona las claves de localStorage y emite eventos personalizados para notificar cambios

// Claves de localStorage para el estado de autenticación
const KEYS = {
  token: 'ngr_auth_token',
  profile: 'ngr_auth_profile',
  user: 'ngr_auth_user',
} as const;

export interface AuthUser {
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Operador' | 'Consulta';
  perfil: 'admin' | 'operador' | 'consulta';
}

// Mapa de módulos permitidos por perfil
// 'all' significa acceso a todos los módulos disponibles
const PERMISSIONS: Record<string, string[] | 'all'> = {
  admin: 'all',
  operador: [
    'productos',
    'categorias',
    'almacenes',
    'ubicaciones',
    'movimientos',
    'stock',
    'kardex',
    'conteos',
  ],
  consulta: ['productos', 'stock', 'reportes'],
};

// Referencia al temporizador de sesión activo — null si no hay ninguno
// Se usa `number` explícito porque window.setTimeout retorna number en el DOM
let sessionTimerHandle: number | null = null;

// Singleton de autenticación del prototipo
export const authService = {
  login(user: AuthUser, token: string): void {
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.profile, user.perfil);
    localStorage.setItem(KEYS.user, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('ngr:auth-change'));
  },

  logout(): void {
    localStorage.removeItem(KEYS.token);
    localStorage.removeItem(KEYS.profile);
    localStorage.removeItem(KEYS.user);
    authService.clearSessionTimer();
    window.dispatchEvent(new CustomEvent('ngr:auth-change'));
  },

  isAuthenticated(): boolean {
    return localStorage.getItem(KEYS.token) !== null;
  },

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  getProfile(): 'admin' | 'operador' | 'consulta' | null {
    const p = localStorage.getItem(KEYS.profile);
    if (p === 'admin' || p === 'operador' || p === 'consulta') return p;
    return null;
  },

  // Retorna los módulos permitidos para el perfil actual.
  // 'all' significa que no hay restricciones (perfil admin).
  getAllowedModules(): string[] | 'all' {
    const profile = authService.getProfile();
    if (!profile) return [];
    return PERMISSIONS[profile] ?? [];
  },

  // Inicia un temporizador de sesión. Emite ngr:session-expired después de N minutos.
  // Pasa 0 para desactivar.
  startSessionTimer(minutes: number): number | null {
    authService.clearSessionTimer();
    if (minutes <= 0) return null;
    sessionTimerHandle = window.setTimeout(
      () => {
        sessionTimerHandle = null;
        window.dispatchEvent(new CustomEvent('ngr:session-expired'));
      },
      minutes * 60 * 1000
    );
    return sessionTimerHandle;
  },

  // Cancela el temporizador de sesión activo si existe.
  clearSessionTimer(): void {
    if (sessionTimerHandle !== null) {
      clearTimeout(sessionTimerHandle);
      sessionTimerHandle = null;
    }
  },
};
