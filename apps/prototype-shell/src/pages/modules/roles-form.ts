// Página de creación/edición de Rol — formulario con nombre, descripción y matriz de checkboxes de permisos
import type { Permiso, Rol } from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Agrupa un array de permisos por su propiedad `modulo`.
 * Retorna un Map con el módulo como clave y sus permisos como valor.
 */
function groupPermisosByModulo(permisos: Permiso[]): Map<string, Permiso[]> {
  const groups = new Map<string, Permiso[]>();
  for (const permiso of permisos) {
    const existing = groups.get(permiso.modulo);
    if (existing) {
      existing.push(permiso);
    } else {
      groups.set(permiso.modulo, [permiso]);
    }
  }
  return groups;
}

/**
 * Genera el HTML de la matriz de checkboxes agrupada por módulo.
 * Usa <fieldset>/<legend> por módulo para cumplir WCAG AA.
 */
function buildCheckboxMatrix(catalog: Permiso[], assignedClaves: Set<string>): string {
  const groups = groupPermisosByModulo(catalog);

  return Array.from(groups.entries())
    .map(([modulo, permisos]) => {
      const checkboxes = permisos
        .map((p) => {
          const checked = assignedClaves.has(p.clave) ? ' checked' : '';
          return `
            <div class="form-check me-3 mb-2">
              <input
                class="form-check-input perm-checkbox"
                type="checkbox"
                id="perm-${p.clave}"
                name="permisos"
                value="${p.clave}"
                ${checked}
                aria-label="${p.nombre} (módulo ${modulo})"
              />
              <label class="form-check-label" for="perm-${p.clave}">
                ${p.nombre}
              </label>
            </div>
          `;
        })
        .join('');

      return `
        <fieldset class="mb-3 border rounded p-3">
          <legend class="float-none w-auto px-2 fs-6 fw-semibold text-capitalize">${modulo}</legend>
          <div class="d-flex flex-wrap">
            ${checkboxes}
          </div>
        </fieldset>
      `;
    })
    .join('');
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
 * Renderiza el formulario completo con el catálogo de permisos cargado.
 * En modo edición prefillba nombre, descripción y permisos del rol.
 */
function renderForm(
  container: HTMLElement,
  options: {
    catalog: Permiso[];
    rol: Rol | null;
    signal: AbortSignal;
  }
): void {
  const { catalog, rol, signal } = options;
  const isEdit = rol !== null;
  const titulo = isEdit ? 'Editar Rol' : 'Nuevo Rol';
  const backUrl = rol !== null ? `#/roles/${rol.id}` : '#/roles';
  const backLabel = isEdit ? 'Volver al detalle' : 'Volver a Roles';

  const assignedClaves = new Set(isEdit ? rol.permisos.map((p) => p.clave) : []);
  const checkboxMatrix = buildCheckboxMatrix(catalog, assignedClaves);

  container.innerHTML = `
    <div class="p-4 page-form-container">
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
      <form id="rol-form" novalidate>
        <!-- Datos básicos -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-shield me-2" aria-hidden="true"></i>
            Datos del rol
          </div>
          <div class="card-body">
            <div class="row g-3">

              <!-- Nombre (requerido) -->
              <div class="col-12 col-md-6">
                <label for="nombre" class="form-label fw-semibold">
                  Nombre <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" id="nombre" name="nombre" class="form-control"
                  value="${rol?.nombre ?? ''}"
                  placeholder="Ej: Supervisor de ventas"
                  required aria-required="true" maxlength="100" />
                <div class="invalid-feedback" id="nombre-error"></div>
              </div>

              <!-- Descripción (opcional) -->
              <div class="col-12">
                <label for="descripcion" class="form-label fw-semibold">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control"
                  rows="2"
                  placeholder="Descripción breve del propósito de este rol"
                  maxlength="300">${rol?.descripcion ?? ''}</textarea>
              </div>

            </div>
          </div>
        </div>

        <!-- Matriz de permisos -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-key me-2" aria-hidden="true"></i>
            Permisos
          </div>
          <div class="card-body" id="permisos-matrix">
            ${checkboxMatrix}
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button id="btn-submit" type="submit" class="btn btn-primary"
            aria-label="${isEdit ? 'Guardar cambios del rol' : 'Crear el rol'}">
            <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
            ${isEdit ? 'Guardar cambios' : 'Crear Rol'}
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
  const form = container.querySelector<HTMLFormElement>('#rol-form');
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

    if (!isValid) return;

    // Recolectar permisos seleccionados
    const selectedClaves = Array.from(
      formEl.querySelectorAll<HTMLInputElement>('.perm-checkbox:checked')
    ).map((cb) => cb.value);

    // Mapear claves a objetos Permiso completos desde el catálogo
    const selectedPermisos = catalog.filter((p) => selectedClaves.includes(p.clave));

    // Obtener descripción opcional
    const descripcionInput = formEl.querySelector<HTMLTextAreaElement>('#descripcion');
    const descripcionValue = descripcionInput?.value.trim() ?? '';

    btnSubmitEl.disabled = true;
    btnSubmitEl.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Guardando...';

    try {
      let resultado: Rol;

      if (rol !== null) {
        // PUT /api/roles/:id — actualizar rol existente
        const updateBody: Record<string, unknown> = {
          nombre,
          permisos: selectedPermisos,
          ...(descripcionValue !== '' ? { descripcion: descripcionValue } : {}),
        };
        resultado = await apiFetch<Rol>(`/api/roles/${rol.id}`, {
          method: 'PUT',
          body: updateBody,
          signal,
        });
      } else {
        // POST /api/roles — crear nuevo rol
        const createBody: Record<string, unknown> = {
          nombre,
          permisos: selectedPermisos,
          esAdmin: false,
          ...(descripcionValue !== '' ? { descripcion: descripcionValue } : {}),
        };
        resultado = await apiFetch<Rol>('/api/roles', {
          method: 'POST',
          body: createBody,
          signal,
        });
      }

      // Navegar al detalle del rol creado/editado
      window.location.hash = `#/roles/${resultado.id}`;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;

      btnSubmitEl.disabled = false;
      btnSubmitEl.innerHTML = `<i class="bi bi-check-lg me-1" aria-hidden="true"></i>${isEdit ? 'Guardar cambios' : 'Crear Rol'}`;

      if (error instanceof ApiError && error.status === 422) {
        renderGlobalAlert(container, 'Error de validación. Verificá los datos ingresados.');
      } else {
        renderGlobalAlert(
          container,
          `Error al ${isEdit ? 'actualizar' : 'crear'} el rol. Intentá nuevamente.`
        );
      }
    }
  }

  formEl.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Carga el catálogo de permisos y (si es edición) los datos del rol, luego renderiza el formulario.
 */
function renderRolesForm(
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

  // Cargar catálogo de permisos (siempre) y rol (solo en edición) en paralelo
  const catalogPromise = apiFetch<Permiso[]>('/api/permisos', { signal });
  const rolPromise = id ? apiFetch<Rol>(`/api/roles/${id}`, { signal }) : Promise.resolve(null);

  Promise.all([catalogPromise, rolPromise])
    .then(([catalog, rol]) => {
      renderForm(container, { catalog, rol, signal });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;

      const is404 = error instanceof ApiError && error.status === 404;
      const backUrl = id ? `#/roles/${id}` : '#/roles';

      container.innerHTML = `
        <div class="p-4">
          <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>${is404 ? 'El rol solicitado no existe.' : 'No se pudo cargar el formulario. Intentá nuevamente.'}</span>
          </div>
          <a href="${backUrl}" class="btn btn-secondary mt-3">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver
          </a>
        </div>
      `;
    });
}

/** Módulo de página de creación/edición de Rol */
export const rolesFormPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    abortController?.abort();
    abortController = new AbortController();
    // params.id existe en edición (/roles/:id/editar), undefined en creación (/roles/nuevo)
    const id = params?.['id'];
    renderRolesForm(container, {
      ...(id !== undefined ? { id } : {}),
      signal: abortController.signal,
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
