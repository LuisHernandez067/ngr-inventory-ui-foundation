import type { Conteo } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo conteos-carga.
// Se mockea apiFetch para aislar el comportamiento del componente.

// Mockear apiFetch antes de importar el módulo bajo test
vi.mock('../_shared/apiFetch', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(`HTTP ${String(status)}`);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  },
}));

import { apiFetch, ApiError } from '../_shared/apiFetch';

import { conteosCargaPage } from './conteos-carga';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture: conteo en estado en_curso (cnt-002) */
const conteoEnCurso: Conteo = {
  id: 'cnt-002',
  numero: 'CNT-2025-0002',
  descripcion: 'Conteo trimestral almacén norte — componentes',
  almacenId: 'alm-002',
  almacenNombre: 'Almacén Norte',
  estado: 'en_curso',
  items: [
    {
      id: 'cnt-002-1',
      productoId: 'prod-009',
      productoCodigo: 'SSD-500-001',
      productoNombre: 'Disco SSD 500GB',
      cantidadSistema: 8,
      cantidadContada: 8,
      diferencia: 0,
      ajustado: false,
    },
    {
      id: 'cnt-002-2',
      productoId: 'prod-010',
      productoCodigo: 'RAM-16G-001',
      productoNombre: 'Memoria RAM 16GB DDR4',
      cantidadSistema: 6,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-03-15T08:00:00.000Z',
  createdAt: '2025-03-12T09:00:00.000Z',
  updatedAt: '2025-03-15T10:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Fixture: conteo en estado pausado (cnt-005) */
const conteoPausado: Conteo = {
  id: 'cnt-005',
  numero: 'CNT-2025-0005',
  descripcion: 'Conteo parcial almacén norte — cables y adaptadores',
  almacenId: 'alm-002',
  almacenNombre: 'Almacén Norte',
  estado: 'pausado',
  items: [
    {
      id: 'cnt-005-1',
      productoId: 'prod-005',
      productoCodigo: 'CAB-HDMI-001',
      productoNombre: 'Cable HDMI 2.0 2m',
      cantidadSistema: 15,
      cantidadContada: 14,
      diferencia: -1,
      ajustado: false,
    },
    {
      id: 'cnt-005-2',
      productoId: 'prod-006',
      productoCodigo: 'CAB-USB-001',
      productoNombre: 'Cable USB-C 1m',
      cantidadSistema: 22,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-04-01T08:00:00.000Z',
  createdAt: '2025-03-28T09:00:00.000Z',
  updatedAt: '2025-04-01T11:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

describe('conteosCargaPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    conteosCargaPage.destroy();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga del conteo', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    conteosCargaPage.render(container, { id: 'cnt-002' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando conteo');
  });

  // ── Renderizado de la tabla de carga ──────────────────────────────────────

  it('debe renderizar la tabla de ítems con inputs de cantidad contada', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#carga-items-table')).not.toBeNull();
    });

    expect(container.querySelector('#carga-items-table')).not.toBeNull();
    expect(container.querySelectorAll('.item-cantidad-input').length).toBe(2);
  });

  it('debe renderizar la descripción y almacén del conteo en el encabezado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#carga-items-table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('CNT-2025-0002');
    expect(container.innerHTML).toContain('Conteo trimestral almacén norte — componentes');
    expect(container.innerHTML).toContain('Almacén Norte');
  });

  it('debe mostrar los productos en la tabla', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#carga-items-table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('SSD-500-001');
    expect(container.innerHTML).toContain('Disco SSD 500GB');
    expect(container.innerHTML).toContain('RAM-16G-001');
    expect(container.innerHTML).toContain('Memoria RAM 16GB DDR4');
  });

  // ── Estado del botón según estado del conteo ───────────────────────────────

  it('debe tener el botón "Guardar Cantidades" habilitado para conteo en_curso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    expect(btnGuardar.disabled).toBe(false);
  });

  it('debe tener el botón "Guardar Cantidades" deshabilitado para conteo pausado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPausado);

    conteosCargaPage.render(container, { id: 'cnt-005' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    expect(btnGuardar.disabled).toBe(true);
  });

  it('debe mostrar alerta de advertencia cuando el conteo está pausado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPausado);

    conteosCargaPage.render(container, { id: 'cnt-005' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.querySelector('.alert-warning')?.textContent).toContain(
      'Este conteo no está en curso'
    );
  });

  // ── Actualización en tiempo real de diferencia ────────────────────────────

  it('debe actualizar el badge de diferencia al cambiar la cantidad contada', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('.item-cantidad-input')).not.toBeNull();
    });

    // Cambiar el primer input a un valor con faltante
    const firstInput = container.querySelector<HTMLInputElement>('[data-item-id="cnt-002-1"]');
    if (!firstInput) throw new Error('Input de cantidad no encontrado');

    firstInput.value = '5';
    firstInput.dispatchEvent(new Event('input', { bubbles: true }));

    const difBadge = container.querySelector<HTMLElement>('[data-diferencia-id="cnt-002-1"]');
    expect(difBadge?.innerHTML).toContain('badge bg-danger');
  });

  it('debe agregar clase is-invalid al input si se ingresa valor negativo', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('.item-cantidad-input')).not.toBeNull();
    });

    const firstInput = container.querySelector<HTMLInputElement>('[data-item-id="cnt-002-1"]');
    if (!firstInput) throw new Error('Input de cantidad no encontrado');

    firstInput.value = '-5';
    firstInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(firstInput.classList.contains('is-invalid')).toBe(true);
  });

  // ── Guardado exitoso → redirección ────────────────────────────────────────

  it('debe enviar PATCH con el body correcto y navegar al detalle tras guardar', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso); // respuesta del PATCH

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    btnGuardar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/conteos/cnt-002/items',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    expect(window.location.hash).toBe('#/conteos/cnt-002');
  });

  it('debe enviar el body PATCH con el objeto { items: [...] }', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    btnGuardar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/conteos/cnt-002/items',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    // Verificar que el body contiene el array de ítems
    const [, callOptions] = mockApiFetch.mock.calls[1] as [
      string,
      { method: string; body: { items: unknown[] } },
    ];
    expect(Array.isArray(callOptions.body.items)).toBe(true);
  });

  // ── Error 422 → mensaje en #submit-error-container ──────────────────────

  it('debe mostrar error 422 en el contenedor de errores', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    const apiError = new ApiError(422, {
      status: 422,
      detail: 'La cantidad contada no puede ser negativa.',
    });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    btnGuardar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#submit-error-container')?.textContent).toContain(
        'La cantidad contada no puede ser negativa.'
      );
    });
  });

  it('debe mostrar mensaje genérico si el PATCH falla con error 500', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    const apiError = new ApiError(500, { title: 'Internal Server Error' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-guardar')).not.toBeNull();
    });

    const btnGuardar = q(container, '#btn-guardar') as HTMLButtonElement;
    btnGuardar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#submit-error-container')?.textContent).toContain(
        'No se pudieron guardar las cantidades'
      );
    });
  });

  // ── Error al cargar el conteo ──────────────────────────────────────────────

  it('debe mostrar alerta de error si el conteo no existe (404)', async () => {
    const apiError = new ApiError(404, { title: 'Not Found' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCargaPage.render(container, { id: 'cnt-999' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('El conteo solicitado no existe');
  });

  it('debe mostrar alerta de error genérico si falla la carga por error de red', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el conteo');
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  it('debe navegar al detalle del conteo al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/conteos/cnt-002');
  });

  it('debe navegar al detalle del conteo al hacer clic en Cancelar', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCargaPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-cancelar')).not.toBeNull();
    });

    const btnCancelar = q(container, '#btn-cancelar') as HTMLButtonElement;
    btnCancelar.click();

    expect(window.location.hash).toBe('#/conteos/cnt-002');
  });
});
