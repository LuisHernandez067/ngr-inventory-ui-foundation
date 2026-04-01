import { http, HttpResponse } from 'msw';
import type { LoginRequest, LoginResponse, AuthUser } from '@ngr-inventory/api-contracts';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Usuario autenticado para el mock — se usa en GET /api/auth/me */
const mockAuthUser: AuthUser = {
  id: 'usr-001',
  email: 'admin@ngr.com',
  nombre: 'Roberto Fernández',
  roles: ['Administrador'],
  permisos: [
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
  ],
};

/** Handlers de autenticación — login, logout y usuario actual */
export const authHandlers = [
  // POST /api/auth/login — retorna token o 401 si el email contiene "invalid"
  http.post('/api/auth/login', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as LoginRequest;

    if (body.email.includes('invalid')) {
      return HttpResponse.json(
        {
          type: '/errors/unauthorized',
          title: 'Credenciales inválidas',
          status: 401,
          detail: 'El email o contraseña son incorrectos',
        },
        { status: 401 }
      );
    }

    const response: LoginResponse = {
      user: { ...mockAuthUser, email: body.email },
      token: 'mock-jwt-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  // POST /api/auth/logout — retorna 204 sin contenido
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/auth/me — retorna el usuario autenticado actual
  http.get('/api/auth/me', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    return HttpResponse.json(mockAuthUser);
  }),
];
