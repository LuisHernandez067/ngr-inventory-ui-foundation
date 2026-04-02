// Página de creación de Conteo físico — formulario con catálogos, ítems dinámicos y POST
import type {
  Almacen,
  Conteo,
  ConteoItem,
  PaginatedResponse,
  Producto,
} from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Borrador de un ítem de conteo — estado local en memoria */
interface ConteoItemDraft {
  rowId: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidadSistema: number;
}

/** Cuerpo de error 422 con detalle de validación */
interface ProblemDetails {
  status: number;
  type?: string;
  title?: string;
  detail?: string;
  fields?: Record<string, string>;
}

/** Estado del módulo — se reinicia en cada render */
let items: ConteoItemDraft[] = [];

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Genera un identificador único de fila para el DOM.
 */
function generateRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return String(Date.now()) + String(Math.random());
}

/**
 * Construye la opción HTML para un almacén en un select.
 */
function almacenOption(almacen: Almacen): string {
  return `<option value="${almacen.id}" data-nombre="${almacen.nombre}">${almacen.nombre}</option>`;
}

/**
 * Construye la opción HTML para un producto en un select.
 */
function productoOption(producto: Producto, selectedId?: string): string {
  const selected = producto.id === selectedId ? ' selected' : '';
  return `<option value="${producto.id}"
    data-codigo="${producto.codigo}"
    data-nombre="${producto.nombre}"
    data-stock="${String(producto.stockMinimo)}"
    ${selected}>${producto.codigo} — ${producto.nombre}</option>`;
}

/**
 * Re-renderiza el tbody de la tabla de ítems seleccionados.
 * Se llama tras cada cambio en el array `items`.
 */
function renderItemsTable(container: HTMLElement, productos: Producto[]): void {
  const tbody = container.querySelector<HTMLTableSectionElement>('#items-tbody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr id="items-empty-row">
        <td colspan="4" class="text-center text-muted fst-italic py-3">
          Sin productos agregados. Hacé clic en "Agregar Producto".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items
    .map((item) => {
      const rowOptions = productos.map((p) => productoOption(p, item.productoId)).join('');
      return `<tr data-row-id="${item.rowId}">
        <td>
          <select class="form-select form-select-sm item-producto-select"
            data-row-id="${item.rowId}"
            aria-label="Seleccioná un producto">
            <option value="">Seleccioná un producto...</option>
            ${rowOptions}
          </select>
        </td>
        <td class="text-muted small align-middle" id="codigo-${item.rowId}">
          ${item.productoCodigo || '—'}
        </td>
        <td>
          <input type="number" class="form-control form-control-sm item-cantidad-sistema"
            data-row-id="${item.rowId}"
            value="${String(item.cantidadSistema)}"
            min="0" step="1"
            aria-label="Cantidad esperada en sistema" />
        </td>
        <td class="text-center">
          <button type="button" class="btn btn-sm btn-outline-danger item-remove-btn"
            data-row-id="${item.rowId}"
            aria-label="Eliminar este producto del conteo">
            <i class="bi bi-trash" aria-hidden="true"></i>
          </button>
        </td>
      </tr>`;
    })
    .join('');
}

/**
 * Renderiza una alerta global en el contenedor.
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
 */
function renderForm(
  container: HTMLElement,
  options: {
    almacenes: Almacen[];
    productos: Producto[];
    signal: AbortSignal;
  }
): void {
  const { almacenes, productos, signal } = options;

  const almacenesOptions = almacenes.map((a) => almacenOption(a)).join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 900px;">
      <!-- Barra superior: título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver a la lista de conteos">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Conteos
        </button>
        <h1 class="h3 mb-0">Nuevo Conteo</h1>
      </div>

      <!-- Formulario principal -->
      <form id="conteos-nuevo-form" novalidate>

        <!-- Información general del conteo -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información del conteo
          </div>
          <div class="card-body">
            <div class="row g-3">

              <!-- Almacén (requerido) -->
              <div class="col-12 col-md-6">
                <label for="almacenId" class="form-label fw-semibold">
                  Almacén <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="almacenId" name="almacenId" class="form-select" required
                  aria-required="true">
                  <option value="">Seleccioná un almacén...</option>
                  ${almacenesOptions}
                </select>
                <div class="invalid-feedback" id="almacenId-error"></div>
              </div>

              <!-- Fecha inicio (opcional) -->
              <div class="col-12 col-md-3">
                <label for="fechaInicio" class="form-label fw-semibold">Fecha inicio</label>
                <input type="date" id="fechaInicio" name="fechaInicio" class="form-control"
                  aria-label="Fecha de inicio del conteo" />
              </div>

              <!-- Fecha fin (opcional) -->
              <div class="col-12 col-md-3">
                <label for="fechaFin" class="form-label fw-semibold">Fecha fin</label>
                <input type="date" id="fechaFin" name="fechaFin" class="form-control"
                  aria-label="Fecha de finalización estimada del conteo" />
              </div>

              <!-- Descripción (requerida) -->
              <div class="col-12">
                <label for="descripcion" class="form-label fw-semibold">
                  Descripción <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" id="descripcion" name="descripcion" class="form-control"
                  placeholder="Ej: Conteo trimestral zona norte — componentes electrónicos"
                  required aria-required="true" maxlength="200" />
                <div class="invalid-feedback" id="descripcion-error"></div>
              </div>

            </div>
          </div>
        </div>

        <!-- Sección de productos a contar -->
        <div class="card mb-4">
          <div class="card-header d-flex align-items-center justify-content-between fw-semibold">
            <span>
              <i class="bi bi-boxes me-2" aria-hidden="true"></i>
              Productos a contar
            </span>
            <button type="button" id="btn-agregar-producto" class="btn btn-sm btn-outline-primary"
              aria-label="Agregar un producto a la lista de conteo">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Agregar Producto
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0" id="items-table"
                aria-label="Productos seleccionados para el conteo">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:120px;">Código</th>
                    <th style="width:160px;">Cant. Sistema</th>
                    <th style="width:60px;"></th>
                  </tr>
                </thead>
                <tbody id="items-tbody">
                  <tr id="items-empty-row">
                    <td colspan="4" class="text-center text-muted fst-italic py-3">
                      Sin productos agregados. Hacé clic en "Agregar Producto".
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="invalid-feedback d-block px-3 pb-2" id="items-error" style="display:none!important;"></div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button id="btn-submit" type="submit" class="btn btn-primary"
            aria-label="Crear el conteo físico">
            <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
            Crear Conteo
          </button>
          <button type="button" id="btn-cancel" class="btn btn-outline-secondary"
            aria-label="Cancelar y volver a la lista de conteos">
            Cancelar
          </button>
        </div>

      </form>
    </div>
  `;

  // Wiring: botón volver
  container.querySelector<HTMLButtonElement>('#btn-back')?.addEventListener('click', () => {
    window.location.hash = '#/conteos';
  });

  // Wiring: botón cancelar
  container.querySelector<HTMLButtonElement>('#btn-cancel')?.addEventListener('click', () => {
    window.location.hash = '#/conteos';
  });

  // Wiring: botón agregar producto
  const btnAgregarProducto = container.querySelector<HTMLButtonElement>('#btn-agregar-producto');
  btnAgregarProducto?.addEventListener('click', () => {
    items.push({
      rowId: generateRowId(),
      productoId: '',
      productoCodigo: '',
      productoNombre: '',
      cantidadSistema: 0,
    });
    renderItemsTable(container, productos);
  });

  // Wiring: event delegation en tbody para cambios de campo y botones eliminar
  const tbody = container.querySelector<HTMLTableSectionElement>('#items-tbody');

  tbody?.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLButtonElement>('.item-remove-btn');
    if (!btn) return;
    const rowId = btn.getAttribute('data-row-id');
    if (!rowId) return;
    items = items.filter((item) => item.rowId !== rowId);
    renderItemsTable(container, productos);
  });

  tbody?.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLElement;
    const rowId = target.getAttribute('data-row-id');
    if (!rowId) return;

    const item = items.find((i) => i.rowId === rowId);
    if (!item) return;

    if (target.classList.contains('item-producto-select')) {
      const select = target as HTMLSelectElement;
      const selectedOption = select.options[select.selectedIndex];
      item.productoId = select.value;
      item.productoCodigo = selectedOption?.getAttribute('data-codigo') ?? '';
      item.productoNombre = selectedOption?.getAttribute('data-nombre') ?? '';
      // Pre-rellenar cantidadSistema desde el stock mínimo del producto como referencia
      const stockAttr = selectedOption?.getAttribute('data-stock');
      item.cantidadSistema = stockAttr ? parseInt(stockAttr, 10) || 0 : 0;
      renderItemsTable(container, productos);
    } else if (target.classList.contains('item-cantidad-sistema')) {
      const input = target as HTMLInputElement;
      item.cantidadSistema = parseInt(input.value, 10) || 0;
    }
  });

  // Wiring: submit del formulario
  const form = container.querySelector<HTMLFormElement>('#conteos-nuevo-form');
  const btnSubmit = container.querySelector<HTMLButtonElement>('#btn-submit');
  if (!form || !btnSubmit) return;

  const formEl: HTMLFormElement = form;
  const btnSubmitEl: HTMLButtonElement = btnSubmit;

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    // Limpiar alertas anteriores
    container.querySelector('.alert-global')?.remove();

    // Limpiar validaciones previas
    formEl.querySelectorAll('.is-invalid').forEach((el) => {
      el.classList.remove('is-invalid');
    });
    formEl.querySelectorAll('.invalid-feedback').forEach((el) => {
      el.textContent = '';
    });

    let isValid = true;

    // Validar almacén requerido
    const almacenSelect = formEl.querySelector<HTMLSelectElement>('#almacenId');
    if (!almacenSelect?.value) {
      isValid = false;
      almacenSelect?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#almacenId-error');
      if (errorEl) errorEl.textContent = 'El almacén es requerido.';
    }

    // Validar descripción requerida
    const descripcionInput = formEl.querySelector<HTMLInputElement>('#descripcion');
    const descripcion = descripcionInput?.value.trim() ?? '';
    if (!descripcion) {
      isValid = false;
      descripcionInput?.classList.add('is-invalid');
      const errorEl = formEl.querySelector<HTMLElement>('#descripcion-error');
      if (errorEl) errorEl.textContent = 'La descripción es requerida.';
    }

    // Validar al menos un producto
    if (items.length === 0) {
      isValid = false;
      const errorEl = formEl.querySelector<HTMLElement>('#items-error');
      if (errorEl) {
        errorEl.textContent = 'Debe agregar al menos un producto al conteo.';
        errorEl.style.display = '';
      }
    }

    // Validar que todos los productos tienen selección
    const missingProducto = items.find((item) => !item.productoId);
    if (missingProducto) {
      isValid = false;
      renderGlobalAlert(container, 'Todos los productos deben estar seleccionados.');
    }

    if (!isValid) return;

    btnSubmitEl.disabled = true;
    btnSubmitEl.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creando...';

    const data = new FormData(formEl);
    const almacenId = (data.get('almacenId') as string).trim();
    const fechaInicio = (data.get('fechaInicio') as string).trim() || undefined;
    const fechaFin = (data.get('fechaFin') as string).trim() || undefined;

    // Resolver almacenNombre desde el select
    const selectedOption = almacenSelect?.options[almacenSelect.selectedIndex];
    const almacenNombre = selectedOption?.getAttribute('data-nombre') ?? almacenId;

    // Construir ítems del POST
    const postItems: Omit<ConteoItem, 'id'>[] = items.map((item) => ({
      productoId: item.productoId,
      productoCodigo: item.productoCodigo,
      productoNombre: item.productoNombre,
      cantidadSistema: item.cantidadSistema,
      ajustado: false,
    }));

    // Construir body usando spreads condicionales para campos opcionales
    const body = {
      descripcion,
      almacenId,
      almacenNombre,
      estado: 'planificado' as const,
      items: postItems,
      ...(fechaInicio !== undefined ? { fechaInicio } : {}),
      ...(fechaFin !== undefined ? { fechaFin } : {}),
    };

    try {
      const nuevoConteo = await apiFetch<Conteo>('/api/conteos', {
        method: 'POST',
        body,
        signal,
      });

      // Navegar al detalle del conteo creado
      window.location.hash = '#/conteos/' + nuevoConteo.id;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;

      btnSubmitEl.disabled = false;
      btnSubmitEl.innerHTML = '<i class="bi bi-check-lg me-1" aria-hidden="true"></i>Crear Conteo';

      if (error instanceof ApiError) {
        if (error.status === 422) {
          // Error de validación del servidor
          const problemDetails = error.body as ProblemDetails;
          const message = problemDetails.detail ?? 'Error de validación al crear el conteo.';
          renderGlobalAlert(container, message);
        } else {
          renderGlobalAlert(container, 'Error al crear el conteo. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al crear el conteo. Intente nuevamente.');
      }
    }
  }

  formEl.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Carga en paralelo los catálogos necesarios (almacenes y productos) y renderiza el formulario.
 */
function renderConteosNuevo(container: HTMLElement, options: { signal: AbortSignal }): void {
  const { signal } = options;

  // Reiniciar estado de ítems para este render
  items = [];

  // Mostrar spinner durante la carga de catálogos
  container.innerHTML = `
    <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
      ${Spinner.render({ size: 'lg', label: 'Cargando formulario...' })}
    </div>
  `;

  // Cargar catálogos en paralelo
  const almacenesPromise = apiFetch<PaginatedResponse<Almacen>>(
    '/api/almacenes?status=active&pageSize=100',
    { signal }
  );
  const productosPromise = apiFetch<PaginatedResponse<Producto>>(
    '/api/productos?status=active&pageSize=200',
    { signal }
  );

  Promise.all([almacenesPromise, productosPromise])
    .then(([almacenesResponse, productosResponse]) => {
      renderForm(container, {
        almacenes: almacenesResponse.data,
        productos: productosResponse.data,
        signal,
      });
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') return;

      container.innerHTML = `
        <div class="p-4">
          <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>No se pudo cargar el formulario. Intente nuevamente.</span>
          </div>
          <button type="button" class="btn btn-secondary mt-3" id="btn-back-error"
            aria-label="Volver a la lista de conteos">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Conteos
          </button>
        </div>
      `;
      container
        .querySelector<HTMLButtonElement>('#btn-back-error')
        ?.addEventListener('click', () => {
          window.location.hash = '#/conteos';
        });
    });
}

/** Módulo de página de creación de conteo físico */
export const conteosNuevoPage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderConteosNuevo(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
