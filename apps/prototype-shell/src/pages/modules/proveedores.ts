// Página de lista de Proveedores — implementación con createListPage()
import type { Proveedor } from '@ngr-inventory/api-contracts';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef, ListPageOptions } from '../_shared/createListPage';

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
        suspended: 'bg-warning',
      };
      const labelMap: Record<string, string> = {
        active: 'Activo',
        inactive: 'Inactivo',
        suspended: 'Suspendido',
      };
      const status = String(value);
      return `<span class="badge ${map[status] ?? 'bg-secondary'}">${labelMap[status] ?? status}</span>`;
    },
  },
];

/**
 * Página de listado de proveedores — lazy: crea el módulo interno al renderizar
 * para poder verificar el rol en ese momento.
 * Incluye filtro de estado (Todos / Activo / Inactivo / Suspendido).
 */
export const proveedoresPage: PageModule = (() => {
  let innerPage: PageModule | null = null;

  return {
    render(container: HTMLElement): void {
      const isConsulta = authService.getProfile() === 'consulta';

      // Contenedor externo — aloja el filtro de estado + la lista
      container.innerHTML = `
        <div id="status-filter-bar" class="px-4 pt-4 pb-0 d-flex align-items-center gap-2">
          <label for="proveedores-status-filter" class="form-label mb-0 fw-semibold text-nowrap">Estado:</label>
          <select id="proveedores-status-filter" class="form-select form-select-sm w-auto">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>
        <div id="proveedores-list-container"></div>
      `;

      const listContainerEl = container.querySelector<HTMLElement>('#proveedores-list-container');
      const statusSelect = container.querySelector<HTMLSelectElement>('#proveedores-status-filter');
      if (!listContainerEl || !statusSelect) return;

      const listContainer: HTMLElement = listContainerEl;

      function buildOptions(statusValue: string): ListPageOptions<Proveedor> {
        const baseOptions: ListPageOptions<Proveedor> = {
          title: 'Proveedores',
          endpoint: '/api/proveedores',
          columns,
          searchPlaceholder: 'Buscar proveedores...',
          onRowClick: (id) => {
            window.location.hash = `#/proveedores/${id}`;
          },
          ...(statusValue ? { filters: { status: statusValue } } : {}),
        };

        if (isConsulta) return baseOptions;

        return {
          ...baseOptions,
          actionLabel: 'Nuevo proveedor',
          actionIcon: 'bi-plus-lg',
          onActionClick: () => {
            window.location.hash = '#/proveedores/nuevo';
          },
        };
      }

      function mountList(statusValue: string): void {
        innerPage?.destroy();
        innerPage = createListPage<Proveedor>(buildOptions(statusValue));
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
