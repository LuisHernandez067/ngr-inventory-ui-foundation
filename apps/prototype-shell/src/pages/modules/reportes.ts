// Página de lista de Reportes — implementación con createListPage()
import type { ReporteDefinicion } from '@ngr-inventory/api-contracts';
import { createListPage } from '../_shared/createListPage';
import type { ColumnDef } from '../_shared/createListPage';

/** Columnas de la tabla de reportes */
const columns: ColumnDef<ReporteDefinicion>[] = [
  { key: 'nombre', header: 'Nombre' },
  { key: 'tipo', header: 'Tipo', width: '140px' },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'formatos',
    header: 'Formatos',
    width: '140px',
    render: (value) => {
      // Mostrar cada formato como badge inline
      const formatos = Array.isArray(value) ? (value as string[]) : [];
      return formatos
        .map((f) => `<span class="badge bg-secondary me-1">${f.toUpperCase()}</span>`)
        .join('');
    },
  },
];

/** Página de listado de reportes disponibles */
export const reportesPage = createListPage<ReporteDefinicion>({
  title: 'Reportes',
  endpoint: '/api/reportes',
  columns,
  searchPlaceholder: 'Buscar reportes...',
  actionLabel: 'Nuevo reporte',
  actionIcon: 'bi-plus-lg',
});
