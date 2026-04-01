// Orquestador del Dashboard Operativo — filtra y monta widgets según el rol del usuario.
// Cada widget es un módulo independiente con su propio ciclo de vida de carga y error.
import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';

import { renderAlertsPanel } from './widgets/alertsPanel';
import { renderKpiCards } from './widgets/kpiCards';
import { renderMovementsPanel } from './widgets/movementsPanel';
import { renderQuickAccess } from './widgets/quickAccess';

// ── Tipos del registro de widgets ──────────────────────────────────────────────

/**
 * Entrada del registro de widgets del orquestador.
 * Encapsula la función de renderizado, el ID del contenedor en el DOM
 * y los roles que tienen permiso de ver el widget.
 * Si `roles` está ausente, el widget es visible para todos los roles.
 */
export interface WidgetRegistryEntry {
  /** Identificador único del widget — usado para depuración y aria */
  id: string;
  /** ID del elemento contenedor en el DOM, ej. "kpi-cards" */
  containerId: string;
  /**
   * Función de renderizado del widget.
   * Recibe el contenedor y la señal de cancelación del orquestador.
   */
  render: (container: HTMLElement, signal: AbortSignal) => void;
  /**
   * Roles con permiso de ver este widget.
   * Si está ausente, el widget es visible para todos los roles.
   */
  roles?: ('admin' | 'operador' | 'consulta')[];
}

// ── Registro de widgets del dashboard ─────────────────────────────────────────

/**
 * WIDGET_REGISTRY define el orden y condiciones de visibilidad de cada widget.
 * El orquestador itera este registro para montar únicamente los permitidos.
 *
 * Nota: alertsPanel está restringido a ['admin', 'operador'] como primera capa
 * de defensa. El propio widget también verifica el rol internamente (defensa en profundidad).
 */
export const WIDGET_REGISTRY: WidgetRegistryEntry[] = [
  {
    id: 'kpi-cards',
    containerId: 'kpi-cards',
    render: renderKpiCards,
    // Sin restricción de roles — visible para todos
  },
  {
    id: 'alerts-panel',
    containerId: 'alerts-panel',
    render: renderAlertsPanel,
    // Solo admin y operador — rol consulta excluido a nivel de registro
    roles: ['admin', 'operador'],
  },
  {
    id: 'movements-panel',
    containerId: 'movements-panel',
    render: renderMovementsPanel,
    // Sin restricción de roles — visible para todos
  },
  {
    id: 'quick-access',
    containerId: 'quick-access',
    // quickAccess es síncrono — el signal se acepta pero no se usa (no hay fetch interno)
    render: (container: HTMLElement, _signal: AbortSignal) => {
      renderQuickAccess(container);
    },
    // Solo admin y operador — rol consulta excluido: solo ve KPIs y movimientos (lectura)
    roles: ['admin', 'operador'],
  },
];

// ── Helpers de renderizado del scaffold ───────────────────────────────────────

/** Devuelve la fecha actual en formato español, ej. "martes, 31 de marzo de 2026" */
function fechaActualEspanol(): string {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Renderiza el scaffold HTML del dashboard con los contenedores de widgets.
 * Cada contenedor se pre-rellena vacío — los widgets escriben su contenido al montarse.
 */
function renderScaffold(container: HTMLElement): void {
  container.innerHTML = `
    <div class="p-4">
      <!-- Encabezado de la página -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0">Dashboard</h1>
        <span class="text-muted small">Actualizado: ${fechaActualEspanol()}</span>
      </div>

      <!-- Contenedor de tarjetas KPI -->
      <div class="mb-4" id="kpi-cards"></div>

      <!-- Fila de paneles secundarios -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Alertas Operacionales</div>
            <div class="card-body p-0" id="alerts-panel"></div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">Movimientos Recientes</div>
            <div class="card-body p-0" id="movements-panel"></div>
          </div>
        </div>
      </div>

      <!-- Acceso rápido -->
      <div class="card mb-4">
        <div class="card-header fw-semibold">Acceso Rápido</div>
        <div class="card-body" id="quick-access"></div>
      </div>
    </div>
  `.trim();
}

// ── Función de montaje interno ────────────────────────────────────────────────

/**
 * Monta los widgets filtrados por rol dentro del contenedor dado.
 * Devuelve la función de limpieza que aborta todos los fetches en vuelo.
 *
 * @param container - Elemento raíz del dashboard
 * @returns Función de limpieza que llama a controller.abort()
 */
function mount(container: HTMLElement): () => void {
  // Un único AbortController controla el ciclo de vida de todos los widgets de la página
  const controller = new AbortController();

  // Obtener el rol del usuario — null si no está autenticado
  const role = authService.getProfile();

  // Montar cada widget del registro según el rol y la existencia del contenedor en el DOM
  for (const widget of WIDGET_REGISTRY) {
    // Verificar permiso de rol: si el widget define roles, el usuario debe estar incluido
    if (widget.roles !== undefined) {
      if (role === null || !widget.roles.includes(role)) {
        // Rol no permitido — saltar widget sin renderizar ni fetchear
        continue;
      }
    }

    // Buscar el contenedor en el DOM
    const widgetContainer = container.querySelector<HTMLElement>(`#${widget.containerId}`);
    if (!widgetContainer) {
      // Contenedor no encontrado en el DOM — saltar sin lanzar error
      continue;
    }

    // Montar el widget pasando la señal del AbortController
    widget.render(widgetContainer, controller.signal);
  }

  // Retornar función de limpieza que aborta todos los fetches en vuelo
  return () => {
    controller.abort();
  };
}

// ── PageModule ─────────────────────────────────────────────────────────────────

// Variable de módulo que guarda la función de limpieza del ciclo de vida activo
let currentCleanup: (() => void) | null = null;

/**
 * Módulo de la página Dashboard.
 * Implementa PageModule para integrarse con el router hash-based.
 *
 * render() construye el scaffold HTML y monta los widgets filtrados por rol.
 * destroy() llama a la función de limpieza que aborta todos los fetches en vuelo.
 */
export const dashboardPage: PageModule = {
  render(container: HTMLElement): void {
    // Construir el scaffold HTML con todos los contenedores de widgets
    renderScaffold(container);

    // Montar widgets y guardar la función de limpieza para destroy()
    currentCleanup = mount(container);
  },

  destroy(): void {
    // Abortar todos los fetches en vuelo — señal de limpieza del ciclo de vida
    if (currentCleanup !== null) {
      currentCleanup();
      currentCleanup = null;
    }
  },
};
