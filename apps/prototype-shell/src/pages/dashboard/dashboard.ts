// Página de dashboard — KPIs y actividad reciente
import { Badge } from '@ngr-inventory/ui-core';
import { DataTable } from '@ngr-inventory/ui-patterns';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';
import type { PageModule } from '../../router/router';

// ── Tipos locales ──────────────────────────────────────────────────────────────

/** Fila de actividad reciente */
interface ActivityRow {
  tipo: string;
  modulo: string;
  descripcion: string;
  usuario: string;
  fecha: string;
}

// ── Datos de actividad reciente (hardcoded) ────────────────────────────────────

const activityRows: ActivityRow[] = [
  { tipo: 'Entrada', modulo: 'Productos', descripcion: 'Recepción OC-2024-001', usuario: 'admin@ngr.com', fecha: 'Hace 5 min' },
  { tipo: 'Ajuste', modulo: 'Inventario', descripcion: 'Ajuste de stock — Bodega Norte', usuario: 'operador@ngr.com', fecha: 'Hace 23 min' },
  { tipo: 'Salida', modulo: 'Órdenes de Venta', descripcion: 'Despacho OV-2024-089', usuario: 'admin@ngr.com', fecha: 'Hace 1h' },
  { tipo: 'Alta', modulo: 'Proveedores', descripcion: 'Nuevo proveedor: Distribuidora ABC', usuario: 'supervisor@ngr.com', fecha: 'Hace 2h' },
  { tipo: 'Conteo', modulo: 'Inventario', descripcion: 'Conteo cíclico — Zona A', usuario: 'operador@ngr.com', fecha: 'Hace 3h' },
];

// ── Mapeo de tipo de actividad a variante de Badge ─────────────────────────────

/** Devuelve el HTML del badge según el tipo de actividad */
function renderTipoBadge(tipo: string): string {
  switch (tipo) {
    case 'Entrada':
      return Badge.render({ variant: 'success', text: tipo });
    case 'Salida':
      return Badge.render({ variant: 'danger', text: tipo });
    case 'Ajuste':
      return Badge.render({ variant: 'warning', text: tipo, className: 'text-dark' });
    case 'Alta':
      return Badge.render({ variant: 'primary', text: tipo });
    case 'Conteo':
      return Badge.render({ variant: 'info', text: tipo, className: 'text-dark' });
    default:
      return Badge.render({ variant: 'secondary', text: tipo });
  }
}

// ── Definición de columnas de la tabla de actividad reciente ───────────────────

const activityColumns: ColumnDef<ActivityRow>[] = [
  {
    key: 'tipo',
    header: 'Tipo',
    render: (value) => renderTipoBadge(String(value ?? '')),
  },
  { key: 'modulo', header: 'Módulo' },
  { key: 'descripcion', header: 'Descripción' },
  { key: 'usuario', header: 'Usuario' },
  { key: 'fecha', header: 'Fecha' },
];

// ── Datos de KPIs (hardcoded) ─────────────────────────────────────────────────

interface KpiConfig {
  title: string;
  value: string;
  icon: string;
  colorClass: string;
}

const kpis: KpiConfig[] = [
  { title: 'Productos activos', value: '1.247', icon: 'bi-box-seam', colorClass: 'text-primary' },
  { title: 'Proveedores', value: '89', icon: 'bi-truck', colorClass: 'text-success' },
  { title: 'Stock bajo mínimo', value: '23', icon: 'bi-exclamation-triangle', colorClass: 'text-warning' },
  { title: 'Movimientos hoy', value: '156', icon: 'bi-arrow-left-right', colorClass: 'text-info' },
];

// ── Helpers de renderizado ─────────────────────────────────────────────────────

/** Devuelve la fecha actual en formato español, ej. "martes, 31 de marzo de 2026" */
function fechaActualEspanol(): string {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Renderiza una tarjeta KPI individual */
function renderKpiCard(kpi: KpiConfig): string {
  return `
    <div class="col-12 col-sm-6 col-xl-3">
      <div class="card h-100">
        <div class="card-body d-flex align-items-center gap-3">
          <div class="fs-1 ${kpi.colorClass}"><i class="bi ${kpi.icon}"></i></div>
          <div>
            <div class="fs-4 fw-bold">${kpi.value}</div>
            <div class="text-muted small">${kpi.title}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── PageModule ─────────────────────────────────────────────────────────────────

export const dashboardPage: PageModule = {
  render(container: HTMLElement): void {
    // Construir HTML del encabezado y tarjetas KPI
    const kpiCardsHtml = kpis.map(renderKpiCard).join('');

    // Renderizar HTML de la tabla de actividad reciente
    const tableHtml = DataTable.render<ActivityRow>({
      columns: activityColumns,
      rows: activityRows,
    });

    container.innerHTML = `
      <div class="p-4">
        <!-- Encabezado de la página -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Dashboard</h1>
          <span class="text-muted small">Actualizado: ${fechaActualEspanol()}</span>
        </div>

        <!-- Fila de tarjetas KPI -->
        <div class="row g-3 mb-4">
          ${kpiCardsHtml}
        </div>

        <!-- Tabla de actividad reciente -->
        <h2 class="h5 mb-3">Actividad Reciente</h2>
        <div id="activity-table-container">
          ${tableHtml}
        </div>
      </div>
    `;

    // Inicializar listeners del DataTable
    const tableRoot = container.querySelector<HTMLElement>('.ngr-datatable-wrapper');
    if (tableRoot) {
      DataTable.init<ActivityRow>(tableRoot, { columns: activityColumns, rows: activityRows });
    }
  },

  destroy(): void {
    // Sin recursos asincrónicos ni listeners externos que limpiar
  },
};
