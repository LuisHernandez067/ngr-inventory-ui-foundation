// Página de lista de Auditoría — implementación con createListPage()
import type { AuditoriaEntry } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Mapa de colores Bootstrap para el tipo de acción auditada */
const accionColorMap: Record<string, string> = {
  crear: 'bg-success',
  actualizar: 'bg-info text-dark',
  eliminar: 'bg-danger',
  login: 'bg-primary',
  logout: 'bg-secondary',
  exportar: 'bg-warning text-dark',
};

/** Columnas de la tabla de auditoría */
const columns: ColumnDef<AuditoriaEntry>[] = [
  {
    key: 'fecha',
    header: 'Fecha',
    width: '150px',
    render: (value) =>
      new Date(value as string).toLocaleString('es-AR'),
  },
  { key: 'usuarioEmail', header: 'Usuario' },
  {
    key: 'accion',
    header: 'Acción',
    width: '110px',
    render: (value) =>
      `<span class="badge ${accionColorMap[value as string] ?? 'bg-secondary'}">${String(value)}</span>`,
  },
  { key: 'modulo', header: 'Módulo', width: '120px' },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'ipAddress',
    header: 'IP',
    width: '130px',
    render: (value) =>
      value ? String(value) : '<span class="text-muted">—</span>',
  },
];

/** Página de listado del registro de auditoría */
export const auditoriaPage = createListPage<AuditoriaEntry>({
  title: 'Auditoría',
  endpoint: '/api/auditoria',
  columns,
  searchPlaceholder: 'Buscar en auditoría...',
});
