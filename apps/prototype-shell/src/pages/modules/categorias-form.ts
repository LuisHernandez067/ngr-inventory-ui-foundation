// Página de formulario de Categoría — modo crear y editar combinados
import type {
  Categoria,
  CreateCategoriaDto,
  UpdateCategoriaDto,
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
  form.querySelectorAll('.invalid-feedback').forEach((el) => {
    el.textContent = '';
  });
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
 * Renderiza el formulario completo con los datos de la categoría (modo editar)
 * o vacío (modo crear). Registra los listeners de submit y volver.
 */
function renderForm(
  container: HTMLElement,
  options: {
    id: string | undefined;
    signal: AbortSignal;
    categoria: Categoria | undefined;
  }
): void {
  const { id, signal, categoria } = options;
  const isEditMode = Boolean(id && categoria);
  const title = isEditMode ? 'Editar categoría' : 'Nueva categoría';

  container.innerHTML = `
    <div class="p-4" style="max-width: 720px;">
      <!-- Barra superior con título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <a href="#/categorias" id="btn-back" class="text-decoration-none text-secondary">
          ← Volver
        </a>
        <h1 class="h3 mb-0">${title}</h1>
      </div>

      <!-- Formulario principal -->
      <form id="categorias-form" novalidate>
        ${FormField.render({
          name: 'nombre',
          label: 'Nombre de la categoría',
          type: 'text',
          value: categoria?.nombre ?? '',
          required: true,
          placeholder: 'Ej. Periféricos',
        })}

        <!-- Textarea de descripción -->
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
            placeholder="Descripción opcional de la categoría...">${categoria?.descripcion ?? ''}</textarea>
          <div class="invalid-feedback"></div>
        </div>

        <!-- Botón de envío -->
        <div class="d-flex gap-2 mt-4">
          <button id="btn-submit" type="submit" class="btn btn-primary">
            Guardar categoría
          </button>
          <a href="#/categorias" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector<HTMLFormElement>('#categorias-form');
  const btnSubmit = container.querySelector<HTMLButtonElement>('#btn-submit');
  if (!form || !btnSubmit) return;

  async function handleSubmit(): Promise<void> {
    if (!form || !btnSubmit) return;

    clearFieldErrors(form);

    // Deshabilitar botón durante el envío para evitar dobles clics
    btnSubmit.disabled = true;

    const data = new FormData(form);
    const nombre = (data.get('nombre') as string).trim();
    const descripcion = (data.get('descripcion') as string).trim() || undefined;

    try {
      if (isEditMode && id) {
        // Modo editar — PUT /api/categorias/:id
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: UpdateCategoriaDto = {
          nombre,
          ...(descripcion !== undefined ? { descripcion } : {}),
        };
        await apiFetch<Categoria>(`/api/categorias/${id}`, {
          method: 'PUT',
          body: payload,
          signal,
        });
        // Navegar de vuelta al detalle de la categoría editada
        window.location.hash = `#/categorias/${id}`;
      } else {
        // Modo crear — POST /api/categorias
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: CreateCategoriaDto = {
          nombre,
          codigo: nombre.toUpperCase().slice(0, 8).replace(/\s+/g, '-'),
          status: 'active',
          ...(descripcion !== undefined ? { descripcion } : {}),
        };
        await apiFetch<Categoria>('/api/categorias', {
          method: 'POST',
          body: payload,
          signal,
        });
        // Navegar a la lista de categorías tras crear
        window.location.hash = '#/categorias';
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
          renderGlobalAlert(container, 'Error al guardar la categoría. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al guardar la categoría. Intente nuevamente.');
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
 * Renderiza el formulario de categoría — punto de entrada principal.
 * Primero verifica el rol, luego carga datos (solo en modo editar),
 * y finalmente monta el formulario.
 */
export function renderCategoriasForm(
  container: HTMLElement,
  options: { id?: string; signal: AbortSignal }
): void {
  const { id, signal } = options;

  // Verificar rol antes de renderizar — consulta no tiene acceso de escritura
  if (authService.getProfile() === 'consulta') {
    window.location.hash = '#/categorias';
    return;
  }

  // Mostrar spinner de carga mientras se obtienen los datos
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Cargar datos: solo en modo editar se necesita la categoría existente
  const categoriaPromise = id
    ? apiFetch<Categoria>(`/api/categorias/${id}`, { signal })
    : Promise.resolve(undefined);

  categoriaPromise
    .then((categoria) => {
      renderForm(container, {
        id,
        signal,
        categoria,
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

/** Módulo de página para el formulario de creación de categoría */
export const categoriasFormCreatePage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderCategoriasForm(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};

/** Módulo de página para el formulario de edición de categoría */
export const categoriasFormEditPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'];
    abortController?.abort();
    abortController = new AbortController();
    // Usar spread condicional para respetar exactOptionalPropertyTypes
    renderCategoriasForm(container, {
      signal: abortController.signal,
      ...(id !== undefined ? { id } : {}),
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
