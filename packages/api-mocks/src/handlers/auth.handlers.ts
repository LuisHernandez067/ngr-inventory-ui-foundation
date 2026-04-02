import type { LoginRequest, LoginResponse, AuthUser } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { resolveScenario } from '../scenarios/error-scenarios';

// Credenciales de demo — duplicado intencional desde prototype-shell/mockUsers.ts
// No importar desde prototype-shell para evitar dependencia circular
interface DemoUser {
  email: string;
  password: string;
  perfil: 'admin' | 'operador' | 'consulta';
  nombre: string;
  rol: 'Administrador' | 'Operador' | 'Consulta';
}

const DEMO_CREDENTIALS: DemoUser[] = [
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

// Busca un usuario de demo por email y contraseña. Retorna null si no coincide.
function findDemoUser(email: string, password: string): DemoUser | null {
  // Coincidencia exacta primero
  const exact = DEMO_CREDENTIALS.find((u) => u.email === email && u.password === password);
  if (exact) return exact;

  // Fallback: cualquier @ngr.com + admin123 → perfil admin
  if (email.endsWith('@ngr.com') && password === 'admin123') {
    return {
      email,
      password,
      perfil: 'admin',
      nombre: email.split('@')[0] ?? email,
      rol: 'Administrador',
    };
  }

  return null;
}

// Construye el AuthUser a partir de un usuario de demo
function buildAuthUser(user: DemoUser): AuthUser {
  return {
    id: `usr-${user.perfil}`,
    email: user.email,
    nombre: user.nombre,
    roles: [user.rol],
    permisos: getPermisosByPerfil(user.perfil),
  };
}

// Devuelve los permisos según el perfil del usuario
function getPermisosByPerfil(perfil: DemoUser['perfil']): string[] {
  if (perfil === 'admin') {
    return [
      'productos.ver',
      'productos.crear',
      'productos.editar',
      'productos.eliminar',
      'movimientos.ver',
      'movimientos.crear',
      'movimientos.aprobar',
      'usuarios.ver',
      'usuarios.gestionar',
      'reportes.exportar',
    ];
  }
  if (perfil === 'operador') {
    return [
      'productos.ver',
      'productos.crear',
      'productos.editar',
      'movimientos.ver',
      'movimientos.crear',
    ];
  }
  // consulta — solo lectura
  return ['productos.ver', 'movimientos.ver'];
}

/** Handlers de autenticación — login, logout, usuario actual, recuperación de contraseña */
export const authHandlers = [
  // POST /api/auth/login — valida credenciales contra usuarios de demo
  http.post('/api/auth/login', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as LoginRequest;
    const demoUser = findDemoUser(body.email, body.password);

    if (!demoUser) {
      return HttpResponse.json(
        {
          type: '/errors/unauthorized',
          title: 'Credenciales inválidas',
          status: 401,
          detail: 'El email o contraseña son incorrectos.',
        },
        { status: 401 }
      );
    }

    const authUser = buildAuthUser(demoUser);
    const response: LoginResponse = {
      user: authUser,
      token: 'mock-token-xyz',
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // POST /api/auth/logout — retorna 204 sin contenido
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/auth/me — retorna el usuario actual basado en el token (simulado)
  http.get('/api/auth/me', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const auth = request.headers.get('Authorization');

    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { type: '/errors/unauthorized', title: 'No autenticado', status: 401 },
        { status: 401 }
      );
    }

    // Token simulado — en prototipo siempre devuelve el admin
    const adminUser = DEMO_CREDENTIALS.find((u) => u.perfil === 'admin');
    if (!adminUser) return new HttpResponse(null, { status: 500 });
    return HttpResponse.json(buildAuthUser(adminUser));
  }),

  // POST /api/auth/forgot-password — siempre responde 200, simula envío de email
  http.post('/api/auth/forgot-password', () => {
    return HttpResponse.json({
      message: 'Si el email existe, recibirás las instrucciones en breve.',
    });
  }),

  // POST /api/auth/reset-password — acepta cualquier contraseña válida (>= 8 chars)
  http.post('/api/auth/reset-password', async ({ request }) => {
    const body = (await request.json()) as { password?: string; token?: string };

    if (!body.password || body.password.length < 8) {
      return HttpResponse.json(
        {
          type: '/errors/unprocessable',
          title: 'Contraseña inválida',
          status: 422,
          detail: 'La contraseña debe tener al menos 8 caracteres.',
        },
        { status: 422 }
      );
    }

    return HttpResponse.json({ message: 'Contraseña actualizada correctamente.' });
  }),
];
