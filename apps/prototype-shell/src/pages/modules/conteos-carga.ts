// Página de carga de cantidades — permite al operador ingresar cantidades contadas por ítem
import type { Conteo, ConteoItem, ConteoItemCargaDto } from '@ngr-inventory/api-contracts';
import { Spinner } from '@ngr-inventory/ui-core';

import type { PageModule } from '../../router/router';
import { ApiError, apiFetch } from '../_shared/apiFetch';

/** Controlador de cancelación para peticiones en vuelo */
let abortController: AbortController | null = null;

/** Estado local: mapa de itemId → cantidadContada ingresada por el operador */
let cantidadesLocales: Map<string, number> = new Map<string, number>();

/**
 * Calcula la diferencia entre cantidadContada y cantidadSistema.
 * Retorna undefined si no se ingresó cantidad contada.
 */
function calcularDiferencia(cantidadSistema: number, cantidadContada: number): number {
  return cantidadContada - cantidadSistema;
}

/**
 * Genera el badge HTML para la diferencia calculada en tiempo real.
 * Verde = sin diferencia, rojo = faltante (negativo), amarillo = sobrante (positivo).
 */
function buildDiferenciaBadge(diferencia: number): string {
  if (diferencia === 0) {
    return `<span class="badge bg-success" aria-label="Sin diferencia">0</span>`;
  }
  if (diferencia < 0) {
    // Faltante: se contaron menos unidades de las esperadas
    return `<span class="badge bg-danger" aria-label="Faltante: ${String(diferencia)}">${String(diferencia)}</span>`;
  }
  // Sobrante: se contaron más unidades de las esperadas
  return `<span class="badge bg-warning text-dark" aria-label="Sobrante: +${String(diferencia)}">+${String(diferencia)}</span>`;
}

/**
 * Actualiza el badge de diferencia de una fila de ítem en tiempo real.
 * Se llama al cambiar el input de cantidadContada.
 */
function updateDiferenciaBadge(
  container: HTMLElement,
  item: ConteoItem,
  cantidadContada: number
): void {
  const badgeCell = container.querySelector<HTMLElement>(`[data-diferencia-id="${item.id}"]`);
  if (!badgeCell) return;
  const diferencia = calcularDiferencia(item.cantidadSistema, cantidadContada);
  badgeCell.innerHTML = buildDiferenciaBadge(diferencia);
}

/**
 * Genera el HTML de la tabla de ítems con inputs numéricos editables.
 * Cada fila muestra: código, nombre, cantidad sistema (read-only), cantidad contada (input), diferencia (badge live).
 */
function buildItemsTable(conteo: Conteo): string {
  if (conteo.items.length === 0) {
    return `<p class="text-muted fst-italic">Sin ítems registrados en este conteo.</p>`;
  }

  const rows = conteo.items
    .map((item: ConteoItem) => {
      // Inicializar desde el valor ya guardado o desde el estado local (si existe)
      const cantidadInicial = cantidadesLocales.get(item.id) ?? item.cantidadContada ?? 0;
      const diferencia = calcularDiferencia(item.cantidadSistema, cantidadInicial);

      return `<tr>
        <td class="text-muted small align-middle">${item.productoCodigo}</td>
        <td class="align-middle">${item.productoNombre}</td>
        <td class="text-end align-middle">
          <span class="fw-semibold">${String(item.cantidadSistema)}</span>
        </td>
        <td class="text-end align-middle" style="width: 140px;">
          <input
            type="number"
            class="form-control form-control-sm text-end item-cantidad-input"
            data-item-id="${item.id}"
            data-cantidad-sistema="${String(item.cantidadSistema)}"
            value="${String(cantidadInicial)}"
            min="0"
            step="1"
            aria-label="Cantidad contada para ${item.productoNombre}"
          />
        </td>
        <td class="text-end align-middle" style="width: 100px;">
          <span data-diferencia-id="${item.id}">${buildDiferenciaBadge(diferencia)}</span>
        </td>
      </tr>`;
    })
    .join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover align-middle" id="carga-items-table" aria-label="Ítems para carga de cantidades">
        <thead class="table-light">
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Producto</th>
            <th scope="col" class="text-end">Cant. Sistema</th>
            <th scope="col" class="text-end">Cant. Contada</th>
            <th scope="col" class="text-end">Diferencia</th>
          </tr>
        </thead>
        <tbody id="carga-items-tbody">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Valida que todas las cantidades ingresadas sean válidas (no negativas).
 * Agrega clase is-invalid a los inputs con valores inválidos.
 * Retorna true si todas las cantidades son válidas.
 */
function validateInputs(container: HTMLElement): boolean {
  let isValid = true;

  const inputs = container.querySelectorAll<HTMLInputElement>('.item-cantidad-input');
  inputs.forEach((input) => {
    input.classList.remove('is-invalid');
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 0) {
      input.classList.add('is-invalid');
      isValid = false;
    }
  });

  return isValid;
}

/**
 * Renderiza la página completa de carga de cantidades con los datos del conteo.
 */
function renderCarga(container: HTMLElement, conteo: Conteo): void {
  const itemsTable = buildItemsTable(conteo);

  // Alerta si el conteo no está en un estado que permita carga
  const notEnCursoAlert =
    conteo.estado !== 'en_curso'
      ? `<div class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>Este conteo no está en curso. Solo se pueden cargar cantidades en conteos con estado <strong>En Curso</strong>.</span>
        </div>`
      : '';

  container.innerHTML = `
    <div class="p-4">
      <!-- Barra superior: título y botón volver -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <button id="btn-back" type="button" class="btn btn-sm btn-outline-secondary"
          aria-label="Volver al detalle del conteo">
          <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
          Volver al Conteo
        </button>
        <h1 class="h3 mb-0">Carga de Cantidades</h1>
      </div>

      <!-- Encabezado del conteo (read-only) -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <span class="text-muted small">Número</span>
              <p class="fw-semibold mb-0">${conteo.numero}</p>
            </div>
            <div class="vr d-none d-md-block"></div>
            <div>
              <span class="text-muted small">Descripción</span>
              <p class="fw-semibold mb-0">${conteo.descripcion}</p>
            </div>
            <div class="vr d-none d-md-block"></div>
            <div>
              <span class="text-muted small">Almacén</span>
              <p class="fw-semibold mb-0">${conteo.almacenNombre}</p>
            </div>
            <div class="ms-auto">
              <span class="badge ${conteo.estado === 'en_curso' ? 'bg-primary' : 'bg-warning text-dark'}"
                aria-label="Estado: ${conteo.estado === 'en_curso' ? 'En Curso' : conteo.estado}">
                ${conteo.estado === 'en_curso' ? 'En Curso' : conteo.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      ${notEnCursoAlert}

      <!-- Alerta de error de envío (se inserta dinámicamente) -->
      <div id="submit-error-container"></div>

      <!-- Tabla de ítems con inputs editables -->
      <div class="card mb-4">
        <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-input-cursor-text me-2" aria-hidden="true"></i>
            Ítems del conteo
          </span>
          <span class="badge bg-secondary" aria-label="Total de ítems">${String(conteo.items.length)} ítem(s)</span>
        </div>
        <div class="card-body">
          ${itemsTable}
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="d-flex gap-2">
        <button id="btn-guardar" type="button" class="btn btn-primary"
          ${conteo.estado !== 'en_curso' ? 'disabled' : ''}
          aria-label="Guardar cantidades contadas">
          <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
          Guardar Cantidades
        </button>
        <button id="btn-cancelar" type="button" class="btn btn-outline-secondary"
          aria-label="Cancelar y volver al detalle del conteo">
          Cancelar
        </button>
      </div>
    </div>
  `;

  // Wiring: botón volver
  const btnBack = container.querySelector<HTMLButtonElement>('#btn-back');
  btnBack?.addEventListener('click', () => {
    window.location.hash = `#/conteos/${conteo.id}`;
  });

  // Wiring: botón cancelar
  const btnCancelar = container.querySelector<HTMLButtonElement>('#btn-cancelar');
  btnCancelar?.addEventListener('click', () => {
    window.location.hash = `#/conteos/${conteo.id}`;
  });

  // Wiring: actualización en tiempo real de diferencia al cambiar input
  const tbody = container.querySelector<HTMLElement>('#carga-items-tbody');
  tbody?.addEventListener('input', (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.classList.contains('item-cantidad-input')) return;

    const itemId = target.getAttribute('data-item-id') ?? '';
    const cantidadSistemaAttr = target.getAttribute('data-cantidad-sistema') ?? '0';
    const cantidadSistema = parseFloat(cantidadSistemaAttr);
    const cantidadContada = parseFloat(target.value);

    if (!isNaN(cantidadContada) && cantidadContada >= 0) {
      target.classList.remove('is-invalid');
      cantidadesLocales.set(itemId, cantidadContada);

      // Buscar el ítem correspondiente para actualizar el badge
      const item = conteo.items.find((i) => i.id === itemId);
      if (item) {
        updateDiferenciaBadge(container, item, cantidadContada);
      }
    } else {
      target.classList.add('is-invalid');
    }

    void cantidadSistema; // Suprimir advertencia de variable sin usar
  });

  // Wiring: guardar cantidades
  const btnGuardar = container.querySelector<HTMLButtonElement>('#btn-guardar');
  if (!btnGuardar || conteo.estado !== 'en_curso') return;

  btnGuardar.addEventListener('click', () => {
    void handleGuardar(container, conteo, btnGuardar);
  });
}

/**
 * Maneja el guardado de cantidades: valida inputs, construye el DTO, envía PATCH y navega.
 */
async function handleGuardar(
  container: HTMLElement,
  conteo: Conteo,
  btnGuardar: HTMLButtonElement
): Promise<void> {
  // Limpiar errores previos
  const errorContainer = container.querySelector<HTMLElement>('#submit-error-container');
  if (errorContainer) errorContainer.innerHTML = '';

  // Validar que no haya cantidades negativas
  if (!validateInputs(container)) {
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>Todas las cantidades deben ser iguales o mayores a cero.</span>
        </div>
      `;
    }
    return;
  }

  // Construir DTO con los valores actuales de los inputs
  const inputs = container.querySelectorAll<HTMLInputElement>('.item-cantidad-input');
  const itemsDto: ConteoItemCargaDto[] = [];

  inputs.forEach((input) => {
    const itemId = input.getAttribute('data-item-id');
    if (!itemId) return;
    const cantidadContada = parseFloat(input.value);
    itemsDto.push({ id: itemId, cantidadContada: isNaN(cantidadContada) ? 0 : cantidadContada });
  });

  // Indicar estado de envío en el botón
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = `
    <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
    Guardando...
  `;

  try {
    const signal = abortController?.signal ?? undefined;
    await apiFetch<Conteo>(`/api/conteos/${conteo.id}/items`, {
      method: 'PATCH',
      body: { items: itemsDto },
      ...(signal !== undefined ? { signal } : {}),
    });

    // Navegar de vuelta al detalle del conteo
    window.location.hash = `#/conteos/${conteo.id}`;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') return;

    btnGuardar.disabled = false;
    btnGuardar.innerHTML = `
      <i class="bi bi-check-lg me-1" aria-hidden="true"></i>
      Guardar Cantidades
    `;

    let message = 'No se pudieron guardar las cantidades. Intente nuevamente.';
    if (error instanceof ApiError && error.status === 422) {
      const body = error.body as { detail?: string } | null;
      message = body?.detail ?? 'Error de validación en las cantidades.';
    }

    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>${message}</span>
        </div>
      `;
    }
  }
}

/** Módulo de página de carga de cantidades de Conteo físico */
export const conteosCargaPage: PageModule = {
  render(container: HTMLElement, params?: Record<string, string>): void {
    const id = params?.['id'] ?? '';

    // Limpiar estado local al montar la página
    cantidadesLocales = new Map<string, number>();

    abortController?.abort();
    abortController = new AbortController();
    const signal = abortController.signal;

    // Mostrar spinner durante la carga inicial
    container.innerHTML = `
      <div class="p-4 d-flex justify-content-center align-items-center" style="min-height: 200px;">
        ${Spinner.render({ size: 'lg', label: 'Cargando conteo...' })}
      </div>
    `;

    apiFetch<Conteo>(`/api/conteos/${id}`, { signal })
      .then((conteo) => {
        renderCarga(container, conteo);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;

        const is404 = error instanceof ApiError && error.status === 404;

        container.innerHTML = `
          <div class="p-4">
            <div class="alert alert-${is404 ? 'warning' : 'danger'} d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
              <span>${is404 ? 'El conteo solicitado no existe.' : 'No se pudo cargar el conteo.'}</span>
            </div>
            <a href="#/conteos" class="btn btn-secondary mt-3">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Conteos
            </a>
          </div>
        `;
      });
  },

  destroy(): void {
    abortController?.abort();
    abortController = null;
    cantidadesLocales = new Map<string, number>();
  },
};
