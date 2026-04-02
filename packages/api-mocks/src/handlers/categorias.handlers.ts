import type { Categoria, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { categoriaFixtures } from '../fixtures/categorias.fixtures';
import { productoFixtures } from '../fixtures/productos.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let categorias = [...categoriaFixtures];

/** Handlers CRUD para el módulo de categorías */
export const categoriasHandlers = [
  // GET /api/categorias — lista paginada con búsqueda
  http.get('/api/categorias', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? categorias.filter(
          (c) => c.nombre.toLowerCase().includes(search) || c.codigo.toLowerCase().includes(search)
        )
      : categorias;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Categoria> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/categorias/:id — detalle de una categoría
  http.get('/api/categorias/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const categoria = categorias.find((c) => c.id === params['id']);
    if (!categoria) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Categoría no encontrada',
        status: 404,
        detail: `No existe una categoría con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    // Calcular la cantidad de productos asociados a esta categoría
    const productoCount = productoFixtures.filter((p) => p.categoriaId === params['id']).length;

    return HttpResponse.json({ ...categoria, productoCount });
  }),

  // POST /api/categorias — crear nueva categoría
  http.post('/api/categorias', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Categoria>;
    const nueva: Categoria = {
      id: `cat-${String(Date.now()).slice(-6)}`,
      codigo: body.codigo ?? 'NEW-001',
      nombre: body.nombre ?? 'Nueva Categoría',
      // Campos opcionales: solo se incluyen si el body los provee
      ...(body.descripcion !== undefined ? { descripcion: body.descripcion } : {}),
      ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    categorias = [...categorias, nueva];
    return HttpResponse.json(nueva, { status: 201 });
  }),

  // PUT /api/categorias/:id — actualizar categoría existente
  http.put('/api/categorias/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = categorias.findIndex((c) => c.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Categoría no encontrada',
        status: 404,
        detail: `No existe una categoría con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Categoria>;
    // idx fue verificado arriba — la entrada existe; el check siguiente satisface noUncheckedIndexedAccess
    const existente = categorias[idx];
    if (!existente)
      return HttpResponse.json(
        {
          type: '/errors/not-found',
          title: 'Categoría no encontrada',
          status: 404,
        } as ProblemDetails,
        { status: 404 }
      );
    const actualizada: Categoria = {
      ...existente,
      ...body,
      id: existente.id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    categorias = categorias.map((c, i) => (i === idx ? actualizada : c));
    return HttpResponse.json(actualizada);
  }),

  // DELETE /api/categorias/:id — eliminar categoría
  http.delete('/api/categorias/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = categorias.findIndex((c) => c.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Categoría no encontrada',
        status: 404,
        detail: `No existe una categoría con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    categorias = categorias.filter((c) => c.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
