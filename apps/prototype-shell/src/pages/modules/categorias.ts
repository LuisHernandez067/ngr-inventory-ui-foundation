// Página de lista de Categorías — implementación con createListPage()
import type { Categoria } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de categorías */
const columns: ColumnDef<Categoria>[] = [
  { key: 'codigo', header: 'Código', width: '110px' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) =>
      `<span class="badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}">${value === 'active' ? 'Activo' : 'Inactivo'}</span>`,
  },
];

/** Página de listado de categorías */
export const categoriasPage = createListPage<Categoria>({
  title: 'Categorías',
  endpoint: '/api/categorias',
  columns,
  searchPlaceholder: 'Buscar categorías...',
});
