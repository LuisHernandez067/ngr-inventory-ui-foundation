// Widget del panel de movimientos — muestra una tabla de movimientos recientes.
// Visible para todos los roles en modo solo lectura.
import { Spinner, Alert, Badge } from '@ngr-inventory/ui-core';
import { DataTable } from '@ngr-inventory/ui-patterns';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';

import { fetchMovements } from '../dashboardService';
import type { MovementRow } from '../types';

// ── Mapeo de tipo de movimiento a variante de Badge ───────────────────────────

/** Devuelve el HTML del badge según el tipo de movimiento */
function renderTipoBadge(tipo: MovementRow['tipo']): string {
  const variantMap: Record<MovementRow['tipo'], { variant: string; label: string }> = {
    entrada: { variant: 'success', label: 'Entrada' },
    salida: { variant: 'danger', label: 'Salida' },
    ajuste: { variant: 'warning', label: 'Ajuste' },
    transferencia: { variant: 'info', label: 'Transferencia' },
  };
  const config = variantMap[tipo];
  return Badge.render({ variant: config.variant as 'success', text: config.label });
}

// ── Definición de columnas del DataTable ──────────────────────────────────────

/** Columnas del DataTable de movimientos */
const MOVEMENT_COLUMNS: ColumnDef<MovementRow>[] = [
  {
    key: 'fecha',
    header: 'Fecha',
    render: (val) => new Date(String(val)).toLocaleDateString('es-CO'),
  },
  { key: 'numero', header: 'Número' },
  {
    key: 'tipo',
    header: 'Tipo',
    render: (val) => renderTipoBadge(val as MovementRow['tipo']),
  },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'usuario',
    header: 'Usuario',
    render: (val) => `<span class="text-muted small">${String(val)}</span>`,
  },
];

// ── Estado de error con reintento ─────────────────────────────────────────────

/** Inyecta el estado de error con botón de reintento y configura el listener */
function showError(container: HTMLElement, signal: AbortSignal, retryId: string): void {
  const errorHtml = Alert.render({
    variant: 'danger',
    message: 'Error al cargar los movimientos.',
    showIcon: true,
  });

  container.innerHTML = `
    <div>
      ${errorHtml}
      <button id="${retryId}" type="button" class="btn btn-sm btn-outline-secondary mt-2">
        <i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Reintentar
      </button>
    </div>
  `.trim();

  // Listener con { once: true } para evitar acumulación de handlers en reintentos
  container.querySelector(`#${retryId}`)?.addEventListener(
    'click',
    () => {
      renderMovementsPanel(container, signal);
    },
    { once: true }
  );
}

// ── Función exportada del widget ──────────────────────────────────────────────

/**
 * Renderiza el widget de movimientos recientes dentro del contenedor dado.
 * Muestra spinner durante la carga, la tabla al recibir datos,
 * o un mensaje de error con reintento si la petición falla.
 *
 * @param container - Elemento HTML donde se montará el widget
 * @param signal - Señal de cancelación provista por el orquestador
 */
export function renderMovementsPanel(container: HTMLElement, signal: AbortSignal): void {
  // Mostrar spinner de carga
  container.innerHTML = `<div class="text-center py-3">${Spinner.render({ variant: 'primary', label: 'Cargando movimientos...' })}</div>`;

  fetchMovements(signal)
    .then((movements) => {
      // DataTable maneja el estado vacío internamente mediante emptyTitle/emptyDescription
      container.innerHTML = DataTable.render<MovementRow>({
        columns: MOVEMENT_COLUMNS,
        rows: movements,
        emptyIcon: 'arrow-left-right',
        emptyTitle: 'Sin movimientos recientes',
        emptyDescription: 'No se registraron movimientos en el período actual.',
      });
    })
    .catch((error: unknown) => {
      // AbortError es esperado al navegar — no mostrar error al usuario
      if (error instanceof Error && error.name === 'AbortError') return;
      showError(container, signal, 'movements-retry-btn');
    });
}
