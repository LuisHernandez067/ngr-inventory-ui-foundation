import type { StockItem, StockConsolidado, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { stockItemFixtures, stockConsolidadoFixtures } from '../fixtures/stock.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Handlers de solo lectura para el módulo de stock */
export const stockHandlers = [
  // GET /api/stock — lista paginada de StockItem por ubicación con filtros
  http.get('/api/stock', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const almacenId = url.searchParams.get('almacenId') ?? '';
    const productoId = url.searchParams.get('productoId') ?? '';
    const ubicacionId = url.searchParams.get('ubicacionId') ?? '';
    const bajoMinimo = url.searchParams.get('bajoMinimo') === 'true';

    let filtered = almacenId
      ? stockItemFixtures.filter((s) => s.almacenId === almacenId)
      : stockItemFixtures;

    // Filtrar por productoId cuando se especifica
    if (productoId) {
      filtered = filtered.filter((s) => s.productoId === productoId);
    }

    // Filtrar por ubicacionId cuando se especifica
    if (ubicacionId) {
      filtered = filtered.filter((s) => s.ubicacionId === ubicacionId);
    }

    // Filtrar solo ítems con stock bajo mínimo: cantidad === 0 si no hay umbral definido,
    // o cantidadDisponible <= 0 para simplificar (StockItem no tiene stockMinimo por ítem)
    if (bajoMinimo) {
      filtered = filtered.filter((s) => s.cantidadDisponible === 0);
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.productoNombre.toLowerCase().includes(search) ||
          s.productoCodigo.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<StockItem> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/stock/consolidado — stock consolidado por producto en todos los almacenes
  http.get('/api/stock/consolidado', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? stockConsolidadoFixtures.filter(
          (s) =>
            s.productoNombre.toLowerCase().includes(search) ||
            s.productoCodigo.toLowerCase().includes(search)
        )
      : stockConsolidadoFixtures;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<StockConsolidado> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),
];
