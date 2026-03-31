// Punto de entrada del paquete ui-patterns
// Exporta los patrones de composición de UI para NGR Inventory

export const UI_PATTERNS_VERSION = '0.0.1';

// Tipos compartidos de dominio
export * from './types';

// Patrones — exportados como namespaces para consistencia con ui-core
export * as StatusBadge from './patterns/status-badge';
export * as FilterChips from './patterns/filter-chips';
export * as SearchBar from './patterns/search-bar';
export * as Pagination from './patterns/pagination';
export * as FormField from './patterns/form-field';
export * as LoadingOverlay from './patterns/loading-overlay';
export * as ActionMenu from './patterns/action-menu';
export * as TableToolbar from './patterns/table-toolbar';
export * as ConfirmableButton from './patterns/confirmable-button';
export * as DataTable from './patterns/data-table';
