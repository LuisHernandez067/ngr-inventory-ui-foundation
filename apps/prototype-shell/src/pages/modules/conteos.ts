// Página de lista de Conteos físicos — implementación con createListPage()
import type { Conteo } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Mapa de colores Bootstrap para el estado del conteo */
const estadoColorMap: Record<string, string> = {
  planificado: 'bg-secondary',
  en_curso: 'bg-primary',
  pausado: 'bg-warning text-dark',
  completado: 'bg-success',
  anulado: 'bg-danger',
};

/** Columnas de la tabla de conteos */
const columns: ColumnDef<Conteo>[] = [
  { key: 'numero', header: 'Número', width: '110px' },
  { key: 'descripcion', header: 'Descripción' },
  { key: 'almacenNombre', header: 'Almacén' },
  {
    key: 'fechaInicio',
    header: 'Fecha inicio',
    width: '130px',
    render: (value) =>
      value
        ? new Date(value as string).toLocaleDateString('es-AR')
        : '<span class="text-muted">—</span>',
  },
  {
    key: 'fechaFin',
    header: 'Fecha fin',
    width: '130px',
    render: (value) =>
      value
        ? new Date(value as string).toLocaleDateString('es-AR')
        : '<span class="text-muted">—</span>',
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '120px',
    render: (value) =>
      `<span class="badge ${estadoColorMap[value as string] ?? 'bg-secondary'}">${String(value)}</span>`,
  },
];

/** Página de listado de conteos físicos */
export const conteosPage = createListPage<Conteo>({
  title: 'Conteos físicos',
  endpoint: '/api/conteos',
  columns,
  searchPlaceholder: 'Buscar conteos...',
  actionLabel: 'Nuevo conteo',
  actionIcon: 'bi-plus-lg',
});
