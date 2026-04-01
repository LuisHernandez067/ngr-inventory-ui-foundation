import { http, HttpResponse } from 'msw';
import type { KardexEntry, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { kardexFixtures } from '../fixtures/kardex.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Handlers de solo lectura para el módulo de kardex */
export const kardexHandlers = [
  // GET /api/kardex — lista paginada filtrada por productoId (requerido)
  http.get('/api/kardex', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const productoId = url.searchParams.get('productoId') ?? '';
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');

    // productoId es requerido — retorna lista vacía si no se provee
    if (!productoId) {
      const response: PaginatedResponse<KardexEntry> = {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
      return HttpResponse.json(response);
    }

    const filtered = kardexFixtures.filter((k) => k.productoId === productoId);

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<KardexEntry> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),
];
