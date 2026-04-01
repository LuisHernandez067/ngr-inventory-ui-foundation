// Usuarios de demostración del prototipo — NO usar en producción
// Tres perfiles con diferentes niveles de acceso
export interface MockUser {
  email: string;
  password: string;
  perfil: 'admin' | 'operador' | 'consulta';
  nombre: string;
  rol: 'Administrador' | 'Operador' | 'Consulta';
}

export const MOCK_USERS: MockUser[] = [
  {
    email: 'administrador@ngr.com',
    password: 'admin123',
    perfil: 'admin',
    nombre: 'Ana García',
    rol: 'Administrador',
  },
  {
    email: 'operador@ngr.com',
    password: 'operador123',
    perfil: 'operador',
    nombre: 'Carlos López',
    rol: 'Operador',
  },
  {
    email: 'consulta@ngr.com',
    password: 'consulta123',
    perfil: 'consulta',
    nombre: 'María Rodríguez',
    rol: 'Consulta',
  },
];

// Busca un usuario por email y contraseña. Retorna null si no coincide.
export function findMockUser(email: string, password: string): MockUser | null {
  // Coincidencia exacta primero
  const exact = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (exact) return exact;

  // Fallback: cualquier @ngr.com + admin123 → perfil admin
  if (email.endsWith('@ngr.com') && password === 'admin123') {
    return { email, password, perfil: 'admin', nombre: email.split('@')[0], rol: 'Administrador' };
  }

  return null;
}
