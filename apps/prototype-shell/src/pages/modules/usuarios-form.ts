// Página de creación/edición de Usuario — formulario con selección de rol y campo de contraseña (solo creación)
import type { PaginatedResponse, Rol, Usuario } from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Construye la opción HTML para un rol en el select.
 */
function rolOption(rol: Rol, selectedId?: string): string {
  const selected = rol.id === selectedId ? ' selected' : '';
  return `<option value="${rol.id}"${selected}>${rol.nombre}</option>`;
}

/**
 * Renderiza una alerta global de error en el contenedor del formulario.
 * Reemplaza cualquier alerta previa para no acumular mensajes.
 */
function renderGlobalAlert(container: HTMLElement, message: string): void {
  container.querySelector('.alert-global')?.remove();

  const alert = document.createElement('div');
  alert.className = 'alert alert-danger d-flex align-items-center gap-2 mb-3 alert-global';
  alert.setAttribute('role', 'alert');
  alert.innerHTML =
    '<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>' +
    `<span>${message}</span>`;

  const form = container.querySelector('form');
  if (form) {
    form.insertAdjacentElement('beforebegin', alert);
  } else {
    container.prepend(alert);
  }
}

/**
 * Renderiza el formulario completo con los datos de catálogo cargados.
 * En modo edición prefillba todos los campos con los datos del usuario.
 */
function renderForm(
  container: HTMLElement,
  options: {
    roles: Rol[];
    usuario: Usuario | null;
    signal: AbortSignal;
  }
): void {
  const { roles, usuario, signal } = options;
  const isEdit = usuario !== null;
  const titulo = isEdit ? 'Editar Usuario' : 'Nuevo Usuario';
  const backUrl = usuario !== null ? `#/usuarios/${usuario.id}` : '#/usuarios';
  const backLabel = isEdit ? 'Volver al detalle' : 'Volver a Usuarios';

  const rolesOptions = roles.map((r) => rolOption(r, usuario?.rolId)).join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 720px;">
      <!-- Barra superior: título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="${backLabel}">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          ${backLabel}
        </button>
        <h1 class="h3 mb-0">${titulo}</h1>
      </div>

      <!-- Formulario principal -->
      <form id="usuario-form" novalidate>
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-person me-2" aria-hidden="true"></i>
            Datos del usuario
          </div>
          <div class="card-body">
            <div class="row g-3">

              <!-- Nombre (requerido) -->
              <div class="col-12 col-md-6">
                <label for="nombre" class="form-label fw-semibold">
                  Nombre <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" id="nombre" name="nombre" class="form-control"
                  value="${usuario?.nombre ?? ''}"
                  placeholder="Ej: María"
                  required aria-required="true" maxlength="100" />
                <div class="invalid-feedback" id="nombre-error"></div>
              </div>

              <!-- Apellido (requerido) -->
              <div class="col-12 col-md-6">
                <label for="apellido" class="form-label fw-semibold">
                  Apellido <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" id="apellido" name="apellido" class="form-control"
                  value="${usuario?.apellido ?? ''}"
                  placeholder="Ej: González"
                  required aria-required="true" maxlength="100" />
                <div class="invalid-feedback" id="apellido-error"></div>
              </div>

              <!-- Email (requerido) -->
              <div class="col-12 col-md-6">
                <label for="email" class="form-label fw-semibold">
                  Email <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="email" id="email" name="email" class="form-control"
                  value="${usuario?.email ?? ''}"
                  placeholder="Ej: usuario@empresa.com"
                  required aria-required="true" maxlength="200" />
                <div class="invalid-feedback" id="email-error"></div>
              </div>

              <!-- Teléfono (opcional) -->
              <div class="col-12 col-md-6">
                <label for="telefono" class="form-label fw-semibold">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" class="form-control"
                  value="${usuario?.telefono ?? ''}"
                  placeholder="Ej: +54 11 4500-1234"
                  maxlength="50" />
              </div>

              <!-- Rol (requerido) -->
              <div class="col-12 col-md-6">
                <label for="rolId" class="form-label fw-semibold">
                  Rol <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="rolId" name="rolId" class="form-select" required aria-required="true">
                  <option value="">Seleccioná un rol...</option>
                  ${rolesOptions}
                </select>
                <div class="invalid-feedback" id="rolId-error"></div>
              </div>

              ${
                !isEdit
                  ? `<!-- Contraseña (requerida solo en creación) -->
              <div class="col-12 col-md-6">
                <label for="password" class="form-label fw-semibold">
                  Contraseña <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="password" id="password" name="password" class="form-control"
                  placeholder="Mínimo 8 caracteres"
                  required aria-required="true" minlength="8" maxlength="128" />
                <div class="invalid-feedback" id="password-error"></div>
              </div>`
                  : ''
              }

            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button id="btn-submit" type="submit" class="btn btn-primary"
            aria-label="${isEdit ? 'Guardar cambios del usuario' : 'Crear el usuario'}">
            <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
            ${isEdit ? 'Guardar cambios' : 'Crear Usuario'}
          </button>
          <button type="button" id="btn-cancel" class="btn btn-outline-secondary"
            aria-label="Cancelar y volver">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;

  // Wiring: botón volver
  container.querySelector<HTMLButtonElement>('#btn-back')?.addEventListener('click', () => {
    window.location.hash = backUrl;
  });

  // Wiring: botón cancelar
  container.querySelector<HTMLButtonElement>('#btn-cancel')?.addEventListener('click', () => {
    window.location.hash = backUrl;
  });

  // Wiring: submit del formulario
  const form = container.querySelector<HTMLFormElement>('#usuario-form');
  const btnSubmit = container.querySelector<HTMLButtonElement>('#btn-submit');
  if (!form || !btnSubmit) return;

  const formEl: HTMLFormElement = form;
  const btnSubmitEl: HTMLButtonElement = btnSubmit;

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    // Limpiar alertas y validaciones anteriores
    container.querySelector('.alert-global')?.remove();
    formEl.querySelectorAll('.is-invalid').forEach((el) => {
      el.classList.remove('is-invalid');
    });
    formEl.querySelectorAll('.invalid-feedback').forEach((el) => {
      el.textContent = '';
    });

    let isValid = true;

    // Validar nombre
    const nombreInput = formEl.querySelector<HTMLInputElement>('#nombre');
    const nombre = nombreInput?.value.trim() ?? '';
    if (!nombre) {
      isValid = false;
      nombreInput?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#nombre-error');
      if (errorEl) errorEl.textContent = 'El nombre es requerido.';
    }

    // Validar apellido
    const apellidoInput = formEl.querySelector<HTMLInputElement>('#apellido');
    const apellido = apellidoInput?.value.trim() ?? '';
    if (!apellido) {
      isValid = false;
      apellidoInput?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#apellido-error');
      if (errorEl) errorEl.textContent = 'El apellido es requerido.';
    }

    // Validar email
    const emailInput = formEl.querySelector<HTMLInputElement>('#email');
    const email = emailInput?.value.trim() ?? '';
    if (!email) {
      isValid = false;
      emailInput?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#email-error');
      if (errorEl) errorEl.textContent = 'El email es requerido.';
    }

    // Validar rol
    const rolSelect = formEl.querySelector<HTMLSelectElement>('#rolId');
    const rolId = rolSelect?.value ?? '';
    if (!rolId) {
      isValid = false;
      rolSelect?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#rolId-error');
      if (errorEl) errorEl.textContent = 'El rol es requerido.';
    }

    // Validar contraseña (solo en creación)
    let password: string | undefined;
    if (!isEdit) {
      const passwordInput = formEl.querySelector<HTMLInputElement>('#password');
      password = passwordInput?.value ?? '';
      if (!password || password.length < 8) {
        isValid = false;
        passwordInput?.classList.add('is-invalid');
        const errorEl = formEl.querySelector<HTMLElement>('#password-error');
        if (errorEl)
          errorEl.textContent = 'La contraseña es requerida y debe tener al menos 8 caracteres.';
      }
    }

    if (!isValid) return;

    btnSubmitEl.disabled = true;
    btnSubmitEl.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...';

    // Resolver rolNombre desde el select
    const selectedRolOption = rolSelect?.options[rolSelect.selectedIndex];
    const rolNombre = selectedRolOption?.text ?? '';

    // Obtener teléfono opcional
    const telefonoInput = formEl.querySelector<HTMLInputElement>('#telefono');
    const telefono = telefonoInput?.value.trim() !== '' ? telefonoInput?.value.trim() : undefined;

    try {
      let resultado: Usuario;
      if (usuario !== null) {
        // PUT /api/usuarios/:id — actualizar usuario existente
        const updateBody: Record<string, unknown> = {
          nombre,
          apellido,
          email,
          rolId,
          rolNombre,
          ...(telefono !== undefined ? { telefono } : {}),
        };
        resultado = await apiFetch<Usuario>(`/api/usuarios/${usuario.id}`, {
          method: 'PUT',
          body: updateBody,
          signal,
        });
      } else {
        // POST /api/usuarios — crear nuevo usuario
        const createBody: Record<string, unknown> = {
          nombre,
          apellido,
          email,
          rolId,
          rolNombre,
          password: password ?? '',
          activo: true,
          ...(telefono !== undefined ? { telefono } : {}),
        };
        resultado = await apiFetch<Usuario>('/api/usuarios', {
          method: 'POST',
          body: createBody,
          signal,
        });
      }

      // Navegar al detalle del usuario creado/editado
      window.location.hash = `#/usuarios/${resultado.id}`;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;

      btnSubmitEl.disabled = false;
      btnSubmitEl.innerHTML = `<i class="bi bi-check-lg me-1" aria-hidden="true"></i>${isEdit ? 'Guardar cambios' : 'Crear Usuario'}`;

      if (error instanceof ApiError && error.status === 422) {
        renderGlobalAlert(container, 'Error de validación. Verificá los datos ingresados.');
      } else {
        renderGlobalAlert(
          container,
          `Error al ${isEdit ? 'actualizar' : 'crear'} el usuario. Intentá nuevamente.`
        );
      }
    }
  }

  formEl.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Carga los datos necesarios (roles + usuario si es edición) y renderiza el formulario.
 */
function renderUsuariosForm(
  container: HTMLElement,
  options: { id?: string; signal: AbortSignal }
): void {
  const { id, signal } = options;

  // Mostrar spinner durante la carga
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Cargar catálogo de roles (siempre) y usuario (solo en edición) en paralelo
  const rolesPromise = apiFetch<PaginatedResponse<Rol>>('/api/roles?pageSize=100', { signal });
  const usuarioPromise = id
    ? apiFetch<Usuario>(`/api/usuarios/${id}`, { signal })
    : Promise.resolve(null);

  Promise.all([rolesPromise, usuarioPromise])
    .then(([rolesResponse, usuario]) => {
      renderForm(container, {
        roles: rolesResponse.data,
        usuario,
        signal,
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;

      const is404 = error instanceof ApiError && error.status === 404;
      const backUrl = id ? `#/usuarios/${id}` : '#/usuarios';

      container.innerHTML = `
        <div class="p-4">
          <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>${is404 ? 'El usuario solicitado no existe.' : 'No se pudo cargar el formulario. Intentá nuevamente.'}</span>
          </div>
          <a href="${backUrl}" class="btn btn-secondary mt-3">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver
          </a>
        </div>
      `;
    });
}

/** Módulo de página de creación/edición de Usuario */
export const usuariosFormPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    abortController?.abort();
    abortController = new AbortController();
    // params.id existe en edición (/usuarios/:id/editar), undefined en creación (/usuarios/nuevo)
    const id = params?.['id'];
    renderUsuariosForm(container, {
      ...(id !== undefined ? { id } : {}),
      signal: abortController.signal,
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
