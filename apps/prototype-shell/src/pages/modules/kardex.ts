// Página de Kardex — implementación con createListPage()
// Muestra el registro histórico de entradas/salidas por producto
import type { KardexEntry } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Mapa de colores para el tipo de movimiento de kardex */
const tipoColorMap: Record<string, string> = {
  entrada: 'bg-success',
  salida: 'bg-danger',
  ajuste: 'bg-warning text-dark',
  saldo_inicial: 'bg-info text-dark',
};

/** Columnas de la tabla de kardex */
const columns: ColumnDef<KardexEntry>[] = [
  {
    key: 'fecha',
    header: 'Fecha',
    width: '120px',
    render: (value) =>
      new Date(value as string).toLocaleDateString('es-AR'),
  },
  {
    key: 'tipo',
    header: 'Tipo',
    width: '120px',
    render: (value) =>
      `<span class="badge ${tipoColorMap[value as string] ?? 'bg-secondary'}">${String(value)}</span>`,
  },
  { key: 'movimientoNumero', header: 'Referencia', width: '120px' },
  {
    key: 'cantidadEntrada',
    header: 'Entrada',
    width: '90px',
    render: (value) =>
      Number(value) > 0
        ? `<span class="text-success text-end d-block">+${String(value)}</span>`
        : '<span class="text-muted text-end d-block">—</span>',
  },
  {
    key: 'cantidadSalida',
    header: 'Salida',
    width: '90px',
    render: (value) =>
      Number(value) > 0
        ? `<span class="text-danger text-end d-block">-${String(value)}</span>`
        : '<span class="text-muted text-end d-block">—</span>',
  },
  {
    key: 'saldoActual',
    header: 'Saldo',
    width: '90px',
    render: (value) =>
      `<span class="fw-semibold text-end d-block">${String(value)}</span>`,
  },
  { key: 'almacenNombre', header: 'Almacén' },
];

/** Página de kardex de inventario */
export const kardexPage = createListPage<KardexEntry>({
  title: 'Kardex',
  endpoint: '/api/kardex',
  columns,
  searchPlaceholder: 'Buscar en kardex...',
});
