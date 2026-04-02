import type { Usuario, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { usuarioFixtures } from '../fixtures/usuarios.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let usuarios = [...usuarioFixtures];

/** Handlers CRUD para el módulo de usuarios */
export const usuariosHandlers = [
  // GET /api/usuarios — lista paginada con búsqueda
  http.get('/api/usuarios', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? usuarios.filter(
          (u) =>
            u.nombre.toLowerCase().includes(search) ||
            u.apellido.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        )
      : usuarios;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Usuario> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/usuarios/:id — detalle de un usuario
  http.get('/api/usuarios/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const usuario = usuarios.find((u) => u.id === params['id']);
    if (!usuario) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Usuario no encontrado',
        status: 404,
        detail: `No existe un usuario con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(usuario);
  }),

  // POST /api/usuarios — crear nuevo usuario
  http.post('/api/usuarios', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Usuario> & { password?: string };
    const nuevo: Usuario = {
      id: `usr-${String(Date.now()).slice(-6)}`,
      email: body.email ?? 'nuevo@ngr.com',
      nombre: body.nombre ?? 'Nuevo',
      apellido: body.apellido ?? 'Usuario',
      // Propiedades opcionales: solo se incluyen si el body las provee
      ...(body.telefono !== undefined ? { telefono: body.telefono } : {}),
      rolId: body.rolId ?? 'rol-003',
      rolNombre: body.rolNombre ?? 'Operario',
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    usuarios = [...usuarios, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/usuarios/:id — actualizar usuario existente
  http.put('/api/usuarios/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    // Busca el usuario y retorna 404 si no existe
    const base = usuarios.find((u) => u.id === params['id']);
    if (!base) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Usuario no encontrado',
        status: 404,
        detail: `No existe un usuario con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Usuario>;
    const actualizado: Usuario = {
      ...base,
      ...body,
      id: base.id,
      // Campos de auditoría requeridos: se preservan del registro original
      createdAt: base.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    usuarios = usuarios.map((u) => (u.id === base.id ? actualizado : u));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/usuarios/:id — eliminar usuario
  http.delete('/api/usuarios/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = usuarios.findIndex((u) => u.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Usuario no encontrado',
        status: 404,
        detail: `No existe un usuario con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    usuarios = usuarios.filter((u) => u.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
