// Página de lista de Categorías — implementación con createListPage()
import type { Categoria } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef, ListPageOptions } from '../_shared/createListPage';

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

/**
 * Página de listado de categorías — lazy: crea el módulo interno al renderizar
 * para poder verificar el rol en ese momento.
 */
export const categoriasPage: PageModule = (() => {
  let innerPage: PageModule | null = null;

  return {
    render(container: HTMLElement): void {
      const isConsulta = authService.getProfile() === 'consulta';

      const baseOptions: ListPageOptions<Categoria> = {
        title: 'Categorías',
        endpoint: '/api/categorias',
        columns,
        searchPlaceholder: 'Buscar categorías...',
        onRowClick: (id) => {
          window.location.hash = `#/categorias/${id}`;
        },
      };

      const options: ListPageOptions<Categoria> = isConsulta
        ? baseOptions
        : {
            ...baseOptions,
            actionLabel: 'Nueva categoría',
            actionIcon: 'bi-plus-lg',
            onActionClick: () => {
              window.location.hash = '#/categorias/nuevo';
            },
          };

      innerPage = createListPage<Categoria>(options);
      innerPage.render(container);
    },

    destroy(): void {
      innerPage?.destroy();
      innerPage = null;
    },
  };
})();
