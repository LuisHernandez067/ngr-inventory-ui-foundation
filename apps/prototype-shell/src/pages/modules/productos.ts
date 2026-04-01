// Página de lista de Productos — implementación con createListPage()
import type { Producto } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de productos */
const columns: ColumnDef<Producto>[] = [
  { key: 'codigo', header: 'Código', width: '110px' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'categoriaNombre', header: 'Categoría' },
  { key: 'unidadMedida', header: 'Unidad', width: '90px' },
  {
    key: 'precioUnitario',
    header: 'Precio',
    width: '100px',
    render: (value) =>
      `<span class="text-end d-block">$${(value as number).toFixed(2)}</span>`,
  },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) => {
      const map: Record<string, string> = {
        active: 'bg-success',
        inactive: 'bg-secondary',
        discontinued: 'bg-warning text-dark',
      };
      const labelMap: Record<string, string> = {
        active: 'Activo',
        inactive: 'Inactivo',
        discontinued: 'Descontinuado',
      };
      const status = value as string;
      return `<span class="badge ${map[status] ?? 'bg-secondary'}">${labelMap[status] ?? status}</span>`;
    },
  },
];

/** Página de listado de productos */
export const productosPage = createListPage<Producto>({
  title: 'Productos',
  endpoint: '/api/productos',
  columns,
  searchPlaceholder: 'Buscar productos...',
  actionLabel: 'Nuevo producto',
  actionIcon: 'bi-plus-lg',
});
