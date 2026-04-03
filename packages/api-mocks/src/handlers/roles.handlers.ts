import type {
  Rol,
  Permiso,
  PermisosEfectivos,
  PaginatedResponse,
  ProblemDetails,
} from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { rolFixtures } from '../fixtures/roles.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/**
 * Catálogo completo de permisos del sistema, agrupados por módulo.
 * IDs y claves alineados 1-a-1 con los fixtures de roles existentes.
 */
export const PERMISOS_CATALOG: Permiso[] = [
  { id: 'perm-001', clave: 'productos.ver', nombre: 'Ver productos', modulo: 'productos' },
  { id: 'perm-002', clave: 'productos.crear', nombre: 'Crear productos', modulo: 'productos' },
  { id: 'perm-003', clave: 'productos.editar', nombre: 'Editar productos', modulo: 'productos' },
  {
    id: 'perm-004',
    clave: 'productos.eliminar',
    nombre: 'Eliminar productos',
    modulo: 'productos',
  },
  { id: 'perm-005', clave: 'movimientos.ver', nombre: 'Ver movimientos', modulo: 'movimientos' },
  {
    id: 'perm-006',
    clave: 'movimientos.crear',
    nombre: 'Crear movimientos',
    modulo: 'movimientos',
  },
  {
    id: 'perm-007',
    clave: 'movimientos.aprobar',
    nombre: 'Aprobar movimientos',
    modulo: 'movimientos',
  },
  { id: 'perm-008', clave: 'usuarios.ver', nombre: 'Ver usuarios', modulo: 'usuarios' },
  { id: 'perm-009', clave: 'usuarios.gestionar', nombre: 'Gestionar usuarios', modulo: 'usuarios' },
  { id: 'perm-010', clave: 'reportes.exportar', nombre: 'Exportar reportes', modulo: 'reportes' },
];

/** Copia mutable en memoria para simular persistencia entre requests */
let roles = [...rolFixtures];

/** Handlers CRUD para el módulo de roles y permisos */
export const rolesHandlers = [
  // GET /api/roles — lista paginada con búsqueda
  http.get('/api/roles', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search ? roles.filter((r) => r.nombre.toLowerCase().includes(search)) : roles;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Rol> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/roles/:id — detalle de un rol
  http.get('/api/roles/:id', ({ params, request }) => {
    const url = new URL(request.url);

    // Evitar capturar rutas con segmento siguiente como /permisos
    if (typeof params['id'] === 'string' && params['id'].includes('/')) {
      return undefined;
    }

    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const rol = roles.find((r) => r.id === params['id']);
    if (!rol) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Rol no encontrado',
        status: 404,
        detail: `No existe un rol con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(rol);
  }),

  // POST /api/roles — crear nuevo rol
  http.post('/api/roles', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Rol>;
    const nuevo: Rol = {
      id: `rol-${String(Date.now()).slice(-6)}`,
      nombre: body.nombre ?? 'Nuevo Rol',
      // Propiedades opcionales: solo se incluyen si el body las provee
      ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
      permisos: body.permisos ?? [],
      esAdmin: body.esAdmin ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    roles = [...roles, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/roles/:id — actualizar rol existente
  http.put('/api/roles/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    // Busca el rol y retorna 404 si no existe
    const base = roles.find((r) => r.id === params['id']);
    if (!base) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Rol no encontrado',
        status: 404,
        detail: `No existe un rol con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Rol>;
    const actualizado: Rol = {
      ...base,
      ...body,
      id: base.id,
      // Campos de auditoría requeridos: se preservan del registro original
      createdAt: base.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    roles = roles.map((r) => (r.id === base.id ? actualizado : r));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/roles/:id — eliminar rol
  http.delete('/api/roles/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = roles.findIndex((r) => r.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Rol no encontrado',
        status: 404,
        detail: `No existe un rol con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    roles = roles.filter((r) => r.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /api/permisos — catálogo completo de permisos del sistema
  http.get('/api/permisos', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    return HttpResponse.json(PERMISOS_CATALOG);
  }),

  // GET /api/roles/:id/permisos — permisos efectivos del rol
  http.get('/api/roles/:id/permisos', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const rol = roles.find((r) => r.id === params['id']);
    if (!rol) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Rol no encontrado',
        status: 404,
        detail: `No existe un rol con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const permisosEfectivos: PermisosEfectivos = {
      userId: String(params['id']),
      permisos: rol.permisos.map((p) => p.clave),
    };

    return HttpResponse.json(permisosEfectivos);
  }),
];
