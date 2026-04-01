// Página de lista de Proveedores — implementación con createListPage()
import type { Proveedor } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de proveedores */
const columns: ColumnDef<Proveedor>[] = [
  { key: 'codigo', header: 'Código', width: '110px' },
  { key: 'razonSocial', header: 'Razón Social' },
  { key: 'ruc', header: 'RUC / CUIT', width: '130px' },
  { key: 'email', header: 'Email' },
  { key: 'telefono', header: 'Teléfono', width: '120px' },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) => {
      const map: Record<string, string> = {
        active: 'bg-success',
        inactive: 'bg-secondary',
        suspended: 'bg-warning text-dark',
      };
      const labelMap: Record<string, string> = {
        active: 'Activo',
        inactive: 'Inactivo',
        suspended: 'Suspendido',
      };
      const status = value as string;
      return `<span class="badge ${map[status] ?? 'bg-secondary'}">${labelMap[status] ?? status}</span>`;
    },
  },
];

/** Página de listado de proveedores */
export const proveedoresPage = createListPage<Proveedor>({
  title: 'Proveedores',
  endpoint: '/api/proveedores',
  columns,
  searchPlaceholder: 'Buscar proveedores...',
  actionLabel: 'Nuevo proveedor',
  actionIcon: 'bi-plus-lg',
});
