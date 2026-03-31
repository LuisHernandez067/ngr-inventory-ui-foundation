// Punto de entrada del paquete ui-core
// Exporta los componentes y utilidades de UI base para NGR Inventory

export const UI_CORE_VERSION = '0.0.1';

// Tipos compartidos
export * from './types';

// Componentes — exportados como namespaces para evitar colisiones de nombres
export * as Button from './components/button';
export * as Badge from './components/badge';
export * as Alert from './components/alert';
export * as Spinner from './components/spinner';
export * as EmptyState from './components/empty-state';
export * as Card from './components/card';
export * as Avatar from './components/avatar';
export * as Tooltip from './components/tooltip';
export * as ConfirmDialog from './components/confirm-dialog';
export * as PageHeader from './components/page-header';
