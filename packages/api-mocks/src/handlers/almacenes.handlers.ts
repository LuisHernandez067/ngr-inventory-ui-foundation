import { http, HttpResponse } from 'msw';
import type { Almacen, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { almacenFixtures } from '../fixtures/almacenes.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let almacenes = [...almacenFixtures];

/** Handlers CRUD para el módulo de almacenes */
export const almacenesHandlers = [
  // GET /api/almacenes — lista paginada con búsqueda
  http.get('/api/almacenes', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? almacenes.filter(
          (a) => a.nombre.toLowerCase().includes(search) || a.codigo.toLowerCase().includes(search)
        )
      : almacenes;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Almacen> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/almacenes/:id — detalle de un almacén
  http.get('/api/almacenes/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const almacen = almacenes.find((a) => a.id === params['id']);
    if (!almacen) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Almacén no encontrado',
        status: 404,
        detail: `No existe un almacén con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(almacen);
  }),

  // POST /api/almacenes — crear nuevo almacén
  http.post('/api/almacenes', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Almacen>;
    const nuevo: Almacen = {
      id: `alm-${String(Date.now()).slice(-6)}`,
      codigo: body.codigo ?? 'ALM-NEW',
      nombre: body.nombre ?? 'Nuevo Almacén',
      descripcion: body.descripcion,
      direccion: body.direccion,
      responsableId: body.responsableId,
      responsableNombre: body.responsableNombre,
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    almacenes = [...almacenes, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/almacenes/:id — actualizar almacén existente
  http.put('/api/almacenes/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = almacenes.findIndex((a) => a.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Almacén no encontrado',
        status: 404,
        detail: `No existe un almacén con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Almacen>;
    const actualizado: Almacen = {
      ...almacenes[idx],
      ...body,
      id: almacenes[idx].id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    almacenes = almacenes.map((a, i) => (i === idx ? actualizado : a));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/almacenes/:id — eliminar almacén
  http.delete('/api/almacenes/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = almacenes.findIndex((a) => a.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Almacén no encontrado',
        status: 404,
        detail: `No existe un almacén con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    almacenes = almacenes.filter((a) => a.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
