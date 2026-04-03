import type {
  ReporteDefinicion,
  ExportacionJob,
  PaginatedResponse,
  ProblemDetails,
  ReporteDatos,
} from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { kardexFixtures } from '../fixtures/kardex.fixtures';
import { movimientoFixtures } from '../fixtures/movimientos.fixtures';
import { reporteDefinicionFixtures } from '../fixtures/reportes.fixtures';
import { stockConsolidadoFixtures } from '../fixtures/stock.fixtures';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Definiciones de reportes disponibles en el sistema */
const reporteDefiniciones: ReporteDefinicion[] = reporteDefinicionFixtures;

/** Jobs de exportación en memoria para el mock */
const exportacionJobs: ExportacionJob[] = [];

/** Handlers para el módulo de reportes */
export const reportesHandlers = [
  // GET /api/reportes — lista de definiciones de reportes disponibles
  http.get('/api/reportes', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const start = (page - 1) * pageSize;
    const data = reporteDefiniciones.slice(start, start + pageSize);

    const response: PaginatedResponse<ReporteDefinicion> = {
      data,
      total: reporteDefiniciones.length,
      page,
      pageSize,
      totalPages: Math.ceil(reporteDefiniciones.length / pageSize),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/reportes/:id/datos — datos de preview para un reporte con filtros
  http.get('/api/reportes/:id/datos', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const reporteId = String(params['id']);
    const reporte = reporteDefiniciones.find((r) => r.id === reporteId);
    if (!reporte) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Reporte no encontrado',
        status: 404,
        detail: `No existe un reporte con id "${reporteId}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const tipo = reporte.tipo;

    if (tipo === 'stock_actual') {
      const almacenId = url.searchParams.get('almacenId');
      const filtered = almacenId
        ? stockConsolidadoFixtures.filter((s) => s.items.some((i) => i.almacenId === almacenId))
        : stockConsolidadoFixtures;
      const filtrosAplicados = almacenId
        ? { tipo: 'stock_actual' as const, almacenId }
        : { tipo: 'stock_actual' as const };
      const response: ReporteDatos = {
        reporteId,
        tipo,
        filtrosAplicados,
        data: filtered,
        total: filtered.length,
      };
      return HttpResponse.json(response);
    }

    if (tipo === 'movimientos') {
      const fechaDesde = url.searchParams.get('fechaDesde');
      const fechaHasta = url.searchParams.get('fechaHasta');
      const almacenId = url.searchParams.get('almacenId');
      const tipoMovimiento = url.searchParams.get('tipoMovimiento');

      let filtered = movimientoFixtures;

      if (fechaDesde) {
        const desde = new Date(fechaDesde).getTime();
        filtered = filtered.filter((m) => new Date(m.createdAt).getTime() >= desde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta).getTime();
        filtered = filtered.filter((m) => new Date(m.createdAt).getTime() <= hasta);
      }
      if (almacenId) {
        filtered = filtered.filter(
          (m) => m.almacenOrigenId === almacenId || m.almacenDestinoId === almacenId
        );
      }
      if (tipoMovimiento) {
        filtered = filtered.filter((m) => m.tipo === tipoMovimiento);
      }

      const filtrosAplicados = {
        tipo: 'movimientos' as const,
        ...(fechaDesde !== null ? { fechaDesde } : {}),
        ...(fechaHasta !== null ? { fechaHasta } : {}),
        ...(almacenId !== null ? { almacenId } : {}),
        ...(tipoMovimiento !== null
          ? { tipoMovimiento: tipoMovimiento as 'entrada' | 'salida' | 'transferencia' | 'ajuste' }
          : {}),
      };

      const response: ReporteDatos = {
        reporteId,
        tipo,
        filtrosAplicados,
        data: filtered,
        total: filtered.length,
      };
      return HttpResponse.json(response);
    }

    if (tipo === 'kardex') {
      const productoId = url.searchParams.get('productoId');
      const fechaDesde = url.searchParams.get('fechaDesde');
      const fechaHasta = url.searchParams.get('fechaHasta');
      const almacenId = url.searchParams.get('almacenId');

      if (!productoId) {
        const err: ProblemDetails = {
          type: '/errors/bad-request',
          title: 'Parámetro requerido',
          status: 400,
          detail: 'El parámetro productoId es requerido para el reporte kardex',
        };
        return HttpResponse.json(err, { status: 400 });
      }

      let filtered = kardexFixtures.filter((k) => k.productoId === productoId);

      if (almacenId) {
        filtered = filtered.filter((k) => k.almacenId === almacenId);
      }
      if (fechaDesde) {
        const desde = new Date(fechaDesde).getTime();
        filtered = filtered.filter((k) => new Date(k.fecha).getTime() >= desde);
      }
      if (fechaHasta) {
        const hasta = new Date(fechaHasta).getTime();
        filtered = filtered.filter((k) => new Date(k.fecha).getTime() <= hasta);
      }

      const filtrosAplicados = {
        tipo: 'kardex' as const,
        productoId,
        ...(almacenId !== null ? { almacenId } : {}),
        ...(fechaDesde !== null ? { fechaDesde } : {}),
        ...(fechaHasta !== null ? { fechaHasta } : {}),
      };

      const response: ReporteDatos = {
        reporteId,
        tipo,
        filtrosAplicados,
        data: filtered,
        total: filtered.length,
      };
      return HttpResponse.json(response);
    }

    if (tipo === 'bajo_stock') {
      const umbralParam = url.searchParams.get('umbral');
      const umbral = umbralParam !== null ? Number(umbralParam) : null;

      const filtered =
        umbral !== null
          ? stockConsolidadoFixtures.filter((s) => s.cantidadTotal < umbral)
          : stockConsolidadoFixtures.filter((s) => s.bajoMinimo);

      const filtrosAplicados =
        umbral !== null ? { tipo: 'bajo_stock' as const, umbral } : { tipo: 'bajo_stock' as const };

      const response: ReporteDatos = {
        reporteId,
        tipo,
        filtrosAplicados,
        data: filtered,
        total: filtered.length,
      };
      return HttpResponse.json(response);
    }

    // Tipos sin datos de preview (valorizado, auditoria) — respuesta vacía
    const response: ReporteDatos = {
      reporteId,
      tipo,
      filtrosAplicados: { tipo: 'stock_actual' as const },
      data: [],
      total: 0,
    };
    return HttpResponse.json(response);
  }),

  // POST /api/reportes/:id/exportar — iniciar job de exportación
  http.post('/api/reportes/:id/exportar', async ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const reporte = reporteDefiniciones.find((r) => r.id === params['id']);
    if (!reporte) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Reporte no encontrado',
        status: 404,
        detail: `No existe un reporte con id "${String(params['id'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    const body = (await request.json()) as { formato?: string };

    const job: ExportacionJob = {
      id: `job-${String(Date.now()).slice(-8)}`,
      reporteId: String(params['id']),
      formato: (body.formato ?? 'pdf') as ExportacionJob['formato'],
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'mock-user@ngr.com',
      updatedBy: 'mock-user@ngr.com',
    };

    exportacionJobs.push(job);
    return HttpResponse.json(job, { status: 202 });
  }),

  // GET /api/reportes/exportaciones/:jobId — estado de un job de exportación
  http.get('/api/reportes/exportaciones/:jobId', ({ params, request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const job = exportacionJobs.find((j) => j.id === params['jobId']);
    if (!job) {
      const err: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Job de exportación no encontrado',
        status: 404,
        detail: `No existe un job con id "${String(params['jobId'])}"`,
      };
      return HttpResponse.json(err, { status: 404 });
    }

    // Simular progreso: si el job tiene más de 2 segundos, marcarlo como listo
    const createdMs = new Date(job.createdAt).getTime();
    const ageSecs = (Date.now() - createdMs) / 1000;
    if (ageSecs > 2 && job.estado === 'pendiente') {
      job.estado = 'listo';
      job.url = `/descargas/${job.id}.${job.formato}`;
      job.updatedAt = new Date().toISOString();
    }

    return HttpResponse.json(job);
  }),
];
