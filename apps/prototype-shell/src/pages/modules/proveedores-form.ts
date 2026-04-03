// Página de formulario de Proveedor — modo crear y editar combinados
import type {
  Proveedor,
  CreateProveedorDto,
  UpdateProveedorDto,
} from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';
import { FormField } from '@ngr-inventory/ui-patterns';

import type { PageModule } from '../../router/router';
import { authService } from '../../services/authService';
import { apiFetch, ApiError } from '../_shared/apiFetch';

/** Cuerpo de un error de validación 422 */
interface ValidationErrorBody {
  status: 422;
  type: string;
  title: string;
  fields: Record<string, string>;
}

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Establece el mensaje de error debajo del campo afectado.
 * Agrega la clase Bootstrap `is-invalid` al input correspondiente.
 */
function setFieldError(container: HTMLElement, name: string, msg: string): void {
  const input = container.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    `[name="${name}"]`
  );
  if (!input) return;
  input.classList.add('is-invalid');
  // Buscar el div de feedback inválido adyacente al input
  const errorEl = input.parentElement?.querySelector('.invalid-feedback');
  if (errorEl) errorEl.textContent = msg;
}

/**
 * Limpia todos los errores de campo del formulario.
 * Se invoca antes de cada intento de envío.
 */
function clearFieldErrors(form: HTMLFormElement): void {
  form.querySelectorAll('.is-invalid').forEach((el) => {
    el.classList.remove('is-invalid');
  });
  form.querySelectorAll('.invalid-feedback').forEach((el) => (el.textContent = ''));
}

/**
 * Renderiza una alerta global de error en la parte superior del contenedor dado.
 * Reemplaza cualquier alerta anterior para no acumular mensajes.
 */
function renderGlobalAlert(container: HTMLElement, message: string): void {
  // Eliminar alerta anterior si existía
  container.querySelector('.alert-global')?.remove();

  const alert = document.createElement('div');
  alert.className = 'alert alert-danger d-flex align-items-center gap-2 mb-3 alert-global';
  alert.setAttribute('role', 'alert');
  alert.innerHTML = `<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i><span>${message}</span>`;

  const form = container.querySelector('form');
  if (form) {
    form.insertAdjacentElement('beforebegin', alert);
  } else {
    container.prepend(alert);
  }
}

/**
 * Renderiza el formulario completo con los datos del proveedor (modo editar)
 * o vacío (modo crear). Registra los listeners de submit y volver.
 */
function renderForm(
  container: HTMLElement,
  options: {
    id: string | undefined;
    signal: AbortSignal;
    proveedor: Proveedor | undefined;
  }
): void {
  const { id, signal, proveedor } = options;
  const isEditMode = Boolean(id && proveedor);
  const title = isEditMode ? 'Editar proveedor' : 'Nuevo proveedor';

  // Opciones del select de estado
  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'suspended', label: 'Suspendido' },
  ]
    .map((opt) => {
      const selected = (proveedor?.status ?? 'active') === opt.value ? ' selected' : '';
      return `<option value="${opt.value}"${selected}>${opt.label}</option>`;
    })
    .join('');

  container.innerHTML = `
    <div class="p-4 page-form-container">
      <!-- Barra superior con título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <a href="#/proveedores" id="btn-back" class="text-decoration-none text-secondary">
          ← Volver
        </a>
        <h1 class="h3 mb-0">${title}</h1>
      </div>

      <!-- Formulario principal -->
      <form id="proveedores-form" novalidate>
        ${FormField.render({
          name: 'nombre',
          label: 'Nombre del proveedor',
          type: 'text',
          value: proveedor?.razonSocial ?? '',
          required: true,
          placeholder: 'Ej. Distribuciones García S.A.',
        })}

        ${FormField.render({
          name: 'contacto',
          label: 'Persona de contacto',
          type: 'text',
          value: '',
          required: true,
          placeholder: 'Ej. Juan Pérez',
        })}

        ${FormField.render({
          name: 'email',
          label: 'Correo electrónico',
          type: 'email',
          value: proveedor?.email ?? '',
          required: true,
          placeholder: 'Ej. contacto@proveedor.com',
        })}

        ${FormField.render({
          name: 'telefono',
          label: 'Teléfono',
          type: 'tel',
          value: proveedor?.telefono ?? '',
          required: false,
          placeholder: 'Ej. +54 11 1234-5678',
        })}

        <!-- Select de estado -->
        <div class="mb-3">
          <label for="status" class="form-label fw-semibold">Estado</label>
          <select id="status" name="status" class="form-select">
            ${statusOptions}
          </select>
          <div class="invalid-feedback"></div>
        </div>

        <!-- Botón de envío -->
        <div class="d-flex gap-2 mt-4">
          <button id="btn-submit" type="submit" class="btn btn-primary">
            Guardar proveedor
          </button>
          <a href="#/proveedores" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `;

  const formEl = container.querySelector<HTMLFormElement>('#proveedores-form');
  const btnSubmitEl = container.querySelector<HTMLButtonElement>('#btn-submit');
  if (!formEl || !btnSubmitEl) return;

  // Capturar referencias tipadas no-nullable para usar en el closure
  const form: HTMLFormElement = formEl;
  const btnSubmit: HTMLButtonElement = btnSubmitEl;

  // Listener de envío del formulario
  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    clearFieldErrors(form);

    // Deshabilitar botón durante el envío para evitar dobles clics
    btnSubmit.disabled = true;

    const data = new FormData(form);
    const nombre = (data.get('nombre') as string).trim();
    const email = (data.get('email') as string).trim();
    const telefono = (data.get('telefono') as string).trim() || undefined;
    const status = data.get('status') as Proveedor['status'];

    try {
      if (isEditMode && id) {
        // Modo editar — PUT /api/proveedores/:id
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: UpdateProveedorDto = {
          razonSocial: nombre,
          status,
          ...(email ? { email } : {}),
          ...(telefono !== undefined ? { telefono } : {}),
        };
        await apiFetch<Proveedor>(`/api/proveedores/${id}`, {
          method: 'PUT',
          body: payload,
          signal,
        });
        // Navegar de vuelta al detalle del proveedor editado
        window.location.hash = `#/proveedores/${id}`;
      } else {
        // Modo crear — POST /api/proveedores
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: CreateProveedorDto = {
          razonSocial: nombre,
          codigo: nombre.toUpperCase().slice(0, 8).replace(/\s+/g, '-'),
          ruc: '00000000000',
          status,
          ...(email ? { email } : {}),
          ...(telefono !== undefined ? { telefono } : {}),
        };
        await apiFetch<Proveedor>('/api/proveedores', {
          method: 'POST',
          body: payload,
          signal,
        });
        // Navegar a la lista de proveedores tras crear
        window.location.hash = '#/proveedores';
      }
    } catch (error: unknown) {
      // Ignorar errores de cancelación por navegación
      if (error instanceof Error && error.name === 'AbortError') return;

      btnSubmit.disabled = false;

      if (error instanceof ApiError) {
        if (error.status === 422) {
          // Errores de validación por campo
          const body = error.body as ValidationErrorBody;
          if (typeof body.fields === 'object') {
            for (const [fieldName, message] of Object.entries(body.fields)) {
              setFieldError(container, fieldName, message);
            }
          }
        } else {
          // Error genérico de servidor (500 u otros)
          renderGlobalAlert(container, 'Error al guardar el proveedor. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al guardar el proveedor. Intente nuevamente.');
      }
    }
  }

  form.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Renderiza el formulario de proveedor — punto de entrada principal.
 * Primero verifica el rol, luego carga datos (solo en modo editar),
 * y finalmente monta el formulario.
 */
export function renderProveedoresForm(
  container: HTMLElement,
  options: { id?: string; signal: AbortSignal }
): void {
  const { id, signal } = options;

  // Verificar rol antes de renderizar — consulta no tiene acceso de escritura
  if (authService.getProfile() === 'consulta') {
    window.location.hash = '#/proveedores';
    return;
  }

  // Mostrar spinner de carga mientras se obtienen los datos
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Cargar datos: solo en modo editar se necesita el proveedor existente
  const proveedorPromise = id
    ? apiFetch<Proveedor>(`/api/proveedores/${id}`, { signal })
    : Promise.resolve(undefined);

  proveedorPromise
    .then((proveedor) => {
      renderForm(container, {
        id,
        signal,
        proveedor,
      });
    })
    .catch((error: unknown) => {
      // Ignorar cancelaciones por navegación
      if (error instanceof Error && error.name === 'AbortError') return;

      container.innerHTML = `
        <div class="p-4">
          <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>No se pudo cargar el formulario. Intente nuevamente.</span>
          </div>
        </div>
      `;
    });
}

/** Módulo de página para el formulario de creación de proveedor */
export const proveedoresFormCreatePage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderProveedoresForm(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};

/** Módulo de página para el formulario de edición de proveedor */
export const proveedoresFormEditPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'];
    abortController?.abort();
    abortController = new AbortController();
    // Usar spread condicional para respetar exactOptionalPropertyTypes
    renderProveedoresForm(container, {
      signal: abortController.signal,
      ...(id !== undefined ? { id } : {}),
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
