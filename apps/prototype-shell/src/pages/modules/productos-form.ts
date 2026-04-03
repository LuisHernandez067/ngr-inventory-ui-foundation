// Página de formulario de Producto — modo crear y editar combinados
import type {
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  Categoria,
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
 * Construye el HTML de la opción select para una categoría.
 */
function categoriaOption(categoria: Categoria, selectedId?: string): string {
  const selected = categoria.id === selectedId ? ' selected' : '';
  return `<option value="${categoria.id}"${selected}>${categoria.nombre}</option>`;
}

/**
 * Renderiza el formulario completo con los datos del producto (modo editar)
 * o vacío (modo crear). Registra los listeners de submit y volver.
 */
function renderForm(
  container: HTMLElement,
  options: {
    id: string | undefined;
    signal: AbortSignal;
    producto: Producto | undefined;
    categorias: Categoria[];
  }
): void {
  const { id, signal, producto, categorias } = options;
  const isEditMode = Boolean(id && producto);
  const title = isEditMode ? 'Editar producto' : 'Nuevo producto';

  // Construir opciones del select de categorías con la selección previa
  const categoriaOptions = categorias
    .map((c) => categoriaOption(c, producto?.categoriaId))
    .join('');

  // Opciones del select de estado
  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'discontinued', label: 'Descontinuado' },
  ]
    .map((opt) => {
      const selected = (producto?.status ?? 'active') === opt.value ? ' selected' : '';
      return `<option value="${opt.value}"${selected}>${opt.label}</option>`;
    })
    .join('');

  container.innerHTML = `
    <div class="p-4 page-form-container">
      <!-- Barra superior con título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <a href="#/productos" id="btn-back" class="text-decoration-none text-secondary">
          ← Volver
        </a>
        <h1 class="h3 mb-0">${title}</h1>
      </div>

      <!-- Formulario principal -->
      <form id="productos-form" novalidate>
        ${FormField.render({
          name: 'nombre',
          label: 'Nombre del producto',
          type: 'text',
          value: producto?.nombre ?? '',
          required: true,
          placeholder: 'Ej. Teclado Mecánico TKL',
        })}

        ${FormField.render({
          name: 'sku',
          label: 'Código SKU',
          type: 'text',
          value: producto?.codigo ?? '',
          required: true,
          placeholder: 'Ej. TEC-MEC-001',
        })}

        ${FormField.render({
          name: 'precio',
          label: 'Precio (COP)',
          type: 'number',
          value: producto?.precioUnitario !== undefined ? String(producto.precioUnitario) : '',
          required: true,
          helperText: 'Precio sin IVA',
          placeholder: '0',
        })}

        <!-- Select de categoría -->
        <div class="mb-3">
          <label for="categoriaId" class="form-label fw-semibold">
            Categoría <span class="text-danger" aria-hidden="true">*</span>
          </label>
          <select id="categoriaId" name="categoriaId" class="form-select" required>
            <option value="">Seleccioná una categoría...</option>
            ${categoriaOptions}
          </select>
          <div class="invalid-feedback"></div>
        </div>

        <!-- Textarea de descripción -->
        <div class="mb-3">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
            placeholder="Descripción opcional del producto...">${producto?.descripcion ?? ''}</textarea>
          <div class="invalid-feedback"></div>
        </div>

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
            Guardar producto
          </button>
          <a href="#/productos" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </form>
    </div>
  `;

  const formEl = container.querySelector<HTMLFormElement>('#productos-form');
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
    const sku = (data.get('sku') as string).trim();
    const precio = parseFloat(data.get('precio') as string);
    const categoriaId = data.get('categoriaId') as string;
    const descripcion = (data.get('descripcion') as string).trim() || undefined;
    const status = data.get('status') as Producto['status'];

    try {
      if (isEditMode && id) {
        // Modo editar — PUT /api/productos/:id
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: UpdateProductoDto = {
          nombre,
          codigo: sku,
          precioUnitario: precio,
          categoriaId,
          status,
          ...(descripcion !== undefined ? { descripcion } : {}),
        };
        await apiFetch<Producto>(`/api/productos/${id}`, {
          method: 'PUT',
          body: payload,
          signal,
        });
        // Navegar de vuelta al detalle del producto editado
        window.location.hash = `#/productos/${id}`;
      } else {
        // Modo crear — POST /api/productos
        // Usar spread condicional para respetar exactOptionalPropertyTypes
        const payload: CreateProductoDto = {
          nombre,
          codigo: sku,
          precioUnitario: precio,
          categoriaId,
          status,
          // Campos requeridos con valores por defecto sensatos para el prototipo
          unidadMedida: 'unidad',
          stockMinimo: 0,
          ...(descripcion !== undefined ? { descripcion } : {}),
        };
        await apiFetch<Producto>('/api/productos', {
          method: 'POST',
          body: payload,
          signal,
        });
        // Navegar a la lista de productos tras crear
        window.location.hash = '#/productos';
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
              // El campo nombre del contrato puede diferir del name del input
              // El SKU en el form se llama "sku" pero el contrato usa "codigo"
              const inputName = fieldName === 'codigo' ? 'sku' : fieldName;
              setFieldError(container, inputName, message);
            }
          }
        } else if (error.status === 409) {
          // Conflicto de SKU duplicado
          renderGlobalAlert(container, 'Ya existe un producto con este SKU');
        } else {
          // Error genérico de servidor (500 u otros)
          renderGlobalAlert(container, 'Error al guardar el producto. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al guardar el producto. Intente nuevamente.');
      }
    }
  }

  form.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Renderiza el formulario de producto — punto de entrada principal.
 * Primero verifica el rol, luego carga datos en paralelo (producto + categorías),
 * y finalmente monta el formulario.
 */
export function renderProductosForm(
  container: HTMLElement,
  options: { id?: string; signal: AbortSignal }
): void {
  const { id, signal } = options;

  // Verificar rol antes de renderizar — consulta no tiene acceso de escritura
  if (authService.getProfile() === 'consulta') {
    window.location.hash = '#/productos';
    return;
  }

  // Mostrar spinner de carga mientras se obtienen los datos
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Cargar datos en paralelo: categorías (siempre) + producto (solo en modo editar)
  const categoriasPromise = apiFetch<{ data: Categoria[] }>('/api/categorias', { signal });
  const productoPromise = id
    ? apiFetch<Producto>(`/api/productos/${id}`, { signal })
    : Promise.resolve(undefined);

  Promise.all([categoriasPromise, productoPromise])
    .then(([categoriasResponse, producto]) => {
      renderForm(container, {
        id,
        signal,
        producto,
        categorias: categoriasResponse.data,
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

/** Módulo de página para el formulario de creación de producto */
export const productosFormCreatePage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderProductosForm(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};

/** Módulo de página para el formulario de edición de producto */
export const productosFormEditPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'];
    abortController?.abort();
    abortController = new AbortController();
    // Usar spread condicional para respetar exactOptionalPropertyTypes
    renderProductosForm(container, {
      signal: abortController.signal,
      ...(id !== undefined ? { id } : {}),
    });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
