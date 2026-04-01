// Contratos de tipos locales del módulo Dashboard.
// Estos tipos son locales a prototype-shell — los contratos de API se migrarán
// a @ngr-inventory/api-contracts en una fase posterior.

/**
 * Métrica KPI mostrada en las tarjetas superiores del dashboard.
 * Cada métrica incluye valor actual, tendencia y presentación visual.
 */
export interface KpiMetric {
  /** Identificador único de la métrica */
  id: string;
  /** Etiqueta visible, ej. "Productos activos" */
  label: string;
  /** Valor numérico actual */
  value: number;
  /** Unidad de medida opcional, ej. "COP", "productos" */
  unit?: string;
  /** Dirección de la tendencia respecto al período anterior */
  trend: 'up' | 'down' | 'stable';
  /** Porcentaje de cambio de la tendencia, ej. 5.2 para +5.2% */
  trendPercent?: number;
  /** Clase de Bootstrap Icons, ej. "bi-box-seam" */
  icon: string;
  /** Clase de color Bootstrap, ej. "text-primary" */
  colorClass: string;
}

/**
 * Alerta operacional que requiere atención del usuario.
 * Solo visible para roles admin y operador.
 */
export interface DashboardAlert {
  /** Identificador único de la alerta */
  id: string;
  /** Tipo de alerta según su origen */
  tipo: 'bajo-stock' | 'orden-pendiente' | 'conteo-vencido';
  /** Severidad que determina el estilo visual */
  severity: 'danger' | 'warning' | 'info';
  /** Título corto de la alerta */
  titulo: string;
  /** Descripción detallada de la situación */
  descripcion: string;
  /** Ruta hash opcional para navegar al módulo relacionado, ej. "#/stock" */
  enlace?: string;
}

/**
 * Fila de movimiento de inventario reciente.
 * Visible para todos los roles en modo solo lectura.
 */
export interface MovementRow {
  /** Identificador único del movimiento */
  id: string;
  /** Número de comprobante del movimiento, ej. "MOV-2024-001" */
  numero: string;
  /** Tipo de operación de inventario */
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  /** Descripción libre del movimiento */
  descripcion: string;
  /** Email o nombre del usuario que realizó el movimiento */
  usuario: string;
  /** Fecha/hora en formato ISO 8601, ej. "2024-03-31T14:30:00Z" */
  fecha: string;
}

/**
 * Contrato que deben implementar todos los widgets del dashboard.
 * El orquestador (dashboard.ts) filtra y monta widgets según este contrato.
 */
export interface DashboardWidget {
  /** Identificador único del widget */
  id: string;
  /** Roles que tienen permiso de ver este widget */
  allowedRoles: ('admin' | 'operador' | 'consulta')[];
  /**
   * Renderiza el widget dentro del contenedor dado.
   * La señal de cancelación es provista por el orquestador — se pasa a los fetches.
   */
  render(container: HTMLElement, signal: AbortSignal): Promise<void>;
  /** Limpia recursos internos del widget (listeners, etc.) */
  destroy(): void;
}
