// Página de formulario de Ubicación — modo crear y editar combinados
import type {
  Almacen,
  PaginatedResponse,
  Ubicacion,
  CreateUbicacionDto,
  UpdateUbicacionDto,
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
  form.querySelectorAll('.invalid-feedback').forEach((el) => {
    el.textContent = '';
  });
}

/**
 * Renderiza una alerta global de error en la parte superior del contenedor dado.
 * Reemplaza cualquier alerta anterior para no acumular mensajes.
 */
function renderGlobalAlert(container: HTMLElement, message: string): void {
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
 * Construye el HTML de las opciones del select de almacenes.
 */
function buildAlmacenOptions(almacenes: Almacen[], selectedId: string): string {
  const opts = almacenes
    .map(
      (a) => `<option value="${a.id}" ${a.id === selectedId ? 'selected' : ''}>${a.nombre}</option>`
    )
    .join('');
  return `<option value="">— Seleccione un almacén —</option>` + opts;
}

/**
 * Renderiza el formulario completo con los datos de la ubicación (modo editar)
 * o vacío (modo crear). Registra los listeners de submit y cancelar.
 */
function renderForm(
  container: HTMLElement,
  options: {
    id: string | undefined;
    signal: AbortSignal;
    almacenes: Almacen[];
    ubicacion: Ubicacion | undefined;
    preselectedAlmacenId: string;
  }
): void {
  const { id, signal, almacenes, ubicacion, preselectedAlmacenId } = options;
  const isEditMode = Boolean(id && ubicacion);
  const title = isEditMode ? 'Editar ubicación' : 'Nueva ubicación';

  // Determinar el almacenId a preseleccionar
  const selectedAlmacenId = ubicacion?.almacenId ?? preselectedAlmacenId;
  const activoChecked = ubicacion !== undefined ? ubicacion.status === 'active' : true;
  const almacenOptions = buildAlmacenOptions(almacenes, selectedAlmacenId);

  container.innerHTML = `
    <div class="p-4" style="max-width: 720px;">
      <!-- Barra superior con título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <a href="#/ubicaciones" id="btn-back" class="text-decoration-none text-secondary">
          ← Volver
        </a>
        <h1 class="h3 mb-0">${title}</h1>
      </div>

      <!-- Formulario principal -->
      <form id="ubicaciones-form" novalidate>
        ${FormField.render({
          name: 'nombre',
          label: 'Nombre de la ubicación',
          type: 'text',
          value: ubicacion?.nombre ?? '',
          required: true,
          placeholder: 'Ej. Rack 1 Estante 1',
        })}

        <!-- Select de almacén -->
        <div class="mb-3">
          <label for="almacenId" class="form-label">Almacén <span class="text-danger">*</span></label>
          <select id="almacenId" name="almacenId" class="form-select" required>
            ${almacenOptions}
          </select>
          <div class="invalid-feedback"></div>
        </div>

        <!-- Textarea de descripción -->
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
            placeholder="Descripción opcional de la ubicación..."></textarea>
          <div class="invalid-feedback"></div>
        </div>

        <!-- Checkbox activo -->
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="activo" name="activo"
              ${activoChecked ? 'checked' : ''}>
            <label class="form-check-label" for="activo">
              Activo
            </label>
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="d-flex gap-2 mt-4">
          <button id="btn-submit" type="submit" class="btn btn-primary">
            Guardar ubicación
          </button>
          <a href="#/ubicaciones" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector<HTMLFormElement>('#ubicaciones-form');
  const btnSubmit = container.querySelector<HTMLButtonElement>('#btn-submit');
  if (!form || !btnSubmit) return;

  async function handleSubmit(): Promise<void> {
    if (!form || !btnSubmit) return;

    clearFieldErrors(form);

    // Deshabilitar botón durante el envío para evitar dobles clics
    btnSubmit.disabled = true;

    const data = new FormData(form);
    const nombre = (data.get('nombre') as string).trim();
    const almacenIdValue = (data.get('almacenId') as string).trim();
    const activo = (data.get('activo') as string | null) !== null;
    const status: 'active' | 'inactive' = activo ? 'active' : 'inactive';

    // Buscar el almacenNombre correspondiente al almacenId seleccionado
    const almacenSeleccionado = almacenes.find((a) => a.id === almacenIdValue);
    const almacenNombre = almacenSeleccionado?.nombre ?? '';

    try {
      if (isEditMode && id) {
        // Modo editar — PUT /api/ubicaciones/:id
        const payload: UpdateUbicacionDto = {
          nombre,
          almacenId: almacenIdValue,
          almacenNombre,
          status,
        };
        const updated = await apiFetch<Ubicacion>(`/api/ubicaciones/${id}`, {
          method: 'PUT',
          body: payload,
          signal,
        });
        window.location.hash = '#/ubicaciones/' + updated.id;
      } else {
        // Modo crear — POST /api/ubicaciones
        const payload: CreateUbicacionDto = {
          codigo: nombre.toUpperCase().slice(0, 8).replace(/\s+/g, '-'),
          nombre,
          almacenId: almacenIdValue,
          almacenNombre,
          tipo: 'estante',
          status,
        };
        await apiFetch<Ubicacion>('/api/ubicaciones', {
          method: 'POST',
          body: payload,
          signal,
        });
        window.location.hash = '#/ubicaciones';
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
          renderGlobalAlert(container, 'Error al guardar la ubicación. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al guardar la ubicación. Intente nuevamente.');
      }
    }
  }

  // Listener de envío del formulario
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void handleSubmit();
  });
}

/**
 * Extrae el almacenId del query string del hash actual.
 * Ej: #/ubicaciones/nuevo?almacenId=alm-001 → 'alm-001'
 */
function getPreselectedAlmacenId(): string {
  const hash = window.location.hash;
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return '';
  const queryStr = hash.slice(queryStart + 1);
  const params = new URLSearchParams(queryStr);
  return params.get('almacenId') ?? '';
}

/**
 * Renderiza el formulario de ubicación — punto de entrada principal.
 * Primero verifica el rol, luego carga datos en paralelo (almacenes + ubicacion si editar),
 * y finalmente monta el formulario.
 */
export function renderUbicacionesForm(
  container: HTMLElement,
  options: { id?: string; signal: AbortSignal }
): void {
  const { id, signal } = options;

  // Verificar rol antes de renderizar — consulta no tiene acceso de escritura
  if (authService.getProfile() === 'consulta') {
    window.location.hash = '#/ubicaciones';
    return;
  }

  // Mostrar spinner de carga mientras se obtienen los datos
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Leer el preselectedAlmacenId del hash antes de que cambie
  const preselectedAlmacenId = getPreselectedAlmacenId();

  // Cargar datos en paralelo: almacenes siempre, ubicación solo en modo editar
  const almacenesPromise = apiFetch<PaginatedResponse<Almacen>>('/api/almacenes?pageSize=100', {
    signal,
  });
  const ubicacionPromise = id
    ? apiFetch<Ubicacion>(`/api/ubicaciones/${id}`, { signal })
    : Promise.resolve(undefined);

  Promise.all([almacenesPromise, ubicacionPromise])
    .then(([almacenesResponse, ubicacion]) => {
      renderForm(container, {
        id,
        signal,
        almacenes: almacenesResponse.data,
        ubicacion,
        preselectedAlmacenId,
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

/** Módulo de página para el formulario de creación de ubicación */
export const ubicacionesFormCreatePage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderUbicacionesForm(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};

/** Módulo de página para el formulario de edición de ubicación */
export const ubicacionesFormEditPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'];
    abortController?.abort();
    abortController = new AbortController();
    // Usar spread condicional para respetar exactOptionalPropertyTypes
    renderUbicacionesForm(container, {
      signal: abortController.signal,
      ...(id !== undefined ? { id } : {}),
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
