// Página de lista de Almacenes — implementación con createListPage()
import type { Almacen } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef, ListPageOptions } from '../_shared/createListPage';

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

/**
 * Página de listado de almacenes — lazy: crea el módulo interno al renderizar
 * para poder verificar el rol en ese momento.
 */
export const almacenesPage: PageModule = (() => {
  let innerPage: PageModule | null = null;

  return {
    render(container: HTMLElement): void {
      const isConsulta = authService.getProfile() === 'consulta';

      const baseOptions: ListPageOptions<Almacen> = {
        title: 'Almacenes',
        endpoint: '/api/almacenes',
        columns,
        searchPlaceholder: 'Buscar almacenes...',
        onRowClick: (id) => {
          window.location.hash = '#/almacenes/' + id;
        },
      };

      const options: ListPageOptions<Almacen> = isConsulta
        ? baseOptions
        : {
            ...baseOptions,
            actionLabel: 'Nuevo almacén',
            actionIcon: 'bi-plus-lg',
            onActionClick: () => {
              window.location.hash = '#/almacenes/nuevo';
            },
          };

      innerPage = createListPage<Almacen>(options);
      innerPage.render(container);
    },

    destroy(): void {
      innerPage?.destroy();
      innerPage = null;
    },
  };
})();
