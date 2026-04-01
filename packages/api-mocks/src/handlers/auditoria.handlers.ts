import { http, HttpResponse } from 'msw';
import type { AuditoriaEntry, PaginatedResponse } from '@ngr-inventory/api-contracts';
import { resolveScenario } from '../scenarios/error-scenarios';

/** Entradas de auditoría fijas para el mock */
const auditoriaEntries: AuditoriaEntry[] = [
  {
    id: 'aud-001',
    fecha: '2025-03-30T08:45:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'login',
    modulo: 'auth',
    descripcion: 'Inicio de sesión exitoso',
    ipAddress: '192.168.1.100',
  },
  {
    id: 'aud-002',
    fecha: '2025-03-30T09:10:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'crear',
    modulo: 'productos',
    entidadId: 'prod-012',
    entidadTipo: 'Producto',
    descripcion: 'Creó el producto "Pad de Escritorio XL"',
    ipAddress: '192.168.1.100',
    datosNuevos: { codigo: 'PAD-XL-001', nombre: 'Pad de Escritorio XL' },
  },
  {
    id: 'aud-003',
    fecha: '2025-03-29T17:30:00.000Z',
    usuarioId: 'usr-002',
    usuarioEmail: 'carlos.rodriguez@ngr.com',
    accion: 'actualizar',
    modulo: 'movimientos',
    entidadId: 'mov-003',
    entidadTipo: 'Movimiento',
    descripcion: 'Aprobó el movimiento MOV-2025-0003',
    ipAddress: '192.168.1.102',
    datosAnteriores: { estado: 'pendiente' },
    datosNuevos: { estado: 'aprobado' },
  },
  {
    id: 'aud-004',
    fecha: '2025-03-29T14:00:00.000Z',
    usuarioId: 'usr-003',
    usuarioEmail: 'ana.gomez@ngr.com',
    accion: 'exportar',
    modulo: 'reportes',
    entidadId: 'rep-001',
    entidadTipo: 'Reporte',
    descripcion: 'Exportó el reporte "Stock Actual" en formato XLSX',
    ipAddress: '192.168.1.103',
  },
  {
    id: 'aud-005',
    fecha: '2025-03-28T16:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'actualizar',
    modulo: 'usuarios',
    entidadId: 'usr-006',
    entidadTipo: 'Usuario',
    descripcion: 'Desactivó el usuario "Patricia Díaz"',
    ipAddress: '192.168.1.100',
    datosAnteriores: { activo: true },
    datosNuevos: { activo: false },
  },
  {
    id: 'aud-006',
    fecha: '2025-03-28T10:00:00.000Z',
    usuarioId: 'usr-004',
    usuarioEmail: 'martin.lopez@ngr.com',
    accion: 'crear',
    modulo: 'movimientos',
    entidadId: 'mov-007',
    entidadTipo: 'Movimiento',
    descripcion: 'Creó el movimiento MOV-2025-0007 en estado borrador',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-007',
    fecha: '2025-03-27T09:15:00.000Z',
    usuarioId: 'usr-002',
    usuarioEmail: 'carlos.rodriguez@ngr.com',
    accion: 'eliminar',
    modulo: 'categorias',
    entidadId: 'cat-007',
    entidadTipo: 'Categoría',
    descripcion: 'Eliminó la categoría "Obsoletos"',
    ipAddress: '192.168.1.102',
    datosAnteriores: { id: 'cat-007', nombre: 'Obsoletos', status: 'inactive' },
  },
  {
    id: 'aud-008',
    fecha: '2025-03-26T17:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'logout',
    modulo: 'auth',
    descripcion: 'Cierre de sesión',
    ipAddress: '192.168.1.100',
  },
];

/** Handler de solo lectura para el módulo de auditoría */
export const auditoriaHandlers = [
  // GET /api/auditoria — lista paginada del log de auditoría
  http.get('/api/auditoria', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    const filtered = search
      ? auditoriaEntries.filter(
          (a) =>
            a.descripcion.toLowerCase().includes(search) ||
            a.usuarioEmail.toLowerCase().includes(search) ||
            a.modulo.toLowerCase().includes(search)
        )
      : auditoriaEntries;

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    const response: PaginatedResponse<AuditoriaEntry> = {
      data,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };

    return HttpResponse.json(response);
  }),
];
