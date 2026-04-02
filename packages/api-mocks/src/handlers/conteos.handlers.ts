import type {
  Conteo,
  CierreConteoDto,
  CierreConteoResult,
  ConteoItemCargaDto,
  EstadoConteo,
  Movimiento,
  MovimientoItem,
  PaginatedResponse,
  ProblemDetails,
} from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { conteoFixtures } from '../fixtures/conteos.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

import { movimientos } from './movimientos.handlers';

/** Copia mutable en memoria para simular persistencia entre requests */
let conteos = [...conteoFixtures];

/** Contador para generar números de conteo */
let conteoCounter = conteos.length + 1;

/** Contador para generar números de movimiento de ajuste */
let ajusteCounter = 1;

/** Mapa de transiciones de estado permitidas para conteos */
const ALLOWED_TRANSITIONS: Record<EstadoConteo, EstadoConteo[]> = {
  planificado: ['en_curso', 'anulado'],
  en_curso: ['pausado', 'completado', 'anulado'],
  pausado: ['en_curso', 'anulado'],
  completado: [],
  anulado: [],
};

/** Handlers CRUD para el módulo de conteos físicos de inventario */
export const conteosHandlers = [
  // GET /api/conteos — lista paginada con búsqueda, filtro por estado y almacén
  http.get('/api/conteos', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';
    const estado = url.searchParams.get('estado') ?? '';
    const almacenId = url.searchParams.get('almacenId') ?? '';

    let filtered = conteos;
    if (estado) filtered = filtered.filter((c) => c.estado === estado);
    if (almacenId) filtered = filtered.filter((c) => c.almacenId === almacenId);
    if (search)
      filtered = filtered.filter(
        (c) =>
          c.numero.toLowerCase().includes(search) || c.descripcion.toLowerCase().includes(search)
      );

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

  // PATCH /api/conteos/:id/estado — transición de estado según máquina de estados
  http.patch('/api/conteos/:id/estado', async ({ params, request }) => {
    const conteoId = String(params['id']);
    const conteo = conteos.find((c) => c.id === conteoId);

    if (!conteo) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${conteoId}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as { estado: EstadoConteo };
    const estadoActual = conteo.estado;
    const estadoNuevo = body.estado;

    // Validar que la transición está permitida según la máquina de estados
    if (!ALLOWED_TRANSITIONS[estadoActual].includes(estadoNuevo)) {
      const err: ProblemDetails = {
        type: '/errors/conflict',
        title: 'Transición de estado no válida',
        status: 409,
        detail: `No se puede transicionar de "${estadoActual}" a "${estadoNuevo}".`,
      };
      return HttpResponse.json(err, { status: 409 });
    }

    // Validar que todos los ítems tienen cantidadContada antes de completar
    if (estadoNuevo === 'completado') {
      const itemsIncompletos = conteo.items.some((item) => item.cantidadContada === undefined);
      if (itemsIncompletos) {
        const err: ProblemDetails = {
          type: '/errors/validation',
          title: 'Conteo incompleto',
          status: 422,
          detail: 'Todos los ítems deben tener cantidad contada antes de completar el conteo.',
        };
        return HttpResponse.json(err, { status: 422 });
      }
    }

    const actualizado: Conteo = {
      ...conteo,
      estado: estadoNuevo,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    conteos = conteos.map((c) => (c.id === conteoId ? actualizado : c));
    return HttpResponse.json(actualizado);
  }),

  // PATCH /api/conteos/:id/items — carga masiva de cantidades contadas
  http.patch('/api/conteos/:id/items', async ({ params, request }) => {
    const conteoId = String(params['id']);
    const conteo = conteos.find((c) => c.id === conteoId);

    if (!conteo) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${conteoId}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as { items: ConteoItemCargaDto[] };
    const itemsDto = body.items;

    // Validar que ninguna cantidad contada sea negativa
    const hayNegativos = itemsDto.some((dto) => dto.cantidadContada < 0);
    if (hayNegativos) {
      const err: ProblemDetails = {
        type: '/errors/validation',
        title: 'Cantidades inválidas',
        status: 422,
        detail: 'La cantidad contada no puede ser negativa.',
      };
      return HttpResponse.json(err, { status: 422 });
    }

    // Actualizar cada ítem y recalcular diferencia
    const itemsActualizados = conteo.items.map((item) => {
      const dto = itemsDto.find((d) => d.id === item.id);
      if (!dto) return item;
      return {
        ...item,
        cantidadContada: dto.cantidadContada,
        diferencia: dto.cantidadContada - item.cantidadSistema,
      };
    });

    const actualizado: Conteo = {
      ...conteo,
      items: itemsActualizados,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    conteos = conteos.map((c) => (c.id === conteoId ? actualizado : c));
    return HttpResponse.json(actualizado);
  }),

  // POST /api/conteos/:id/cierre — cierra el conteo y genera movimiento de ajuste
  http.post('/api/conteos/:id/cierre', async ({ params, request }) => {
    const conteoId = String(params['id']);
    const conteo = conteos.find((c) => c.id === conteoId);

    if (!conteo) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Conteo no encontrado',
        status: 404,
        detail: `No existe un conteo con id "${conteoId}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    // El conteo debe estar en estado completado para poder cerrar
    if (conteo.estado !== 'completado') {
      const err: ProblemDetails = {
        type: '/errors/conflict',
        title: 'Estado inválido para cierre',
        status: 409,
        detail: `El conteo debe estar en estado "completado" para cerrar. Estado actual: "${conteo.estado}".`,
      };
      return HttpResponse.json(err, { status: 409 });
    }

    const body = (await request.json()) as CierreConteoDto;

    // Ítems con discrepancia que requieren ajuste
    const itemsConDiferencia = conteo.items.filter(
      (item) => item.diferencia !== undefined && item.diferencia !== 0
    );

    let nuevoMovimiento: Movimiento | undefined;

    if (body.confirmarAjuste) {
      // Crear movimiento de ajuste para los ítems con discrepancia
      const ajusteId = `mov-ajuste-${conteoId}`;
      const ajusteNumero = `MOV-AJUSTE-${String(ajusteCounter++).padStart(4, '0')}`;

      const movimientoItems: MovimientoItem[] = itemsConDiferencia.map((item) => ({
        id: `${ajusteId}-${item.id}`,
        productoId: item.productoId,
        productoCodigo: item.productoCodigo,
        productoNombre: item.productoNombre,
        cantidad: Math.abs(item.diferencia ?? 0),
        precioUnitario: 0,
      }));

      nuevoMovimiento = {
        id: ajusteId,
        numero: ajusteNumero,
        tipo: 'ajuste',
        estado: 'ejecutado',
        almacenOrigenId: conteo.almacenId,
        almacenOrigenNombre: conteo.almacenNombre,
        items: movimientoItems,
        observacion: body.observacion ?? `Ajuste generado por cierre de conteo ${conteo.numero}`,
        fechaEjecucion: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'mock-user@ngr.com',
        updatedBy: 'mock-user@ngr.com',
      };

      // Agregar el movimiento de ajuste al store mutable de movimientos
      movimientos.push(nuevoMovimiento);
    }

    // Marcar ítems ajustados y actualizar estado del conteo (permanece en completado — terminal)
    const itemsAjustados = conteo.items.map((item) => ({
      ...item,
      ajustado:
        body.confirmarAjuste && item.diferencia !== undefined && item.diferencia !== 0
          ? true
          : item.ajustado,
    }));

    const conteoActualizado: Conteo = {
      ...conteo,
      items: itemsAjustados,
      updatedAt: new Date().toISOString(),
      updatedBy: 'mock-user@ngr.com',
    };

    conteos = conteos.map((c) => (c.id === conteoId ? conteoActualizado : c));

    const resultado: CierreConteoResult = {
      conteo: conteoActualizado,
      ...(nuevoMovimiento && {
        movimientoAjusteId: nuevoMovimiento.id,
        movimientoAjusteNumero: nuevoMovimiento.numero,
      }),
    };

    return HttpResponse.json(resultado);
  }),
];
