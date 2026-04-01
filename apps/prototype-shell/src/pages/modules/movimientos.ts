// Página de lista de Movimientos de inventario — implementación con createListPage()
import type { Movimiento } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Mapa de colores Bootstrap para el tipo de movimiento */
const tipoColorMap: Record<string, string> = {
  entrada: 'bg-success',
  salida: 'bg-danger',
  transferencia: 'bg-info text-dark',
  ajuste: 'bg-warning text-dark',
  devolucion: 'bg-secondary',
};

/** Mapa de colores Bootstrap para el estado del movimiento */
const estadoColorMap: Record<string, string> = {
  borrador: 'bg-light text-dark border',
  pendiente: 'bg-warning text-dark',
  aprobado: 'bg-info text-dark',
  ejecutado: 'bg-success',
  anulado: 'bg-danger',
};

/** Columnas de la tabla de movimientos */
const columns: ColumnDef<Movimiento>[] = [
  { key: 'numero', header: 'Número', width: '110px' },
  {
    key: 'tipo',
    header: 'Tipo',
    width: '120px',
    render: (value) =>
      `<span class="badge ${tipoColorMap[value as string] ?? 'bg-secondary'}">${String(value)}</span>`,
  },
  { key: 'almacenOrigenNombre', header: 'Origen' },
  { key: 'almacenDestinoNombre', header: 'Destino' },
  {
    key: 'fechaEjecucion',
    header: 'Fecha',
    width: '130px',
    render: (value) =>
      value
        ? new Date(value as string).toLocaleDateString('es-AR')
        : '<span class="text-muted">—</span>',
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '110px',
    render: (value) =>
      `<span class="badge ${estadoColorMap[value as string] ?? 'bg-secondary'}">${String(value)}</span>`,
  },
];

/** Página de listado de movimientos */
export const movimientosPage = createListPage<Movimiento>({
  title: 'Movimientos',
  endpoint: '/api/movimientos',
  columns,
  searchPlaceholder: 'Buscar movimientos...',
});
