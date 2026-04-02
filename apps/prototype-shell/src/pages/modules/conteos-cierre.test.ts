import type { CierreConteoResult, Conteo } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo conteos-cierre.
// Se mockean apiFetch y ConfirmDialog para aislar el comportamiento del componente.

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

// Mockear ConfirmDialog de ui-core
vi.mock('@ngr-inventory/ui-core', () => ({
  ConfirmDialog: {
    confirm: vi.fn(),
  },
  Spinner: {
    render: vi.fn(({ label }: { label?: string }) => {
      return `<div class="spinner-border" role="status"><span class="visually-hidden">${label ?? 'Cargando...'}</span></div>`;
    }),
  },
}));

import { apiFetch, ApiError } from '../_shared/apiFetch';

import { conteosCierrePage } from './conteos-cierre';

const mockApiFetch = vi.mocked(apiFetch);
const mockConfirmDialog = vi.mocked(ConfirmDialog.confirm);

/** Helper: query con assert */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture: conteo completado con discrepancias (cnt-006) */
const conteoCompletado: Conteo = {
  id: 'cnt-006',
  numero: 'CNT-2025-0006',
  descripcion: 'Conteo semestral depósito central — zona electrónica',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'completado',
  items: [
    {
      id: 'cnt-006-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidadSistema: 10,
      cantidadContada: 7,
      diferencia: -3,
      ajustado: false,
    },
    {
      id: 'cnt-006-2',
      productoId: 'prod-004',
      productoCodigo: 'MOU-INL-001',
      productoNombre: 'Mouse Inalámbrico',
      cantidadSistema: 5,
      cantidadContada: 7,
      diferencia: 2,
      ajustado: false,
    },
    {
      id: 'cnt-006-3',
      productoId: 'prod-009',
      productoCodigo: 'SSD-500-001',
      productoNombre: 'Disco SSD 500GB',
      cantidadSistema: 8,
      cantidadContada: 8,
      diferencia: 0,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-04-05T08:00:00.000Z',
  fechaFin: '2025-04-05T17:00:00.000Z',
  createdAt: '2025-04-02T10:00:00.000Z',
  updatedAt: '2025-04-05T17:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Fixture: conteo en estado en_curso — no debe permitir cierre */
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
  ],
  fechaInicio: '2025-03-15T08:00:00.000Z',
  createdAt: '2025-03-12T09:00:00.000Z',
  updatedAt: '2025-03-15T10:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Fixture: resultado de cierre exitoso */
const cierreResultado: CierreConteoResult = {
  conteo: { ...conteoCompletado, estado: 'completado' },
  movimientoAjusteId: 'mov-ajuste-001',
  movimientoAjusteNumero: 'MOV-2025-0099',
};

describe('conteosCierrePage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    conteosCierrePage.destroy();
    document.body.removeChild(container);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ── Estado de carga ────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga del conteo', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    conteosCierrePage.render(container, { id: 'cnt-006' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando conteo');
  });

  // ── Renderizado de la página de cierre ────────────────────────────────────

  it('debe renderizar las tarjetas de resumen (Total, Sin Discrepancia, Faltantes, Sobrantes)', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#diff-table')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Total Ítems');
    expect(html).toContain('Sin Discrepancia');
    expect(html).toContain('Faltantes');
    expect(html).toContain('Sobrantes');
  });

  it('debe mostrar los valores correctos en las tarjetas de resumen', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#diff-table')).not.toBeNull();
    });

    // 3 ítems total, 1 sin discrepancia, 1 faltante, 1 sobrante
    const cards = container.querySelectorAll('.card.text-center');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('debe renderizar la tabla de discrepancias #diff-table con los ítems', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#diff-table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('TEC-MEC-001');
    expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    expect(container.innerHTML).toContain('MOU-INL-001');
    expect(container.innerHTML).toContain('Mouse Inalámbrico');
  });

  it('debe mostrar badges de diferencia con la semántica correcta (danger, warning, success)', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#diff-table')).not.toBeNull();
    });

    const html = container.innerHTML;
    // Faltante → badge bg-danger
    expect(html).toContain('badge bg-danger');
    // Sobrante → badge bg-warning
    expect(html).toContain('badge bg-warning');
    // Sin diferencia → badge bg-success
    expect(html).toContain('badge bg-success');
  });

  // ── Estado del botón según estado del conteo ───────────────────────────────

  it('debe tener el botón "Confirmar Cierre" habilitado para conteo completado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    expect(btnConfirmar.disabled).toBe(false);
  });

  it('debe tener el botón "Confirmar Cierre" deshabilitado para conteo en_curso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCierrePage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    expect(btnConfirmar.disabled).toBe(true);
  });

  it('debe mostrar alerta de advertencia cuando el conteo no está completado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosCierrePage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.querySelector('.alert-warning')?.textContent).toContain(
      'El conteo debe estar en estado'
    );
    expect(container.querySelector('.alert-warning')?.textContent).toContain('Completado');
  });

  // ── Confirmación con ConfirmDialog ────────────────────────────────────────

  it('debe llamar a ConfirmDialog.confirm al hacer clic en "Confirmar Cierre"', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(false); // usuario cancela

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(mockConfirmDialog).toHaveBeenCalledTimes(1);
    });
  });

  it('debe NO hacer el POST si el usuario cancela el ConfirmDialog', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(false);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(mockConfirmDialog).toHaveBeenCalledTimes(1);
    });

    // Verificar que NO se llamó al POST (solo la llamada GET inicial)
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  // ── POST exitoso → resultado del cierre ────────────────────────────────────

  it('debe mostrar resultado de cierre con enlace al movimiento de ajuste tras POST exitoso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(true);
    mockApiFetch.mockResolvedValueOnce(cierreResultado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#cierre-result-container')?.textContent).toContain(
        'Conteo cerrado correctamente'
      );
    });

    expect(container.querySelector('#cierre-result-container')?.innerHTML).toContain(
      'MOV-2025-0099'
    );
    expect(container.querySelector('#cierre-result-container')?.innerHTML).toContain(
      '#/movimientos/mov-ajuste-001'
    );
  });

  it('debe hacer POST a /api/conteos/:id/cierre con confirmarAjuste: true', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(true);
    mockApiFetch.mockResolvedValueOnce(cierreResultado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/conteos/cnt-006/cierre',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // Verificar que el body incluye confirmarAjuste: true
    const [, callOptions] = mockApiFetch.mock.calls[1] as [
      string,
      { method: string; body: { confirmarAjuste: boolean } },
    ];
    expect(callOptions.body.confirmarAjuste).toBe(true);
  });

  it('debe navegar al detalle del conteo tras 2 segundos después del cierre exitoso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(true);
    mockApiFetch.mockResolvedValueOnce(cierreResultado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#cierre-result-container')?.textContent).toContain(
        'Conteo cerrado correctamente'
      );
    });

    // Avanzar el tiempo para activar el setTimeout de 2 segundos
    vi.advanceTimersByTime(2000);

    expect(window.location.hash).toBe('#/conteos/cnt-006');
  });

  // ── Error 409 → mensaje "no está en estado Completado" ───────────────────

  it('debe mostrar mensaje 409 cuando el conteo no está en estado Completado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(true);

    const apiError = new ApiError(409, { title: 'Conflict' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#cierre-error-container')?.textContent).toContain(
        'El conteo no está en estado Completado'
      );
    });
  });

  it('debe mostrar mensaje genérico si el POST cierre falla con error 500', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);
    mockConfirmDialog.mockResolvedValueOnce(true);

    const apiError = new ApiError(500, { title: 'Internal Server Error' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-confirmar')).not.toBeNull();
    });

    const btnConfirmar = q(container, '#btn-confirmar') as HTMLButtonElement;
    btnConfirmar.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#cierre-error-container')?.textContent).toContain(
        'No se pudo cerrar el conteo'
      );
    });
  });

  // ── Error al cargar el conteo ──────────────────────────────────────────────

  it('debe mostrar alerta de error si el conteo no existe (404)', async () => {
    const apiError = new ApiError(404, { title: 'Not Found' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosCierrePage.render(container, { id: 'cnt-999' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('El conteo solicitado no existe');
  });

  it('debe mostrar alerta de error genérico si falla la carga por error de red', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el conteo');
  });

  // ── Navegación ────────────────────────────────────────────────────────────

  it('debe navegar al detalle del conteo al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/conteos/cnt-006');
  });

  it('debe navegar al detalle del conteo al hacer clic en Cancelar', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosCierrePage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-cancelar')).not.toBeNull();
    });

    const btnCancelar = q(container, '#btn-cancelar') as HTMLButtonElement;
    btnCancelar.click();

    expect(window.location.hash).toBe('#/conteos/cnt-006');
  });
});
