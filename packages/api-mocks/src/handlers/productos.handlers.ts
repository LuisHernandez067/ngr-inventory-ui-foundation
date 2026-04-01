import type { Producto, PaginatedResponse, ProblemDetails } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { productoFixtures } from '../fixtures/productos.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
let productos = [...productoFixtures];

/** Handlers CRUD para el módulo de productos */
export const productosHandlers = [
  // GET /api/productos — lista paginada con búsqueda
  http.get('/api/productos', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const statusFilter = url.searchParams.get('status');
    const categoriaIdFilter = url.searchParams.get('categoriaId');

    // Aplicar filtros compuestos: search + status + categoriaId (todos opcionales)
    const filtered = productos.filter((p) => {
      const matchesSearch =
        !search ||
        p.nombre.toLowerCase().includes(search) ||
        p.codigo.toLowerCase().includes(search);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesCategoriaId = !categoriaIdFilter || p.categoriaId === categoriaIdFilter;
      return matchesSearch && matchesStatus && matchesCategoriaId;
    });

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    const response: PaginatedResponse<Producto> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages,
    };

    return HttpResponse.json(response);
  }),

  // GET /api/productos/:id — detalle de un producto
  http.get('/api/productos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const producto = productos.find((p) => p.id === params['id']);
    if (!producto) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Producto no encontrado',
        status: 404,
        detail: `No existe un producto con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(producto);
  }),

  // POST /api/productos — crear nuevo producto
  http.post('/api/productos', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const body = (await request.json()) as Partial<Producto>;
    const nuevo: Producto = {
      id: `prod-${String(Date.now()).slice(-6)}`,
      codigo: body.codigo ?? 'NUEVO-001',
      nombre: body.nombre ?? 'Nuevo Producto',
      descripcion: body.descripcion,
      categoriaId: body.categoriaId ?? 'cat-001',
      categoriaNombre: body.categoriaNombre ?? 'Sin categoría',
      proveedorId: body.proveedorId,
      proveedorNombre: body.proveedorNombre,
      unidadMedida: body.unidadMedida ?? 'unidad',
      precioUnitario: body.precioUnitario ?? 0,
      stockMinimo: body.stockMinimo ?? 1,
      stockMaximo: body.stockMaximo,
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    productos = [...productos, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/productos/:id — actualizar producto existente
  http.put('/api/productos/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = productos.findIndex((p) => p.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Producto no encontrado',
        status: 404,
        detail: `No existe un producto con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Producto>;
    const actualizado: Producto = {
      ...productos[idx],
      ...body,
      id: productos[idx].id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    productos = productos.map((p, i) => (i === idx ? actualizado : p));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/productos/:id — eliminar producto
  http.delete('/api/productos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = productos.findIndex((p) => p.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Producto no encontrado',
        status: 404,
        detail: `No existe un producto con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    productos = productos.filter((p) => p.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),
];
