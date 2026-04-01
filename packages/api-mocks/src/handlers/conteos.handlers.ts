import { http, HttpResponse } from 'msw';
import type { Conteo, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { conteoFixtures } from '../fixtures/conteos.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let conteos = [...conteoFixtures];

/** Contador para generar números de conteo */
let conteoCounter = conteos.length + 1;

/** Handlers CRUD para el módulo de conteos físicos de inventario */
export const conteosHandlers = [
  // GET /api/conteos — lista paginada con búsqueda
  http.get('/api/conteos', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? conteos.filter(
          (c) =>
            c.numero.toLowerCase().includes(search) || c.descripcion.toLowerCase().includes(search)
        )
      : conteos;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Conteo> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/conteos/:id — detalle de un conteo
  http.get('/api/conteos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const conteo = conteos.find((c) => c.id === params['id']);
    if (!conteo) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(conteo);
  }),

  // POST /api/conteos — crear nuevo conteo
  http.post('/api/conteos', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Conteo>;
    const numero = `CNT-2025-${String(conteoCounter++).padStart(4, '0')}`;

    const nuevo: Conteo = {
      id: `cnt-${String(Date.now()).slice(-6)}`,
      numero,
      descripcion: body.descripcion ?? 'Nuevo conteo físico',
      almacenId: body.almacenId ?? 'alm-001',
      almacenNombre: body.almacenNombre ?? 'Sin almacén',
      estado: 'planificado',
      items: body.items ?? [],
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaFin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    conteos = [...conteos, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/conteos/:id — actualizar conteo existente
  http.put('/api/conteos/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = conteos.findIndex((c) => c.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Conteo>;
    const actualizado: Conteo = {
      ...conteos[idx],
      ...body,
      id: conteos[idx].id,
      numero: conteos[idx].numero,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    conteos = conteos.map((c, i) => (i === idx ? actualizado : c));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/conteos/:id — eliminar conteo
  http.delete('/api/conteos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = conteos.findIndex((c) => c.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    conteos = conteos.filter((c) => c.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
