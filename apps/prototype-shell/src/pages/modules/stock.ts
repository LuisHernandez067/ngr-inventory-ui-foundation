// Página de lista de Stock — implementación con createListPage()
// Usa StockItem para mostrar stock por ubicación (endpoint /api/stock)
import type { StockItem } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de stock */
const columns: ColumnDef<StockItem>[] = [
  { key: 'productoCodigo', header: 'Código', width: '110px' },
  { key: 'productoNombre', header: 'Producto' },
  { key: 'almacenNombre', header: 'Almacén' },
  { key: 'ubicacionNombre', header: 'Ubicación' },
  {
    key: 'cantidadDisponible',
    header: 'Disponible',
    width: '100px',
    render: (value) =>
      `<span class="text-end d-block fw-semibold">${String(value)}</span>`,
  },
  {
    key: 'cantidadReservada',
    header: 'Reservado',
    width: '100px',
    render: (value) =>
      `<span class="text-end d-block text-muted">${String(value)}</span>`,
  },
  {
    key: 'cantidadTotal',
    header: 'Total',
    width: '90px',
    render: (value) =>
      `<span class="text-end d-block">${String(value)}</span>`,
  },
];

/** Página de listado de stock */
export const stockPage = createListPage<StockItem>({
  title: 'Stock',
  endpoint: '/api/stock',
  columns,
  searchPlaceholder: 'Buscar stock...',
});
