import { http, HttpResponse } from 'msw';
import type { Proveedor, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { proveedorFixtures } from '../fixtures/proveedores.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let proveedores = [...proveedorFixtures];

/** Handlers CRUD para el módulo de proveedores */
export const proveedoresHandlers = [
  // GET /api/proveedores — lista paginada con búsqueda
  http.get('/api/proveedores', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? proveedores.filter(
          (p) =>
            p.razonSocial.toLowerCase().includes(search) ||
            p.codigo.toLowerCase().includes(search) ||
            p.ruc.includes(search)
        )
      : proveedores;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Proveedor> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/proveedores/:id — detalle de un proveedor
  http.get('/api/proveedores/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const proveedor = proveedores.find((p) => p.id === params['id']);
    if (!proveedor) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Proveedor no encontrado',
        status: 404,
        detail: `No existe un proveedor con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(proveedor);
  }),

  // POST /api/proveedores — crear nuevo proveedor
  http.post('/api/proveedores', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Proveedor>;
    const nuevo: Proveedor = {
      id: `prov-${String(Date.now()).slice(-6)}`,
      codigo: body.codigo ?? 'PROV-NEW',
      razonSocial: body.razonSocial ?? 'Nuevo Proveedor S.A.',
      ruc: body.ruc ?? '30-00000000-0',
      email: body.email,
      telefono: body.telefono,
      direccion: body.direccion,
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    proveedores = [...proveedores, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/proveedores/:id — actualizar proveedor existente
  http.put('/api/proveedores/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = proveedores.findIndex((p) => p.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Proveedor no encontrado',
        status: 404,
        detail: `No existe un proveedor con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Proveedor>;
    const actualizado: Proveedor = {
      ...proveedores[idx],
      ...body,
      id: proveedores[idx].id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    proveedores = proveedores.map((p, i) => (i === idx ? actualizado : p));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/proveedores/:id — eliminar proveedor
  http.delete('/api/proveedores/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = proveedores.findIndex((p) => p.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Proveedor no encontrado',
        status: 404,
        detail: `No existe un proveedor con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    proveedores = proveedores.filter((p) => p.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
