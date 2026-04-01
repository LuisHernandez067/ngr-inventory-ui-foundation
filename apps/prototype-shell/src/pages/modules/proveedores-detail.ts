// Página de detalle de Proveedor — muestra información completa con tarjetas de datos fiscales y contacto
import type { PageModule } from '../../router/router';
import type { Proveedor } from '@ngr-inventory/api-contracts';
import { Spinner, Badge } from '@ngr-inventory/ui-core';
import type { BadgeVariant } from '@ngr-inventory/ui-core';
import { ActionMenu } from '@ngr-inventory/ui-patterns';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para el fetch en vuelo */
let abortController: AbortController | null = null;

/** Mapeo de estado de proveedor a variante de Bootstrap Badge */
const STATUS_VARIANT: Record<Proveedor['status'], BadgeVariant> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'warning',
};

/** Mapeo de estado de proveedor a etiqueta en español */
const STATUS_LABEL: Record<Proveedor['status'], string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido',
};

/**
 * Genera el HTML de un par definición/valor para la lista de detalles.
 * Muestra un guión cuando el valor está ausente.
 */
function dtRow(label: string, value: string | undefined): string {
  const display = value ?? '—';
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${display}</dd>`
  );
}

/**
 * Renderiza el layout completo del detalle de proveedor una vez que los datos están disponibles.
 */
function renderDetail(container: HTMLElement, proveedor: Proveedor): void {
  // Construir badge de estado
  const statusVariant = STATUS_VARIANT[proveedor.status] ?? 'secondary';
  const statusLabel = STATUS_LABEL[proveedor.status] ?? proveedor.status;
  const statusBadge = Badge.render({
    variant: statusVariant,
    text: statusLabel,
    pill: true,
  });

  // Construir ActionMenu con opciones de edición y eliminación
  const actionMenuHtml = ActionMenu.render({
    id: 'proveedor-actions',
    size: 'sm',
    items: [
      { id: 'edit', label: 'Editar', icon: 'pencil' },
      { id: 'delete', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ],
  });

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: botón volver + acciones -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Proveedores
        </button>
        <div class="d-flex align-items-center gap-2">
          ${actionMenuHtml}
        </div>
      </div>

      <!-- Encabezado con razón social y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0">${proveedor.razonSocial}</h1>
        ${statusBadge}
      </div>
      <p class="text-muted mb-4">Código: ${proveedor.codigo}</p>

      <!-- Tarjetas de detalle en dos columnas -->
      <div class="row g-3">
        <!-- Tarjeta 1: Datos Fiscales -->
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-building me-2" aria-hidden="true"></i>
              Datos Fiscales
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('RUC / CUIT', proveedor.ruc)}
                ${dtRow('Razón Social', proveedor.razonSocial)}
                ${dtRow('Dirección', proveedor.direccion)}
              </dl>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Contacto -->
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-telephone me-2" aria-hidden="true"></i>
              Contacto
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Email', proveedor.email)}
                ${dtRow('Teléfono', proveedor.telefono)}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = '#/proveedores';
  });

  // Inicializar ActionMenu para habilitar el dropdown de Bootstrap
  const actionMenuRoot = container.querySelector<HTMLElement>('#proveedor-actions');
  if (actionMenuRoot) {
    ActionMenu.init(actionMenuRoot);

    // Escuchar acciones del menú
    actionMenuRoot.addEventListener('ngr:action', (event: Event) => {
      const customEvent = event as CustomEvent<{ id: string }>;
      if (customEvent.detail.id === 'edit') {
        // Navegar a la página de edición (funcionalidad futura)
        window.location.hash = `#/proveedores/${proveedor.id}/editar`;
      } else if (customEvent.detail.id === 'delete') {
        // Confirmación de eliminación (funcionalidad futura)
        alert(`Eliminar proveedor ${proveedor.razonSocial} — funcionalidad próximamente`);
      }
    });
  }
}

/** Página de detalle de Proveedor */
export const proveedoresDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    // Obtener id del parámetro de ruta o usar el primero de los fixtures
    const id = params?.['id'] ?? 'prov-001';

    // Cancelar cualquier petición anterior en vuelo
    abortController?.abort();
    abortController = new AbortController();

    // Mostrar spinner mientras se cargan los datos
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando proveedor...' })}
      </div>
    `;

    // Realizar petición al endpoint de detalle
    apiFetch<Proveedor>(`/api/proveedores/${id}`, { signal: abortController.signal })
      .then((proveedor) => {
        renderDetail(container, proveedor);
      })
      .catch((error: unknown) => {
        // Ignorar errores de cancelación — ocurren al navegar fuera de la página
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar el proveedor.</span>
            </div>
          </div>
        `;
      });
  },

  destroy(): void {
    // Cancelar la petición en vuelo al destruir la página
    abortController?.abort();
    abortController = null;
  },
};
