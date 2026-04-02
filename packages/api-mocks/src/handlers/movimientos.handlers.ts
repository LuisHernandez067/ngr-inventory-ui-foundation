import type {
  EstadoMovimiento,
  Movimiento,
  PaginatedResponse,
  ProblemDetails,
} from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { movimientoFixtures } from '../fixtures/movimientos.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Copia mutable en memoria para simular persistencia entre requests */
export let movimientos = [...movimientoFixtures];

/** Contador para generar números de movimiento */
let movimientoCounter = movimientos.length + 1;

/** Mapa de transiciones de estado permitidas por la máquina de estados */
const ALLOWED: Record<EstadoMovimiento, EstadoMovimiento[]> = {
  borrador: ['pendiente', 'anulado'],
  pendiente: ['aprobado', 'borrador'],
  aprobado: ['ejecutado', 'anulado'],
  ejecutado: [],
  anulado: [],
};

/** Handlers CRUD para el módulo de movimientos de inventario */
export const movimientosHandlers = [
  // GET /api/movimientos — lista paginada con búsqueda
  http.get('/api/movimientos', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const tipo = url.searchParams.get('tipo') ?? '';
    const estado = url.searchParams.get('estado') ?? '';
    const fechaDesde = url.searchParams.get('fechaDesde') ?? '';
    const fechaHasta = url.searchParams.get('fechaHasta') ?? '';

    let filtered = movimientos;
    if (tipo) filtered = filtered.filter((m) => m.tipo === tipo);
    if (estado) filtered = filtered.filter((m) => m.estado === estado);
    if (fechaDesde) filtered = filtered.filter((m) => m.createdAt >= fechaDesde);
    if (fechaHasta) filtered = filtered.filter((m) => m.createdAt <= fechaHasta);
    if (search)
      filtered = filtered.filter(
        (m) => m.numero.toLowerCase().includes(search) || m.tipo.toLowerCase().includes(search)
      );

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<Movimiento> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/movimientos/:id — detalle de un movimiento
  http.get('/api/movimientos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const movimiento = movimientos.find((m) => m.id === params['id']);
    if (!movimiento) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Movimiento no encontrado',
        status: 404,
        detail: `No existe un movimiento con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    return HttpResponse.json(movimiento);
  }),

  // POST /api/movimientos — crear nuevo movimiento
  http.post('/api/movimientos', async ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    // Si el escenario es stock-insuficiente, retornar 422
    if (scenario === 'stock-insuficiente') {
      const err: ProblemDetails = {
        type: '/errors/stock-insuficiente',
        title: 'Stock insuficiente',
        status: 422,
        detail:
          'No hay suficiente stock disponible para ejecutar este movimiento. Verifique las cantidades solicitadas.',
      };
      return HttpResponse.json(err, { status: 422 });
    }

    const body = (await request.json()) as Partial<Movimiento>;
    const numero = `MOV-2025-${String(movimientoCounter++).padStart(4, '0')}`;

    const nuevo: Movimiento = {
      id: `mov-${String(Date.now()).slice(-6)}`,
      numero,
      tipo: body.tipo ?? 'entrada',
      estado: 'borrador',
      almacenOrigenId: body.almacenOrigenId,
      almacenOrigenNombre: body.almacenOrigenNombre,
      almacenDestinoId: body.almacenDestinoId,
      almacenDestinoNombre: body.almacenDestinoNombre,
      proveedorId: body.proveedorId,
      proveedorNombre: body.proveedorNombre,
      items: body.items ?? [],
      observacion: body.observacion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    movimientos = [...movimientos, nuevo];
    return HttpResponse.json(nuevo, { status: 201 });
  }),

  // PUT /api/movimientos/:id — actualizar movimiento existente
  http.put('/api/movimientos/:id', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = movimientos.findIndex((m) => m.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Movimiento no encontrado',
        status: 404,
        detail: `No existe un movimiento con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as Partial<Movimiento>;
    const actualizado: Movimiento = {
      ...movimientos[idx],
      ...body,
      id: movimientos[idx].id,
      numero: movimientos[idx].numero,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    movimientos = movimientos.map((m, i) => (i === idx ? actualizado : m));
    return HttpResponse.json(actualizado);
  }),

  // DELETE /api/movimientos/:id — eliminar movimiento
  http.delete('/api/movimientos/:id', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const idx = movimientos.findIndex((m) => m.id === params['id']);
    if (idx === -1) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Movimiento no encontrado',
        status: 404,
        detail: `No existe un movimiento con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    movimientos = movimientos.filter((m) => m.id !== params['id']);
    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /api/movimientos/:id/estado — transición de estado según máquina de estados
  http.patch('/api/movimientos/:id/estado', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');

    // Escenario especial: stock insuficiente al intentar ejecutar
    if (scenario === 'stock-insuficiente') {
      const err: ProblemDetails = {
        type: '/errors/stock-insuficiente',
        title: 'Stock insuficiente',
        status: 422,
        detail:
          'No hay suficiente stock disponible para ejecutar este movimiento. Verifique las cantidades solicitadas.',
      };
      return HttpResponse.json(err, { status: 422 });
    }

    const movimiento = movimientos.find((m) => m.id === params['id']);
    if (!movimiento) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Movimiento no encontrado',
        status: 404,
        detail: `No existe un movimiento con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as { estado: EstadoMovimiento };
    const estadoActual = movimiento.estado;
    const estadoNuevo = body.estado;

    // Validar que la transición está permitida
    if (!ALLOWED[estadoActual].includes(estadoNuevo)) {
      const err: ProblemDetails = {
        type: '/errors/conflict',
        title: 'Transición de estado no válida',
        status: 409,
        detail: `No se puede transicionar de "${estadoActual}" a "${estadoNuevo}".`,
      };
      return HttpResponse.json(err, { status: 409 });
    }

    const actualizado: Movimiento = {
      ...movimiento,
      estado: estadoNuevo,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    movimientos = movimientos.map((m) => (m.id === actualizado.id ? actualizado : m));
    return HttpResponse.json(actualizado);
  }),
];
