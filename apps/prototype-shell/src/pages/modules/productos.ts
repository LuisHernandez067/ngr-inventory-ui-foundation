// Página de lista de Productos — implementación con createListPage()
import type { Producto } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef, ListPageOptions } from '../_shared/createListPage';

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
    render: (value) => `<span class="text-end d-block">$${(value as number).toFixed(2)}</span>`,
  },
  {
    key: 'status',
    header: 'Estado',
    width: '100px',
    render: (value) => {
      const map: Record<string, string> = {
        active: 'bg-success',
        inactive: 'bg-secondary',
        discontinued: 'bg-warning',
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

/**
 * Página de listado de productos — lazy: crea el módulo interno al renderizar
 * para poder verificar el rol en ese momento.
 * Incluye filtro de estado (Todos / Activo / Inactivo / Descontinuado).
 */
export const productosPage: PageModule = (() => {
  let innerPage: PageModule | null = null;

  return {
    render(container: HTMLElement): void {
      const isConsulta = authService.getProfile() === 'consulta';

      // Contenedor externo — aloja el filtro de estado + la lista
      container.innerHTML = `
        <div id="status-filter-bar" class="px-4 pt-4 pb-0 d-flex align-items-center gap-2">
          <label for="productos-status-filter" class="form-label mb-0 fw-semibold text-nowrap">Estado:</label>
          <select id="productos-status-filter" class="form-select form-select-sm w-auto">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="discontinued">Descontinuado</option>
          </select>
        </div>
        <div id="productos-list-container"></div>
      `;

      const listContainerEl = container.querySelector<HTMLElement>('#productos-list-container');
      const statusSelect = container.querySelector<HTMLSelectElement>('#productos-status-filter');
      if (!listContainerEl || !statusSelect) return;

      const listContainer: HTMLElement = listContainerEl;

      function buildOptions(statusValue: string): ListPageOptions<Producto> {
        const baseOptions: ListPageOptions<Producto> = {
          title: 'Productos',
          endpoint: '/api/productos',
          columns,
          searchPlaceholder: 'Buscar productos...',
          onRowClick: (id) => {
            window.location.hash = `#/productos/${id}`;
          },
          ...(statusValue ? { filters: { status: statusValue } } : {}),
        };

        if (isConsulta) return baseOptions;

        return {
          ...baseOptions,
          actionLabel: 'Nuevo producto',
          actionIcon: 'bi-plus-lg',
          onActionClick: () => {
            window.location.hash = '#/productos/nuevo';
          },
        };
      }

      function mountList(statusValue: string): void {
        innerPage?.destroy();
        innerPage = createListPage<Producto>(buildOptions(statusValue));
        innerPage.render(listContainer);
      }

      // Carga inicial sin filtro
      mountList('');

      // Cambio de filtro de estado
      statusSelect.addEventListener('change', () => {
        mountList(statusSelect.value);
      });
    },

    destroy(): void {
      innerPage?.destroy();
      innerPage = null;
    },
  };
})();
