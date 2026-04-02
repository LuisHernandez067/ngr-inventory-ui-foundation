import type { Ubicacion, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { ubicacionFixtures } from '../fixtures/ubicaciones.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let ubicaciones = [...ubicacionFixtures];

/** Handlers CRUD para el módulo de ubicaciones — soporta filtro por ?almacenId= */
export const ubicacionesHandlers = [
  // GET /api/ubicaciones — lista paginada con búsqueda y filtro por almacén
  http.get('/api/ubicaciones', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const almacenId = url.searchParams.get('almacenId') ?? '';

    let filtered = almacenId ? ubicaciones.filter((u) => u.almacenId === almacenId) : ubicaciones;

    if (search) {
      filtered = filtered.filter(
        (u) => u.nombre.toLowerCase().includes(search) || u.codigo.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Ubicacion> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/ubicaciones/:id — detalle de una ubicación
  http.get('/api/ubicaciones/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const ubicacion = ubicaciones.find((u) => u.id === params['id']);
    if (!ubicacion) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Ubicación no encontrada',
        status: 404,
        detail: `No existe una ubicación con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(ubicacion);
  }),

  // POST /api/ubicaciones — crear nueva ubicación
  http.post('/api/ubicaciones', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Ubicacion>;
    const nueva: Ubicacion = {
      id: `ubi-${String(Date.now()).slice(-6)}`,
      codigo: body.codigo ?? 'UBI-NEW',
      nombre: body.nombre ?? 'Nueva Ubicación',
      almacenId: body.almacenId ?? 'alm-001',
      almacenNombre: body.almacenNombre ?? 'Sin almacén',
      tipo: body.tipo ?? 'estante',
      // Propiedades opcionales: solo se incluyen si el body las provee
      ...(body.capacidad !== undefined ? { capacidad: body.capacidad } : {}),
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    ubicaciones = [...ubicaciones, nueva];
    return HttpResponse.json(nueva, { status: 201 });
  }),

  // PUT /api/ubicaciones/:id — actualizar ubicación existente
  http.put('/api/ubicaciones/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    // Busca la ubicación y retorna 404 si no existe
    const base = ubicaciones.find((u) => u.id === params['id']);
    if (!base) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Ubicación no encontrada',
        status: 404,
        detail: `No existe una ubicación con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Ubicacion>;
    const actualizada: Ubicacion = {
      ...base,
      ...body,
      id: base.id,
      // Campos de auditoría requeridos: se preservan del registro original
      createdAt: base.createdAt,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    ubicaciones = ubicaciones.map((u) => (u.id === base.id ? actualizada : u));
    return HttpResponse.json(actualizada);
  }),

  // DELETE /api/ubicaciones/:id — eliminar ubicación
  http.delete('/api/ubicaciones/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = ubicaciones.findIndex((u) => u.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Ubicación no encontrada',
        status: 404,
        detail: `No existe una ubicación con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    ubicaciones = ubicaciones.filter((u) => u.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
