import { http, HttpResponse } from 'msw';
import type {
  ReporteDefinicion,
  ExportacionJob,
  PaginatedResponse,
  ProblemDetails,
} from '@ngr-inventory/api-contracts';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Definiciones de reportes disponibles en el sistema */
const reporteDefiniciones: ReporteDefinicion[] = [
  {
    id: 'rep-001',
    nombre: 'Stock Actual',
    tipo: 'stock_actual',
    descripcion: 'Listado completo del stock disponible por producto y almacén',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-002',
    nombre: 'Kardex de Movimientos',
    tipo: 'kardex',
    descripcion: 'Historial de entradas y salidas de un producto con saldo calculado',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-003',
    nombre: 'Movimientos del Período',
    tipo: 'movimientos',
    descripcion: 'Todos los movimientos de inventario en un rango de fechas',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-004',
    nombre: 'Inventario Valorizado',
    tipo: 'valorizado',
    descripcion: 'Stock actual valorizado al precio unitario de cada producto',
    formatos: ['pdf', 'xlsx'],
  },
  {
    id: 'rep-005',
    nombre: 'Productos Bajo Mínimo',
    tipo: 'bajo_stock',
    descripcion: 'Productos cuyo stock actual está por debajo del mínimo configurado',
    formatos: ['pdf', 'xlsx', 'csv'],
  },
  {
    id: 'rep-006',
    nombre: 'Log de Auditoría',
    tipo: 'auditoria',
    descripcion: 'Registro de acciones de usuarios en el sistema',
    formatos: ['pdf', 'csv'],
  },
];

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
      formato: (body.formato as ExportacionJob['formato']) ?? 'pdf',
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
