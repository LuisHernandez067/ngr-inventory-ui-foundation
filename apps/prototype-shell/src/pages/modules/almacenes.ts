// Página de lista de Almacenes — implementación con createListPage()
import type { Almacen } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de almacenes */
const columns: ColumnDef<Almacen>[] = [
  { key: 'codigo', header: 'Código', width: '110px' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'descripcion', header: 'Descripción' },
  { key: 'direccion', header: 'Dirección' },
  { key: 'responsableNombre', header: 'Responsable', width: '160px' },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) =>
      `<span class="badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}">${value === 'active' ? 'Activo' : 'Inactivo'}</span>`,
  },
];

/** Página de listado de almacenes */
export const almacenesPage = createListPage<Almacen>({
  title: 'Almacenes',
  endpoint: '/api/almacenes',
  columns,
  searchPlaceholder: 'Buscar almacenes...',
});
