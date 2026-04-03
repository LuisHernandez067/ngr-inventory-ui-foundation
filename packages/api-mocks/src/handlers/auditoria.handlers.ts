import type {
  AuditoriaEntry,
  TipoAccionAuditoria,
  PaginatedResponse,
} from '@ngr-inventory/api-contracts';
import { http, HttpResponse } from 'msw';

import { resolveScenario } from '../scenarios/error-scenarios';

/** Entradas de auditoría para el mock — 22 entradas con variedad de acciones, módulos y usuarios */
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
  {
    id: 'aud-009',
    fecha: '2025-03-26T08:30:00.000Z',
    usuarioId: 'usr-005',
    usuarioEmail: 'laura.perez@ngr.com',
    accion: 'login',
    modulo: 'auth',
    descripcion: 'Inicio de sesión exitoso',
    ipAddress: '192.168.1.105',
  },
  {
    id: 'aud-010',
    fecha: '2025-03-25T11:45:00.000Z',
    usuarioId: 'usr-003',
    usuarioEmail: 'ana.gomez@ngr.com',
    accion: 'actualizar',
    modulo: 'productos',
    entidadId: 'prod-005',
    entidadTipo: 'Producto',
    descripcion: 'Actualizó el precio del producto "Monitor 27\'"',
    ipAddress: '192.168.1.103',
    datosAnteriores: { precio: 85000 },
    datosNuevos: { precio: 92000 },
  },
  {
    id: 'aud-011',
    fecha: '2025-03-25T09:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'crear',
    modulo: 'usuarios',
    entidadId: 'usr-007',
    entidadTipo: 'Usuario',
    descripcion: 'Creó el usuario "Javier Morales"',
    ipAddress: '192.168.1.100',
    datosNuevos: { email: 'javier.morales@ngr.com', rolId: 'rol-003' },
  },
  {
    id: 'aud-012',
    fecha: '2025-03-24T15:30:00.000Z',
    usuarioId: 'usr-004',
    usuarioEmail: 'martin.lopez@ngr.com',
    accion: 'actualizar',
    modulo: 'movimientos',
    entidadId: 'mov-009',
    entidadTipo: 'Movimiento',
    descripcion: 'Modificó las unidades del movimiento MOV-2025-0009',
    ipAddress: '192.168.1.104',
    datosAnteriores: { cantidad: 50 },
    datosNuevos: { cantidad: 75 },
  },
  {
    id: 'aud-013',
    fecha: '2025-03-24T10:00:00.000Z',
    usuarioId: 'usr-002',
    usuarioEmail: 'carlos.rodriguez@ngr.com',
    accion: 'exportar',
    modulo: 'reportes',
    entidadId: 'rep-003',
    entidadTipo: 'Reporte',
    descripcion: 'Exportó el reporte "Movimientos del Mes" en formato PDF',
    ipAddress: '192.168.1.102',
  },
  {
    id: 'aud-014',
    fecha: '2025-03-23T16:45:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'actualizar',
    modulo: 'usuarios',
    entidadId: 'usr-002',
    entidadTipo: 'Usuario',
    descripcion: 'Cambió el rol del usuario "Carlos Rodríguez"',
    ipAddress: '192.168.1.100',
    datosAnteriores: { rolId: 'rol-003', rolNombre: 'Operario' },
    datosNuevos: { rolId: 'rol-002', rolNombre: 'Supervisor' },
  },
  {
    id: 'aud-015',
    fecha: '2025-03-23T08:00:00.000Z',
    usuarioId: 'usr-005',
    usuarioEmail: 'laura.perez@ngr.com',
    accion: 'crear',
    modulo: 'movimientos',
    entidadId: 'mov-010',
    entidadTipo: 'Movimiento',
    descripcion: 'Creó el movimiento de ingreso MOV-2025-0010',
    ipAddress: '192.168.1.105',
    datosNuevos: { tipo: 'ingreso', almacen: 'alm-001' },
  },
  {
    id: 'aud-016',
    fecha: '2025-03-22T14:00:00.000Z',
    usuarioId: 'usr-003',
    usuarioEmail: 'ana.gomez@ngr.com',
    accion: 'eliminar',
    modulo: 'productos',
    entidadId: 'prod-099',
    entidadTipo: 'Producto',
    descripcion: 'Eliminó el producto "Artículo Descontinuado X"',
    ipAddress: '192.168.1.103',
    datosAnteriores: { codigo: 'DISC-X-001', activo: false },
  },
  {
    id: 'aud-017',
    fecha: '2025-03-21T11:30:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'crear',
    modulo: 'usuarios',
    entidadId: 'usr-008',
    entidadTipo: 'Usuario',
    descripcion: 'Creó el usuario "Sofía Torres"',
    ipAddress: '192.168.1.100',
    datosNuevos: { email: 'sofia.torres@ngr.com', rolId: 'rol-004' },
  },
  {
    id: 'aud-018',
    fecha: '2025-03-20T09:15:00.000Z',
    usuarioId: 'usr-002',
    usuarioEmail: 'carlos.rodriguez@ngr.com',
    accion: 'actualizar',
    modulo: 'movimientos',
    entidadId: 'mov-004',
    entidadTipo: 'Movimiento',
    descripcion: 'Rechazó el movimiento MOV-2025-0004',
    ipAddress: '192.168.1.102',
    datosAnteriores: { estado: 'pendiente' },
    datosNuevos: { estado: 'rechazado' },
  },
  {
    id: 'aud-019',
    fecha: '2025-03-19T17:00:00.000Z',
    usuarioId: 'usr-004',
    usuarioEmail: 'martin.lopez@ngr.com',
    accion: 'logout',
    modulo: 'auth',
    descripcion: 'Cierre de sesión',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-020',
    fecha: '2025-03-18T10:30:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'actualizar',
    modulo: 'usuarios',
    entidadId: 'usr-009',
    entidadTipo: 'Usuario',
    descripcion: 'Desactivó el usuario "Diego Vargas"',
    ipAddress: '192.168.1.100',
    datosAnteriores: { activo: true },
    datosNuevos: { activo: false },
  },
  {
    id: 'aud-021',
    fecha: '2025-03-17T14:15:00.000Z',
    usuarioId: 'usr-003',
    usuarioEmail: 'ana.gomez@ngr.com',
    accion: 'exportar',
    modulo: 'reportes',
    entidadId: 'rep-005',
    entidadTipo: 'Reporte',
    descripcion: 'Exportó el reporte "Kardex Mensual" en formato XLSX',
    ipAddress: '192.168.1.103',
  },
  {
    id: 'aud-022',
    fecha: '2025-03-16T08:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'crear',
    modulo: 'usuarios',
    entidadId: 'usr-011',
    entidadTipo: 'Usuario',
    descripcion: 'Creó el usuario "Lucas Herrera" con perfil de Administrador',
    ipAddress: '192.168.1.100',
    datosNuevos: { email: 'lucas.herrera@ngr.com', rolId: 'rol-001' },
  },
];

/** Handler de solo lectura para el módulo de auditoría */
export const auditoriaHandlers = [
  // GET /api/auditoria — lista paginada del log de auditoría con filtros
  http.get('/api/auditoria', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('_scenario');
    const errorResponse = resolveScenario(scenario);
    if (errorResponse) return errorResponse;

    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20');
    const search = url.searchParams.get('search')?.toLowerCase() ?? '';

    // Parámetros de filtro extendidos
    const accion = url.searchParams.get('accion') ?? '';
    const modulo = url.searchParams.get('modulo') ?? '';
    const usuarioId = url.searchParams.get('usuarioId') ?? '';
    const fechaDesde = url.searchParams.get('fechaDesde') ?? '';
    const fechaHasta = url.searchParams.get('fechaHasta') ?? '';

    let filtered = auditoriaEntries;

    // Filtro por texto libre (descripción, email, módulo)
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.descripcion.toLowerCase().includes(search) ||
          a.usuarioEmail.toLowerCase().includes(search) ||
          a.modulo.toLowerCase().includes(search)
      );
    }

    // Filtro por tipo de acción
    if (accion) {
      filtered = filtered.filter((a) => a.accion === (accion as TipoAccionAuditoria));
    }

    // Filtro por módulo
    if (modulo) {
      filtered = filtered.filter((a) => a.modulo === modulo);
    }

    // Filtro por usuario
    if (usuarioId) {
      filtered = filtered.filter((a) => a.usuarioId === usuarioId);
    }

    // Filtro por rango de fechas (fechaDesde y fechaHasta en formato ISO 8601 o YYYY-MM-DD)
    if (fechaDesde) {
      const desde = new Date(fechaDesde).getTime();
      filtered = filtered.filter((a) => new Date(a.fecha).getTime() >= desde);
    }

    if (fechaHasta) {
      // Incluye todo el día de fechaHasta — suma 24h menos 1ms
      const hasta = new Date(fechaHasta).getTime() + 24 * 60 * 60 * 1000 - 1;
      filtered = filtered.filter((a) => new Date(a.fecha).getTime() <= hasta);
    }

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
