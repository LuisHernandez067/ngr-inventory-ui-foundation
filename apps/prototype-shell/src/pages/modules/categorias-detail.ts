// Página de detalle de Categoría — muestra información completa con badge de productoCount
import type { Categoria } from '@ngr-inventory/api-contracts';
import { Spinner, Badge, ConfirmDialog } from '@ngr-inventory/ui-core';
import type { BadgeVariant } from '@ngr-inventory/ui-core';
import { ActionMenu } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para el fetch en vuelo */
let abortController: AbortController | null = null;

/** Mapeo de estado de categoría a variante de Bootstrap Badge */
const STATUS_VARIANT: Record<Categoria['status'], BadgeVariant> = {
  active: 'success',
  inactive: 'secondary',
};

/** Mapeo de estado de categoría a etiqueta en español */
const STATUS_LABEL: Record<Categoria['status'], string> = {
  active: 'Activo',
  inactive: 'Inactivo',
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
    '<span>No se pudo eliminar la categoría. Intente nuevamente.</span>';

  // Insertar la alerta después de la barra superior
  const topBar = container.querySelector<HTMLElement>(
    '.d-flex.align-items-center.justify-content-between'
  );
  topBar?.insertAdjacentElement('afterend', alert);
}

/**
 * Construye el mensaje de confirmación para eliminación de categoría.
 * Si tiene productos asociados, incluye la advertencia de impacto.
 */
function buildDeleteMessage(productoCount: number | undefined): string {
  if (productoCount !== undefined && productoCount > 0) {
    return `Esta categoría tiene ${String(productoCount)} producto(s) asociado(s). Eliminarla puede afectar el catálogo. ¿Deseas continuar?`;
  }
  return '¿Estás seguro? Esta acción no se puede deshacer.';
}

/**
 * Gestiona el flujo completo de confirmación y eliminación de una categoría.
 * Incluye advertencia de impacto cuando hay productos asociados.
 */
async function handleDelete(
  container: HTMLElement,
  id: string,
  productoCount: number | undefined,
  signal: AbortSignal | undefined
): Promise<void> {
  const message = buildDeleteMessage(productoCount);

  const confirmed = await ConfirmDialog.confirm({
    title: 'Eliminar categoría',
    message,
  });

  if (!confirmed) return;

  try {
    await apiFetch<undefined>(`/api/categorias/${id}`, {
      method: 'DELETE',
      signal: signal ?? null,
    });
    window.location.hash = '#/categorias';
  } catch (error: unknown) {
    // Ignorar errores de cancelación — ocurren al navegar fuera de la página
    if (error instanceof Error && error.name === 'AbortError') return;
    showDeleteError(container);
  }
}

/**
 * Genera el HTML del badge de cantidad de productos asociados.
 * Solo se muestra cuando productoCount está presente.
 */
function buildProductoCountBadge(count: number | undefined): string {
  if (count === undefined) return '';
  const label = count === 1 ? '1 producto asociado' : `${String(count)} productos asociados`;
  return Badge.render({ variant: 'info', text: label, pill: true });
}

/**
 * Genera la alerta de impacto cuando la categoría tiene productos asociados.
 * Muestra advertencia en amber para el rol operador/admin antes de eliminar.
 */
function buildImpactAlert(count: number | undefined): string {
  if (count === undefined || count === 0) return '';
  const noun = count === 1 ? 'producto asociado' : 'productos asociados';
  return `
    <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert" id="impact-warning">
      <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
      <span>Esta categoría tiene ${String(count)} ${noun}. Eliminarla afectará el catálogo.</span>
    </div>
  `;
}

/**
 * Renderiza el layout completo del detalle de categoría una vez que los datos están disponibles.
 */
function renderDetail(container: HTMLElement, categoria: Categoria): void {
  // Verificar rol — consulta no puede ver ni editar ni eliminar
  const profile = authService.getProfile();
  const isConsulta = profile === 'consulta';

  // Construir badge de estado
  const statusVariant = STATUS_VARIANT[categoria.status];
  const statusLabel = STATUS_LABEL[categoria.status];
  const statusBadge = Badge.render({ variant: statusVariant, text: statusLabel, pill: true });

  // Badge de productos asociados
  const productoCountBadge = buildProductoCountBadge(categoria.productoCount);

  // Alerta de impacto — solo visible si hay productos asociados
  const impactAlert = buildImpactAlert(categoria.productoCount);

  // Construir ActionMenu solo para roles con permisos de escritura
  const actionMenuHtml = isConsulta
    ? ''
    : ActionMenu.render({
        id: 'categoria-actions',
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
          Volver a Categorías
        </button>
        <div class="d-flex align-items-center gap-2">
          ${actionMenuHtml}
        </div>
      </div>

      <!-- Encabezado con nombre y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0">${categoria.nombre}</h1>
        ${statusBadge}
        ${productoCountBadge}
      </div>
      <p class="text-muted mb-3">Código: ${categoria.codigo}</p>

      <!-- Alerta de impacto cuando hay productos asociados -->
      ${impactAlert}

      <!-- Tarjeta de información de la categoría -->
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header fw-semibold">
              <i class="bi bi-tag me-2" aria-hidden="true"></i>
              Información
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                ${dtRow('Código', categoria.codigo)}
                ${dtRow('Nombre', categoria.nombre)}
                ${dtRow('Descripción', categoria.descripcion)}
                ${dtRow('Estado', statusLabel)}
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
    window.location.hash = '#/categorias';
  });

  // Inicializar ActionMenu solo si fue renderizado (rol no-consulta)
  if (!isConsulta) {
    const actionMenuRoot = container.querySelector<HTMLElement>('#categoria-actions');
    if (actionMenuRoot) {
      ActionMenu.init(actionMenuRoot);

      // Escuchar acciones del menú
      actionMenuRoot.addEventListener('ngr:action', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: string }>;
        if (customEvent.detail.id === 'edit') {
          // Navegar a la página de edición (Batch 4 lo completará)
          window.location.hash = `#/categorias/${categoria.id}/editar`;
        } else if (customEvent.detail.id === 'delete') {
          // Confirmar eliminación con advertencia de impacto si hay productos asociados
          void handleDelete(
            container,
            categoria.id,
            categoria.productoCount,
            abortController?.signal
          );
        }
      });
    }
  }
}

/** Página de detalle de Categoría */
export const categoriasDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    // Obtener id del parámetro de ruta o usar el primero de los fixtures
    const id = params?.['id'] ?? 'cat-001';

    // Cancelar cualquier petición anterior en vuelo
    abortController?.abort();
    abortController = new AbortController();

    // Mostrar spinner mientras se cargan los datos
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando categoría...' })}
      </div>
    `;

    // Realizar petición al endpoint de detalle
    apiFetch<Categoria>(`/api/categorias/${id}`, { signal: abortController.signal })
      .then((categoria) => {
        renderDetail(container, categoria);
      })
      .catch((error: unknown) => {
        // Ignorar errores de cancelación — ocurren al navegar fuera de la página
        if (error instanceof Error && error.name === 'AbortError') return;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>No se pudo cargar la categoría.</span>
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
