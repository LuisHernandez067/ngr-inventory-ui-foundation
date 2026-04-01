// Página de detalle de Producto — muestra información completa con dos tarjetas
import type { Producto, NgrProductoStatus } from '@ngr-inventory/api-contracts';
import { Spinner, Badge, ConfirmDialog } from '@ngr-inventory/ui-core';
import type { BadgeVariant } from '@ngr-inventory/ui-core';
import { ActionMenu } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para el fetch en vuelo */
let abortController: AbortController | null = null;

/** Mapeo de estado de producto a variante de Bootstrap Badge */
const STATUS_VARIANT: Record<NgrProductoStatus, BadgeVariant> = {
  active: 'success',
  inactive: 'secondary',
  discontinued: 'warning',
};

/** Mapeo de estado de producto a etiqueta en español */
const STATUS_LABEL: Record<NgrProductoStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  discontinued: 'Descontinuado',
};

/**
 * Formatea un número como precio en pesos argentinos.
 * Ej.: 28500 → "$28.500,00"
 */
function formatPrice(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

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
 * Muestra un mensaje de error inline en el contenedor cuando la eliminación falla.
 */
function showDeleteError(container: HTMLElement): void {
  // Eliminar alerta previa si existe
  container.querySelector('#delete-error')?.remove();

  const alert = document.createElement('div');
  alert.id = 'delete-error';
  alert.className = 'alert alert-danger d-flex align-items-center gap-2 mt-3';
  alert.setAttribute('role', 'alert');
  alert.innerHTML =
    '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
    '<span>No se pudo eliminar el producto. Intente nuevamente.</span>';

  // Insertar la alerta después de la barra superior
  const topBar = container.querySelector<HTMLElement>(
    '.d-flex.align-items-center.justify-content-between'
  );
  topBar?.insertAdjacentElement('afterend', alert);
}

/**
 * Gestiona el flujo completo de confirmación y eliminación de un producto.
 * Muestra el diálogo de confirmación y, si se confirma, llama al endpoint DELETE.
 */
async function handleDelete(
  container: HTMLElement,
  id: string,
  signal: AbortSignal | undefined
): Promise<void> {
  const confirmed = await ConfirmDialog.confirm({
    title: 'Eliminar producto',
    message: '¿Estás seguro? Esta acción no se puede deshacer.',
  });

  if (!confirmed) return;

  try {
    await apiFetch<undefined>(`/api/productos/${id}`, { method: 'DELETE', signal: signal ?? null });
    window.location.hash = '#/productos';
  } catch (error: unknown) {
    // Ignorar errores de cancelación — ocurren al navegar fuera de la página
    if (error instanceof Error && error.name === 'AbortError') return;
    showDeleteError(container);
  }
}

/**
 * Renderiza el layout completo del detalle de producto una vez que los datos están disponibles.
 */
function renderDetail(container: HTMLElement, producto: Producto): void {
  // Construir badge de estado
  const statusVariant = STATUS_VARIANT[producto.status];
  const statusLabel = STATUS_LABEL[producto.status];
  const statusBadge = Badge.render({ variant: statusVariant, text: statusLabel, pill: true });

  // Verificar si el usuario tiene rol de sólo lectura
  const isConsulta = authService.getProfile() === 'consulta';

  // Construir ActionMenu solo para roles con permisos de escritura
  const actionMenuHtml = isConsulta
    ? ''
    : ActionMenu.render({
        id: 'producto-actions',
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
          Volver a Productos
        </button>
        <div class="d-flex align-items-center gap-2">
          ${actionMenuHtml}
        </div>
      </div>

      <!-- Encabezado con nombre y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0">${producto.nombre}</h1>
        ${statusBadge}
      </div>
      <p class="text-muted mb-4">Código: ${producto.codigo}</p>

      <!-- Tarjetas de detalle en dos columnas -->
      <div class="row g-3">
        <!-- Tarjeta 1: Información General -->
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
              Información General
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Código', producto.codigo)}
                ${dtRow('Categoría', producto.categoriaNombre)}
                ${dtRow('Proveedor', producto.proveedorNombre)}
                ${dtRow('Unidad de Medida', producto.unidadMedida)}
                ${dtRow('Precio Costo', formatPrice(producto.precioUnitario))}
                ${dtRow('Descripción', producto.descripcion)}
              </dl>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Stock -->
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-boxes me-2" aria-hidden="true"></i>
              Stock
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Stock Mínimo', String(producto.stockMinimo))}
                ${dtRow('Stock Máximo', producto.stockMaximo !== undefined ? String(producto.stockMaximo) : undefined)}
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
    window.location.hash = '#/productos';
  });

  // Inicializar ActionMenu solo si está presente (no consulta)
  if (!isConsulta) {
    const actionMenuRoot = container.querySelector<HTMLElement>('#producto-actions');
    if (actionMenuRoot) {
      ActionMenu.init(actionMenuRoot);

      // Escuchar acciones del menú
      actionMenuRoot.addEventListener('ngr:action', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: string }>;
        if (customEvent.detail.id === 'edit') {
          // Navegar a la página de edición del producto
          window.location.hash = `#/productos/${producto.id}/editar`;
        } else if (customEvent.detail.id === 'delete') {
          // Confirmar eliminación y llamar al endpoint DELETE
          void handleDelete(container, producto.id, abortController?.signal);
        }
      });
    }
  }
}

/** Página de detalle de Producto */
export const productosDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    // Obtener id del parámetro de ruta o usar el primero de los fixtures
    const id = params?.['id'] ?? 'prod-001';

    // Cancelar cualquier petición anterior en vuelo
    abortController?.abort();
    abortController = new AbortController();

    // Mostrar spinner mientras se cargan los datos
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando producto...' })}
      </div>
    `;

    // Realizar petición al endpoint de detalle
    apiFetch<Producto>(`/api/productos/${id}`, { signal: abortController.signal })
      .then((producto) => {
        renderDetail(container, producto);
      })
      .catch((error: unknown) => {
        // Ignorar errores de cancelación — ocurren al navegar fuera de la página
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar el producto.</span>
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
