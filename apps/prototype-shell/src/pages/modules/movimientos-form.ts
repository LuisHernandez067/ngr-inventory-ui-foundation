// Página de formulario de Movimiento — crear nuevo movimiento con ítems dinámicos
import type {
  Almacen,
  Movimiento,
  Producto,
  Proveedor,
  TipoMovimiento,
} from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Cuerpo de un error 422 con detalle de stock insuficiente */
interface ProblemDetails {
  status: number;
  type?: string;
  title?: string;
  detail?: string;
  fields?: Record<string, string>;
}

/** Borrador de ítem de movimiento — estado local en memoria */
interface MovimientoItemDraft {
  rowId: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  lote?: string;
  vencimiento?: string;
}

/** Estado del módulo — se reinicia en cada render */
let items: MovimientoItemDraft[] = [];

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/**
 * Genera un identificador único de fila para el DOM.
 * Usa crypto.randomUUID si está disponible; de lo contrario usa timestamp+random.
 */
function generateRowId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return String(Date.now()) + String(Math.random());
}

/**
 * Formatea un valor como moneda COP con separadores de miles.
 */
function formatCOP(value: number): string {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

/**
 * Construye la opción HTML de un select para un almacén.
 */
function almacenOption(almacen: Almacen, selectedId?: string): string {
  const selected = almacen.id === selectedId ? ' selected' : '';
  return `<option value="${almacen.id}"${selected}>${almacen.nombre}</option>`;
}

/**
 * Construye la opción HTML de un select para un proveedor.
 */
function proveedorOption(proveedor: Proveedor, selectedId?: string): string {
  const selected = proveedor.id === selectedId ? ' selected' : '';
  return `<option value="${proveedor.id}"${selected}>${proveedor.razonSocial}</option>`;
}

/**
 * Construye la opción HTML de un select para un producto.
 */
function productoOption(producto: Producto, selectedId?: string): string {
  const selected = producto.id === selectedId ? ' selected' : '';
  return `<option value="${producto.id}" data-codigo="${producto.codigo}" data-nombre="${producto.nombre}" data-precio="${String(producto.precioUnitario)}"${selected}>${producto.codigo} — ${producto.nombre}</option>`;
}

/**
 * Renderiza el tbody y el tfoot de la tabla de ítems.
 * Se llama tras cada cambio en el array `items`.
 */
function renderItemsTable(container: HTMLElement, productos: Producto[]): void {
  const tbody = container.querySelector<HTMLTableSectionElement>('#items-tbody');
  const tfootTotal = container.querySelector<HTMLTableCellElement>('#items-total');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr id="items-empty-row">
        <td colspan="6" class="text-center text-muted fst-italic py-3">
          Sin ítems agregados. Hacé clic en "Agregar ítem".
        </td>
      </tr>
    `;
  } else {
    const productoOptions = productos.map((p) => productoOption(p)).join('');

    tbody.innerHTML = items
      .map((item) => {
        // Construir opciones del select de producto con el ítem seleccionado
        const rowOptions = productos.map((p) => productoOption(p, item.productoId)).join('');

        return `<tr data-row-id="${item.rowId}">
          <td>
            <select class="form-select form-select-sm item-producto-select"
              data-row-id="${item.rowId}" aria-label="Producto">
              <option value="">Seleccioná...</option>
              ${rowOptions}
            </select>
          </td>
          <td>
            <input type="number" class="form-control form-control-sm item-cantidad"
              data-row-id="${item.rowId}" value="${String(item.cantidad)}"
              min="1" step="1" aria-label="Cantidad" />
          </td>
          <td>
            <input type="number" class="form-control form-control-sm item-precio"
              data-row-id="${item.rowId}" value="${String(item.precioUnitario)}"
              min="0" step="0.01" aria-label="Precio unitario" />
          </td>
          <td>
            <input type="text" class="form-control form-control-sm item-lote"
              data-row-id="${item.rowId}" value="${item.lote ?? ''}"
              placeholder="Opcional" aria-label="Lote" />
          </td>
          <td>
            <input type="date" class="form-control form-control-sm item-vencimiento"
              data-row-id="${item.rowId}" value="${item.vencimiento ?? ''}"
              aria-label="Vencimiento" />
          </td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-danger item-remove-btn"
              data-row-id="${item.rowId}" aria-label="Eliminar ítem">
              <i class="bi bi-trash" aria-hidden="true"></i>
            </button>
          </td>
        </tr>`;
      })
      .join('');

    // Silenciar advertencia de uso de productoOptions — se usa solo para el caso vacío
    void productoOptions;
  }

  // Actualizar total en tfoot
  if (tfootTotal) {
    const total = items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
    tfootTotal.textContent = formatCOP(total);
  }
}

/**
 * Mapa de campos requeridos por tipo de movimiento.
 * Define qué selectores del DOM deben tener valor no vacío antes del envío.
 */
const REQUIRED_FIELDS: Record<TipoMovimiento, { id: string; label: string }[]> = {
  entrada: [
    { id: 'almacenDestinoId', label: 'Almacén Destino' },
    // proveedor es opcional para entrada
  ],
  salida: [{ id: 'almacenOrigenId', label: 'Almacén Origen' }],
  transferencia: [
    { id: 'almacenOrigenId', label: 'Almacén Origen' },
    { id: 'almacenDestinoId', label: 'Almacén Destino' },
  ],
  ajuste: [{ id: 'almacenOrigenId', label: 'Almacén Origen' }],
  devolucion: [
    { id: 'almacenDestinoId', label: 'Almacén Destino' },
    { id: 'proveedorId', label: 'Proveedor' },
  ],
};

/**
 * Valida los campos requeridos según el tipo de movimiento.
 * Agrega clase is-invalid y mensaje .invalid-feedback en los campos vacíos.
 * Retorna true si todos los campos requeridos tienen valor.
 */
function validateRequiredFields(container: HTMLElement, tipo: TipoMovimiento): boolean {
  const required = REQUIRED_FIELDS[tipo];
  let isValid = true;

  // Limpiar validaciones previas en los selectores de sección
  container.querySelectorAll('[data-section] .form-select').forEach((el) => {
    el.classList.remove('is-invalid');
    const feedback = el.nextElementSibling;
    if (feedback?.classList.contains('invalid-feedback')) {
      feedback.textContent = '';
    }
  });

  for (const field of required) {
    const select = container.querySelector<HTMLSelectElement>(`#${field.id}`);
    if (select?.value) continue;

    isValid = false;
    if (select) {
      select.classList.add('is-invalid');
      const feedback = select.nextElementSibling;
      if (feedback?.classList.contains('invalid-feedback')) {
        feedback.textContent = `${field.label} es requerido para este tipo de movimiento.`;
      }
    }
  }

  return isValid;
}

function applySections(container: HTMLElement, tipo: TipoMovimiento | ''): void {
  /** Mapa de tipo → secciones visibles */
  const VISIBLE_SECTIONS: Record<TipoMovimiento, string[]> = {
    entrada: ['almacen-destino', 'proveedor'],
    salida: ['almacen-origen'],
    transferencia: ['almacen-origen', 'almacen-destino'],
    ajuste: ['almacen-origen'],
    devolucion: ['almacen-destino', 'proveedor'],
  };

  const allSections = container.querySelectorAll<HTMLElement>('[data-section]');
  allSections.forEach((section) => {
    section.style.display = 'none';
  });

  if (!tipo) return;

  const visible = VISIBLE_SECTIONS[tipo];
  visible.forEach((sectionName) => {
    const section = container.querySelector<HTMLElement>(`[data-section="${sectionName}"]`);
    if (section) {
      section.style.display = '';
    }
  });
}

/**
 * Renderiza una alerta global en el contenedor.
 * Reemplaza cualquier alerta previa para no acumular mensajes.
 */
function renderGlobalAlert(
  container: HTMLElement,
  message: string,
  type: 'danger' | 'warning' = 'danger'
): void {
  container.querySelector('.alert-global')?.remove();

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} d-flex align-items-center gap-2 mb-3 alert-global`;
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
 * Renderiza el formulario completo de movimiento con los datos de catálogo cargados.
 */
function renderForm(
  container: HTMLElement,
  options: {
    almacenes: Almacen[];
    proveedores: Proveedor[];
    productos: Producto[];
    signal: AbortSignal;
  }
): void {
  const { almacenes, proveedores, productos, signal } = options;

  const almacenesOptions = almacenes.map((a) => almacenOption(a)).join('');
  const proveedoresOptions = proveedores.map((p) => proveedorOption(p)).join('');

  const tipoOptions = [
    { value: 'entrada', label: 'Entrada' },
    { value: 'salida', label: 'Salida' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'ajuste', label: 'Ajuste' },
    { value: 'devolucion', label: 'Devolución' },
  ]
    .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
    .join('');

  container.innerHTML = `
    <div class="p-4" style="max-width: 900px;">
      <!-- Barra superior: título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver a Movimientos
        </button>
        <h1 class="h3 mb-0">Nuevo Movimiento</h1>
      </div>

      <!-- Formulario principal -->
      <form id="movimientos-form" novalidate>

        <!-- Campos de cabecera -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información del movimiento
          </div>
          <div class="card-body">
            <div class="row g-3">

              <!-- Tipo de movimiento -->
              <div class="col-12 col-md-4">
                <label for="tipo" class="form-label fw-semibold">
                  Tipo <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="tipo" name="tipo" class="form-select" required>
                  <option value="">Seleccioná el tipo...</option>
                  ${tipoOptions}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Fecha del movimiento -->
              <div class="col-12 col-md-4">
                <label for="fecha" class="form-label fw-semibold">Fecha</label>
                <input type="date" id="fecha" name="fecha" class="form-control" />
                <div class="invalid-feedback"></div>
              </div>

              <!-- Notas / Observación -->
              <div class="col-12">
                <label for="notas" class="form-label">Notas</label>
                <textarea id="notas" name="notas" class="form-control" rows="2"
                  placeholder="Observaciones del movimiento..."></textarea>
              </div>

            </div>
          </div>
        </div>

        <!-- Secciones condicionales según tipo -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-building me-2" aria-hidden="true"></i>
            Almacenes y proveedor
          </div>
          <div class="card-body">
            <div class="row g-3">

              <!-- Almacén origen -->
              <div class="col-12 col-md-6" data-section="almacen-origen" style="display: none;">
                <label for="almacenOrigenId" class="form-label fw-semibold">Almacén Origen</label>
                <select id="almacenOrigenId" name="almacenOrigenId" class="form-select">
                  <option value="">Seleccioná almacén origen...</option>
                  ${almacenesOptions}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Almacén destino -->
              <div class="col-12 col-md-6" data-section="almacen-destino" style="display: none;">
                <label for="almacenDestinoId" class="form-label fw-semibold">Almacén Destino</label>
                <select id="almacenDestinoId" name="almacenDestinoId" class="form-select">
                  <option value="">Seleccioná almacén destino...</option>
                  ${almacenesOptions}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Proveedor -->
              <div class="col-12 col-md-6" data-section="proveedor" style="display: none;">
                <label for="proveedorId" class="form-label fw-semibold">Proveedor</label>
                <select id="proveedorId" name="proveedorId" class="form-select">
                  <option value="">Seleccioná proveedor...</option>
                  ${proveedoresOptions}
                </select>
                <div class="invalid-feedback"></div>
              </div>

            </div>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card mb-4">
          <div class="card-header d-flex align-items-center justify-content-between fw-semibold">
            <span>
              <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
              Ítems del movimiento
            </span>
            <button type="button" id="btn-agregar-item" class="btn btn-sm btn-outline-primary">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Agregar ítem
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm table-hover mb-0" id="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width: 100px;">Cantidad</th>
                    <th style="width: 130px;">Precio Unit.</th>
                    <th style="width: 120px;">Lote</th>
                    <th style="width: 140px;">Vencimiento</th>
                    <th style="width: 50px;"></th>
                  </tr>
                </thead>
                <tbody id="items-tbody">
                  <tr id="items-empty-row">
                    <td colspan="6" class="text-center text-muted fst-italic py-3">
                      Sin ítems agregados. Hacé clic en "Agregar ítem".
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="table-light fw-semibold">
                    <td colspan="5" class="text-end">Total</td>
                    <td class="text-end" id="items-total">${formatCOP(0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button id="btn-submit" type="submit" class="btn btn-primary">
            <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
            Guardar movimiento
          </button>
          <button type="button" id="btn-cancel" class="btn btn-outline-secondary">
            Cancelar
          </button>
        </div>

      </form>
    </div>
  `;

  // Wiring: botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = '#/movimientos';
  });

  // Wiring: botón cancelar
  const btnCancel = container.querySelector<HTMLButtonElement>('#btn-cancel');
  btnCancel?.addEventListener('click', () => {
    window.location.hash = '#/movimientos';
  });

  // Wiring: cambio de tipo → mostrar/ocultar secciones
  const tipoSelect = container.querySelector<HTMLSelectElement>('#tipo');
  tipoSelect?.addEventListener('change', () => {
    const tipo = tipoSelect.value as TipoMovimiento | '';
    applySections(container, tipo);
  });

  // Wiring: botón agregar ítem
  const btnAgregarItem = container.querySelector<HTMLButtonElement>('#btn-agregar-item');
  btnAgregarItem?.addEventListener('click', () => {
    items.push({
      rowId: generateRowId(),
      productoId: '',
      productoCodigo: '',
      productoNombre: '',
      cantidad: 1,
      precioUnitario: 0,
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
      const precioAttr = selectedOption?.getAttribute('data-precio');
      if (precioAttr) {
        item.precioUnitario = parseFloat(precioAttr);
      }
      renderItemsTable(container, productos);
    } else if (target.classList.contains('item-cantidad')) {
      const input = target as HTMLInputElement;
      item.cantidad = parseFloat(input.value) || 0;
      renderItemsTable(container, productos);
    } else if (target.classList.contains('item-precio')) {
      const input = target as HTMLInputElement;
      item.precioUnitario = parseFloat(input.value) || 0;
      renderItemsTable(container, productos);
    } else if (target.classList.contains('item-lote')) {
      const input = target as HTMLInputElement;
      const lote = input.value.trim();
      if (lote) {
        item.lote = lote;
      } else {
        delete item.lote;
      }
    } else if (target.classList.contains('item-vencimiento')) {
      const input = target as HTMLInputElement;
      const vencimiento = input.value;
      if (vencimiento) {
        item.vencimiento = vencimiento;
      } else {
        delete item.vencimiento;
      }
    }
  });

  // Wiring: submit del formulario
  const form = container.querySelector<HTMLFormElement>('#movimientos-form');
  const btnSubmit = container.querySelector<HTMLButtonElement>('#btn-submit');

  if (!form || !btnSubmit) return;

  const formEl: HTMLFormElement = form;
  const btnSubmitEl: HTMLButtonElement = btnSubmit;

  async function handleSubmit(event: Event): Promise<void> {
    event.preventDefault();

    // Limpiar alertas anteriores
    container.querySelector('.alert-global')?.remove();

    // Validación: tipo requerido
    const tipo = (formEl.querySelector<HTMLSelectElement>('#tipo')?.value ?? '') as
      | TipoMovimiento
      | '';
    if (!tipo) {
      renderGlobalAlert(container, 'El tipo de movimiento es requerido.');
      return;
    }

    // Validación: al menos un ítem
    if (items.length === 0) {
      renderGlobalAlert(container, 'Debe agregar al menos un ítem al movimiento.');
      return;
    }

    // Validación: cantidad > 0 en todos los ítems
    const invalidItem = items.find((item) => item.cantidad <= 0);
    if (invalidItem) {
      renderGlobalAlert(container, 'Todos los ítems deben tener una cantidad mayor a cero.');
      return;
    }

    // Validación: producto seleccionado en todos los ítems
    const missingProducto = items.find((item) => !item.productoId);
    if (missingProducto) {
      renderGlobalAlert(container, 'Todos los ítems deben tener un producto seleccionado.');
      return;
    }

    // Validación: campos requeridos según tipo
    if (!validateRequiredFields(container, tipo)) {
      return;
    }

    btnSubmitEl.disabled = true;

    const data = new FormData(formEl);
    const fecha = (data.get('fecha') as string).trim() || undefined;
    const notas = (data.get('notas') as string).trim() || undefined;
    const almacenOrigenId = (data.get('almacenOrigenId') as string).trim() || undefined;
    const almacenDestinoId = (data.get('almacenDestinoId') as string).trim() || undefined;
    const proveedorId = (data.get('proveedorId') as string).trim() || undefined;

    // Construir ítems del POST — usar spreads condicionales para campos opcionales
    const postItems = items.map((item) => ({
      productoId: item.productoId,
      productoCodigo: item.productoCodigo,
      productoNombre: item.productoNombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      ...(item.lote !== undefined ? { lote: item.lote } : {}),
      ...(item.vencimiento !== undefined ? { vencimiento: item.vencimiento } : {}),
    }));

    // Construir body con spreads condicionales — exactOptionalPropertyTypes
    const body = {
      tipo,
      estado: 'borrador' as const,
      items: postItems,
      ...(fecha !== undefined ? { fecha } : {}),
      ...(notas !== undefined ? { observacion: notas } : {}),
      ...(almacenOrigenId !== undefined ? { almacenOrigenId } : {}),
      ...(almacenDestinoId !== undefined ? { almacenDestinoId } : {}),
      ...(proveedorId !== undefined ? { proveedorId } : {}),
    };

    try {
      const newMovimiento = await apiFetch<Movimiento>('/api/movimientos', {
        method: 'POST',
        body,
        signal,
      });

      // Navegar al detalle del movimiento creado
      window.location.hash = '#/movimientos/' + newMovimiento.id;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') return;

      btnSubmitEl.disabled = false;

      if (error instanceof ApiError) {
        if (error.status === 422) {
          // Stock insuficiente u otro error de negocio
          const problemDetails = error.body as ProblemDetails;
          const message = problemDetails.detail ?? 'Error de validación en el movimiento.';
          renderGlobalAlert(container, message);
        } else {
          renderGlobalAlert(container, 'Error al guardar el movimiento. Intente nuevamente.');
        }
      } else {
        renderGlobalAlert(container, 'Error al guardar el movimiento. Intente nuevamente.');
      }
    }
  }

  formEl.addEventListener('submit', (event) => {
    void handleSubmit(event);
  });
}

/**
 * Carga en paralelo los catálogos necesarios y renderiza el formulario.
 * Almacenes activos, proveedores y productos activos se cargan simultáneamente.
 */
export function renderMovimientosForm(
  container: HTMLElement,
  options: { signal: AbortSignal }
): void {
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
  const almacenesPromise = apiFetch<{ data: Almacen[] }>(
    '/api/almacenes?status=active&pageSize=100',
    { signal }
  );
  const proveedoresPromise = apiFetch<{ data: Proveedor[] }>('/api/proveedores?pageSize=100', {
    signal,
  });
  const productosPromise = apiFetch<{ data: Producto[] }>(
    '/api/productos?status=active&pageSize=100',
    { signal }
  );

  Promise.all([almacenesPromise, proveedoresPromise, productosPromise])
    .then(([almacenesResponse, proveedoresResponse, productosResponse]) => {
      renderForm(container, {
        almacenes: almacenesResponse.data,
        proveedores: proveedoresResponse.data,
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
          <button type="button" class="btn btn-secondary mt-3" id="btn-back-error">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Movimientos
          </button>
        </div>
      `;
      container
        .querySelector<HTMLButtonElement>('#btn-back-error')
        ?.addEventListener('click', () => {
          window.location.hash = '#/movimientos';
        });
    });
}

/** Módulo de página de formulario de Movimiento */
export const movimientosFormPage: PageModule = {
  render(container: HTMLElement): void {
    abortController?.abort();
    abortController = new AbortController();
    renderMovimientosForm(container, { signal: abortController.signal });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
  },
};
