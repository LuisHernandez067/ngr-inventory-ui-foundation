// Página de lista de Roles y permisos — implementación con createListPage()
import type { Rol } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de roles */
const columns: ColumnDef<Rol>[] = [
  { key: 'nombre', header: 'Nombre', width: '160px' },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'permisos',
    header: 'Permisos',
    width: '100px',
    render: (value) => {
      // Mostrar la cantidad de permisos asignados al rol
      const count = Array.isArray(value) ? value.length : 0;
      return `<span class="badge bg-info text-dark">${String(count)}</span>`;
    },
  },
  {
    key: 'esAdmin',
    header: 'Administrador',
    width: '130px',
    render: (value) =>
      value
        ? '<span class="badge bg-danger">Sí</span>'
        : '<span class="badge bg-light text-dark border">No</span>',
  },
];

/** Página de listado de roles */
export const rolesPage = createListPage<Rol>({
  title: 'Roles y permisos',
  endpoint: '/api/roles',
  columns,
  searchPlaceholder: 'Buscar roles...',
});
