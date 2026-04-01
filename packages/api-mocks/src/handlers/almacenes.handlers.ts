import type { Almacen, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { almacenFixtures } from '../fixtures/almacenes.fixtures';
import { ubicacionFixtures } from '../fixtures/ubicaciones.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let almacenes = [...almacenFixtures];

/** Handlers CRUD para el módulo de almacenes */
export const almacenesHandlers = [
  // GET /api/almacenes — lista paginada con búsqueda y filtro de status
  http.get('/api/almacenes', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const status = url.searchParams.get('status') ?? '';

    let filtered = almacenes;

    // Filtrar por status si se especifica (active o inactive)
    if (status === 'active' || status === 'inactive') {
      filtered = filtered.filter((a) => a.status === status);
    }

    // Filtrar por búsqueda en nombre o código
    if (search) {
      filtered = filtered.filter(
        (a) => a.nombre.toLowerCase().includes(search) || a.codigo.toLowerCase().includes(search)
      );
    }

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

  // GET /api/almacenes/:id — detalle de un almacén con ubicacionCount
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

    // Calcular la cantidad de ubicaciones asociadas a este almacén
    const ubicacionCount = ubicacionFixtures.filter((u) => u.almacenId === params['id']).length;

    return HttpResponse.json({ ...almacen, ubicacionCount });
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
    // idx fue verificado arriba — la entrada existe; el check siguiente satisface noUncheckedIndexedAccess
    const existente = almacenes[idx];
    if (!existente)
      return HttpResponse.json(
        {
          type: '/errors/not-found',
          title: 'Almacén no encontrado',
          status: 404,
        } as ProblemDetails,
        { status: 404 }
      );
    const actualizado: Almacen = {
      ...existente,
      ...body,
      id: existente.id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    almacenes = almacenes.map((a, i) => (i === idx ? actualizado : a));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/almacenes/:id — eliminar almacén (409 si tiene ubicaciones)
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

    // Verificar si el almacén tiene ubicaciones asociadas — retornar 409 si las tiene
    const ubicacionCount = ubicacionFixtures.filter((u) => u.almacenId === params['id']).length;
    if (ubicacionCount > 0) {
      const err: ProblemDetails = {
        type: '/errors/conflict',
        title: 'No se puede eliminar el almacén',
        status: 409,
        detail: `El almacén tiene ${String(ubicacionCount)} ubicación(es) asociada(s). Eliminelas primero.`,
      };
      return HttpResponse.json(err, { status: 409 });
    }

    almacenes = almacenes.filter((a) => a.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
