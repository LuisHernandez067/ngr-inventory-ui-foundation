// Página de lista de Ubicaciones — implementación con createListPage()
import type { Ubicacion } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de ubicaciones */
const columns: ColumnDef<Ubicacion>[] = [
  { key: 'codigo', header: 'Código', width: '110px' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'almacenNombre', header: 'Almacén' },
  { key: 'tipo', header: 'Tipo', width: '100px' },
  {
    key: 'capacidad',
    header: 'Capacidad',
    width: '100px',
    render: (value) =>
      value != null ? String(value) : '<span class="text-muted">—</span>',
  },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) =>
      `<span class="badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}">${value === 'active' ? 'Activo' : 'Inactivo'}</span>`,
  },
];

/** Página de listado de ubicaciones */
export const ubicacionesPage = createListPage<Ubicacion>({
  title: 'Ubicaciones',
  endpoint: '/api/ubicaciones',
  columns,
  searchPlaceholder: 'Buscar ubicaciones...',
});
