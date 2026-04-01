// Página de lista de Usuarios — implementación con createListPage()
import type { Usuario } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de usuarios */
const columns: ColumnDef<Usuario>[] = [
  { key: 'nombre', header: 'Nombre', width: '150px' },
  { key: 'apellido', header: 'Apellido', width: '150px' },
  { key: 'email', header: 'Email' },
  { key: 'rolNombre', header: 'Rol', width: '130px' },
  {
    key: 'ultimoAcceso',
    header: 'Último acceso',
    width: '150px',
    render: (value) =>
      value
        ? new Date(value as string).toLocaleString('es-AR')
        : '<span class="text-muted">Nunca</span>',
  },
  {
    key: 'activo',
    header: 'Estado',
    width: '100px',
    render: (value) =>
      `<span class="badge ${value ? 'bg-success' : 'bg-secondary'}">${value ? 'Activo' : 'Inactivo'}</span>`,
  },
];

/** Página de listado de usuarios */
export const usuariosPage = createListPage<Usuario>({
  title: 'Usuarios',
  endpoint: '/api/usuarios',
  columns,
  searchPlaceholder: 'Buscar usuarios...',
  actionLabel: 'Nuevo usuario',
  actionIcon: 'bi-plus-lg',
});
