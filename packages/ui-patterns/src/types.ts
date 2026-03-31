// Tipos compartidos para los patrones de composición UI de NGR Inventory
import type { ComponentProps, ButtonVariant, BadgeVariant } from '@ngr-inventory/ui-core';

// Re-exportar tipos base de ui-core que los patrones necesitan
export type { ComponentProps, ButtonVariant, BadgeVariant };

/** Estados de dominio disponibles en el sistema NGR Inventory */
export type NgrStatus =
  | 'activo'
  | 'inactivo'
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'en_transito'
  | 'reservado';

/** Definición de una columna de la tabla de datos */
export interface ColumnDef<T = Record<string, unknown>> {
  /** Clave del campo en el objeto de fila */
  key: keyof T & string;
  /** Encabezado visible de la columna */
  header: string;
  /** Habilita ordenamiento por esta columna */
  sortable?: boolean;
  /** Ancho CSS opcional de la columna */
  width?: string;
  /** Renderizador personalizado — devuelve HTML como string */
  render?: (value: unknown, row: T) => string;
}

/** Chip de filtro activo */
export interface FilterChip {
  /** Clave identificadora del filtro */
  key: string;
  /** Etiqueta visible del filtro */
  label: string;
  /** Valor del filtro aplicado */
  value: string;
}

/** Elemento de menú de acciones */
export interface ActionMenuItem {
  /** Identificador único de la acción */
  id: string;
  /** Etiqueta visible del ítem */
  label: string;
  /** Clase de Bootstrap Icons opcional, e.g. 'pencil' */
  icon?: string;
  /** Deshabilita el ítem */
  disabled?: boolean;
  /** Variante visual del ítem (por defecto 'default') */
  variant?: 'default' | 'danger';
}

/** Props para el componente DataTable */
export interface DataTableProps<T = Record<string, unknown>> extends ComponentProps {
  /** Definición de columnas de la tabla */
  columns: ColumnDef<T>[];
  /** Filas de datos a mostrar */
  rows: T[];
  /** Muestra el overlay de carga cuando es true */
  loading?: boolean;
  /** Ícono del estado vacío (Bootstrap Icons) */
  emptyIcon?: string;
  /** Título del estado vacío */
  emptyTitle?: string;
  /** Descripción del estado vacío */
  emptyDescription?: string;
  /** Callback invocado al hacer clic en una fila */
  onRowClick?: (row: T) => void;
}

/** Props para el componente TableToolbar */
export interface TableToolbarProps extends ComponentProps {
  /** Muestra la barra de búsqueda */
  showSearch?: boolean;
  /** Placeholder del campo de búsqueda */
  searchPlaceholder?: string;
  /** Chips de filtros activos */
  filters?: FilterChip[];
  /** HTML pre-renderizado para los botones de acciones del slot */
  actions?: string;
}
