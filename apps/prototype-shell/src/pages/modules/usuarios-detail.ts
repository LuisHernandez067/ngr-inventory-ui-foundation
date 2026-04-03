// Página de detalle de Usuario — muestra información, estado activo/inactivo y acciones gateadas
import type { Usuario } from '@ngr-inventory/api-contracts';
import { ConfirmDialog, Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Formatea una fecha ISO a formato legible en es-CO.
 * Retorna un guión si la fecha no está disponible.
 */
function formatFecha(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Genera el badge de estado activo/inactivo con clases Bootstrap semánticas.
 */
function buildActivoBadge(activo: boolean): string {
  if (activo) {
    return `<span class="badge bg-success" id="activo-badge" role="status" aria-label="Estado: Activo">Activo</span>`;
  }
  return `<span class="badge bg-danger" id="activo-badge" role="status" aria-label="Estado: Inactivo">Inactivo</span>`;
}

/**
 * Genera el HTML de una fila definición/valor para la lista de detalles.
 */
function dtRow(label: string, value: string): string {
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${value}</dd>`
  );
}

/**
 * Renderiza el layout completo del detalle una vez que los datos están disponibles.
 * Se puede llamar de nuevo para re-renderizar tras un toggle de estado.
 */
function renderDetail(container: HTMLElement, usuario: Usuario): void {
  const canGestionar = authService.hasPermission('usuarios.gestionar');

  const activoBadge = buildActivoBadge(usuario.activo);
  const toggleLabel = usuario.activo ? 'Desactivar usuario' : 'Activar usuario';
  const toggleBtnClass = usuario.activo
    ? 'btn btn-outline-danger btn-sm'
    : 'btn btn-outline-success btn-sm';
  const toggleIcon = usuario.activo ? 'bi-person-slash' : 'bi-person-check';

  const infoRows = [
    dtRow('Email', usuario.email),
    dtRow('Nombre', `${usuario.nombre} ${usuario.apellido}`),
    dtRow('Rol', usuario.rolNombre),
    dtRow('Teléfono', usuario.telefono ?? '—'),
    dtRow('Último acceso', formatFecha(usuario.ultimoAcceso)),
    dtRow('Creado por', usuario.createdBy ?? '—'),
    dtRow('Actualizado por', usuario.updatedBy ?? '—'),
    dtRow('Fecha de creación', formatFecha(usuario.createdAt)),
    dtRow('Última actualización', formatFecha(usuario.updatedAt)),
  ].join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 860px;">
      <!-- Barra superior: botón volver -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver a la lista de usuarios">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Usuarios
        </button>
      </div>

      <!-- Encabezado: nombre completo y badge de estado -->
      <div class="d-flex align-items-center gap-3 mb-1">
        <h1 class="h3 mb-0" id="usuario-nombre">${usuario.nombre} ${usuario.apellido}</h1>
        ${activoBadge}
      </div>
      <p class="text-muted mb-4">${usuario.email}</p>

      <!-- Acciones: editar y toggle activo (gateadas por permiso) -->
      ${
        canGestionar
          ? `<div class="d-flex gap-2 flex-wrap mb-4" id="usuario-actions">
              <a href="#/usuarios/${usuario.id}/editar"
                class="btn btn-primary btn-sm"
                aria-label="Editar datos del usuario">
                <i class="bi bi-pencil me-1" aria-hidden="true"></i>
                Editar
              </a>
              <button type="button"
                id="btn-toggle-activo"
                class="${toggleBtnClass}"
                aria-label="${toggleLabel}">
                <i class="bi ${toggleIcon} me-1" aria-hidden="true"></i>
                ${toggleLabel}
              </button>
            </div>`
          : ''
      }

      <!-- Información del usuario -->
      <div class="card">
        <div class="card-header fw-semibold">
          <i class="bi bi-person-circle me-2" aria-hidden="true"></i>
          Información del usuario
        </div>
        <div class="card-body">
          <dl class="row mb-0">
            ${infoRows}
          </dl>
        </div>
      </div>
    </div>
  `;

  // Listener del botón volver
  container.querySelector<HTMLButtonElement>('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/usuarios';
  });

  // Listener del botón toggle-activo (solo si el usuario tiene permiso)
  if (canGestionar) {
    container
      .querySelector<HTMLButtonElement>('#btn-toggle-activo')
      ?.addEventListener('click', () => {
        void handleToggleActivo(container, usuario);
      });
  }
}

/**
 * Gestiona el flujo de toggle de estado activo: confirmación → PATCH → re-render.
 */
async function handleToggleActivo(container: HTMLElement, usuario: Usuario): Promise<void> {
  const nuevoEstado = usuario.activo ? 'inactivo' : 'activo';
  const confirmed = await ConfirmDialog.confirm({
    title: usuario.activo ? 'Desactivar usuario' : 'Activar usuario',
    message: `¿Confirmás que querés cambiar el estado de "${usuario.nombre} ${usuario.apellido}" a ${nuevoEstado}?`,
  });
  if (!confirmed) return;

  const signal = abortController?.signal ?? undefined;

  try {
    const actualizado = await apiFetch<Usuario>(`/api/usuarios/${usuario.id}/toggle-activo`, {
      method: 'PATCH',
      ...(signal ? { signal } : {}),
    });

    renderDetail(container, actualizado);

    // Mover el foco al badge de estado tras el cambio para accesibilidad
    container.querySelector<HTMLElement>('#activo-badge')?.focus();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    // Mostrar error inline debajo de las acciones
    container.querySelector('#toggle-error')?.remove();
    const actionsEl = container.querySelector<HTMLElement>('#usuario-actions');
    if (actionsEl) {
      const alert = document.createElement('div');
      alert.id = 'toggle-error';
      alert.className = 'alert alert-danger d-flex align-items-center gap-2 mt-3';
      alert.setAttribute('role', 'alert');
      alert.innerHTML =
        '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
        '<span>No se pudo cambiar el estado del usuario. Intentá nuevamente.</span>';
      actionsEl.insertAdjacentElement('afterend', alert);
    }
  }
}

/** Módulo de página de detalle de Usuario */
export const usuariosDetailPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? '';

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Mostrar spinner durante la carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando usuario...' })}
      </div>
    `;

    apiFetch<Usuario>(`/api/usuarios/${id}`, { signal })
      .then((usuario) => {
        renderDetail(container, usuario);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        const is404 = error instanceof ApiError && error.status === 404;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>${is404 ? 'El usuario solicitado no existe.' : 'No se pudo cargar el usuario.'}</span>
            </div>
            <a href="#/usuarios" class="btn btn-secondary mt-3">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Usuarios
            </a>
          </div>
        `;
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
