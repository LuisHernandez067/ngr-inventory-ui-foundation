import type { EstadoMovimiento, Movimiento } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo movimientos-detail.
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

// Mockear ConfirmDialog para controlar el resultado del diálogo
vi.mock('@ngr-inventory/ui-core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    ConfirmDialog: {
      confirm: vi.fn(),
    },
  };
});

import { apiFetch, ApiError } from '../_shared/apiFetch';

import { ALLOWED, movimientosDetailPage } from './movimientos-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture base — movimiento en estado borrador */
const movimientoBorrador: Movimiento = {
  id: 'mov-007',
  numero: 'MOV-2025-0007',
  tipo: 'salida',
  estado: 'borrador',
  almacenOrigenId: 'alm-002',
  almacenOrigenNombre: 'Almacén Norte',
  items: [
    {
      id: 'movi-007-1',
      productoId: 'prod-011',
      productoCodigo: 'SOP-LAP-001',
      productoNombre: 'Soporte para Laptop',
      cantidad: 3,
      precioUnitario: 9500,
    },
  ],
  createdAt: '2025-03-01T09:00:00.000Z',
  updatedAt: '2025-03-01T09:00:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Fixture — movimiento en estado ejecutado (sin botones de transición) */
const movimientoEjecutado: Movimiento = {
  id: 'mov-001',
  numero: 'MOV-2025-0001',
  tipo: 'entrada',
  estado: 'ejecutado',
  almacenDestinoId: 'alm-001',
  almacenDestinoNombre: 'Depósito Central',
  proveedorId: 'prov-001',
  proveedorNombre: 'Tecno Distribuciones S.A.',
  items: [
    {
      id: 'movi-001-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidad: 10,
      precioUnitario: 28500,
    },
    {
      id: 'movi-001-2',
      productoId: 'prod-004',
      productoCodigo: 'MOU-INL-001',
      productoNombre: 'Mouse Inalámbrico',
      cantidad: 20,
      precioUnitario: 8900,
    },
  ],
  observacion: 'Recepción de mercadería',
  fechaEjecucion: '2025-01-20T10:00:00.000Z',
  createdAt: '2025-01-20T09:00:00.000Z',
  updatedAt: '2025-01-20T10:30:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

/** Fixture — movimiento en estado aprobado */
const movimientoAprobado: Movimiento = {
  id: 'mov-003',
  numero: 'MOV-2025-0003',
  tipo: 'transferencia',
  estado: 'aprobado',
  almacenOrigenId: 'alm-001',
  almacenOrigenNombre: 'Depósito Central',
  almacenDestinoId: 'alm-002',
  almacenDestinoNombre: 'Almacén Norte',
  items: [
    {
      id: 'movi-003-1',
      productoId: 'prod-005',
      productoCodigo: 'CAB-HDMI-001',
      productoNombre: 'Cable HDMI 2.0 2m',
      cantidad: 30,
      precioUnitario: 2200,
    },
  ],
  createdAt: '2025-02-01T08:00:00.000Z',
  updatedAt: '2025-02-01T11:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

/** Fixture — movimiento en estado anulado */
const movimientoAnulado: Movimiento = {
  id: 'mov-008',
  numero: 'MOV-2025-0008',
  tipo: 'entrada',
  estado: 'anulado',
  almacenDestinoId: 'alm-003',
  almacenDestinoNombre: 'Almacén Sur',
  items: [],
  createdAt: '2025-02-10T08:00:00.000Z',
  updatedAt: '2025-02-15T16:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

describe('movimientosDetailPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    movimientosDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    movimientosDetailPage.render(container, { id: 'mov-001' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando movimiento');
  });

  // ── Renderizado del encabezado ───────────────────────────────────────────────

  it('debe renderizar el número y el tipo del movimiento', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#movimiento-numero')).not.toBeNull();
    });

    expect(q(container, '#movimiento-numero').textContent).toBe('MOV-2025-0001');
    expect(q(container, '#movimiento-tipo').textContent).toBe('entrada');
  });

  it('debe renderizar el badge de estado correcto', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')).not.toBeNull();
    });

    const badge = q(container, '#estado-badge');
    expect(badge.textContent).toBe('borrador');
  });

  it('debe renderizar el badge ejecutado con clase bg-success', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')).not.toBeNull();
    });

    const badge = q(container, '#estado-badge');
    expect(badge.classList.contains('bg-success')).toBe(true);
  });

  // ── Tabla de ítems ───────────────────────────────────────────────────────────

  it('debe renderizar la tabla de ítems con los productos del movimiento', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#items-table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Teclado Mecánico TKL');
    expect(container.innerHTML).toContain('Mouse Inalámbrico');
  });

  it('debe renderizar el total calculado de los ítems', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#items-total')).not.toBeNull();
    });

    // Total = (10 * 28500) + (20 * 8900) = 285000 + 178000 = 463000
    const totalEl = q(container, '#items-total');
    expect(totalEl.textContent).toContain('463');
  });

  it('debe mostrar "Sin ítems registrados" cuando el movimiento no tiene ítems', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoAnulado);

    movimientosDetailPage.render(container, { id: 'mov-008' });

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin ítems registrados');
    });
  });

  // ── Botones de transición por estado ────────────────────────────────────────

  it('debe mostrar botones "Solicitar Aprobación" y "Anular" para borrador', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Solicitar Aprobación');
    expect(html).toContain('Anular');
  });

  it('debe mostrar botón "Editar" con href al editar cuando estado es borrador', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const editLink = container.querySelector<HTMLAnchorElement>('a[href*="/editar"]');
    expect(editLink).not.toBeNull();
    expect(editLink?.getAttribute('href')).toBe('#/movimientos/mov-007/editar');
  });

  it('NO debe mostrar botón "Editar" cuando estado es pendiente', async () => {
    const movimientoPendiente: Movimiento = {
      ...movimientoBorrador,
      id: 'mov-009',
      estado: 'pendiente',
    };
    mockApiFetch.mockResolvedValueOnce(movimientoPendiente);

    movimientosDetailPage.render(container, { id: 'mov-009' });

    await vi.waitFor(() => {
      expect(container.querySelector('#movimiento-numero')).not.toBeNull();
    });

    expect(container.querySelector('a[href*="/editar"]')).toBeNull();
  });

  it('NO debe mostrar botones de transición para ejecutado', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#movimiento-numero')).not.toBeNull();
    });

    expect(container.querySelector('#transition-actions')).toBeNull();
  });

  it('NO debe mostrar botones de transición para anulado', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoAnulado);

    movimientosDetailPage.render(container, { id: 'mov-008' });

    await vi.waitFor(() => {
      expect(container.querySelector('#movimiento-numero')).not.toBeNull();
    });

    expect(container.querySelector('#transition-actions')).toBeNull();
  });

  it('debe mostrar botones "Ejecutar" y "Anular" para aprobado', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoAprobado);

    movimientosDetailPage.render(container, { id: 'mov-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Ejecutar');
    expect(html).toContain('Anular');
  });

  // ── ConfirmDialog para transiciones destructivas ─────────────────────────────

  it('debe abrir ConfirmDialog al hacer clic en "Anular"', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador);
    mockConfirm.mockResolvedValue(false); // El usuario cancela

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const anularBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="anulado"]'
    );
    if (!anularBtn) throw new Error('Botón anular no encontrado');
    anularBtn.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Anular' }));
  });

  it('debe abrir ConfirmDialog para transición no-destructiva (pendiente)', async () => {
    const movimientoActualizado = {
      ...movimientoBorrador,
      estado: 'pendiente' as EstadoMovimiento,
    };
    mockApiFetch
      .mockResolvedValueOnce(movimientoBorrador)
      .mockResolvedValueOnce(movimientoActualizado)
      .mockResolvedValueOnce(movimientoActualizado);
    mockConfirm.mockResolvedValue(true); // El usuario confirma

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const pendienteBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="pendiente"]'
    );
    if (!pendienteBtn) throw new Error('Botón pendiente no encontrado');
    pendienteBtn.click();

    // Esperar a que el ConfirmDialog sea llamado
    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    // ConfirmDialog debe haberse llamado con el título correcto
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Solicitar Aprobación' })
    );
  });

  // ── PATCH exitoso → re-render ────────────────────────────────────────────────

  it('debe re-renderizar con el nuevo estado tras PATCH exitoso', async () => {
    const movimientoActualizado: Movimiento = { ...movimientoBorrador, estado: 'pendiente' };
    mockApiFetch
      .mockResolvedValueOnce(movimientoBorrador) // Carga inicial
      .mockResolvedValueOnce(movimientoActualizado) // PATCH
      .mockResolvedValueOnce(movimientoActualizado); // Re-fetch
    mockConfirm.mockResolvedValue(true);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const pendienteBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="pendiente"]'
    );
    if (!pendienteBtn) throw new Error('Botón pendiente no encontrado');
    pendienteBtn.click();

    // Esperar que el badge se actualice al nuevo estado
    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')?.textContent).toBe('pendiente');
    });

    expect(q(container, '#estado-badge').textContent).toBe('pendiente');
  });

  it('debe re-renderizar con estado anulado tras confirmar la anulación', async () => {
    const movimientoActualizado: Movimiento = { ...movimientoBorrador, estado: 'anulado' };
    mockApiFetch
      .mockResolvedValueOnce(movimientoBorrador)
      .mockResolvedValueOnce(movimientoActualizado)
      .mockResolvedValueOnce(movimientoActualizado);
    mockConfirm.mockResolvedValue(true);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const anularBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="anulado"]'
    );
    if (!anularBtn) throw new Error('Botón anular no encontrado');
    anularBtn.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')?.textContent).toBe('anulado');
    });

    // Estado anulado — sin botones de transición
    expect(container.querySelector('#transition-actions')).toBeNull();
  });

  it('no debe ejecutar PATCH cuando el usuario cancela el ConfirmDialog', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador);
    mockConfirm.mockResolvedValue(false);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const anularBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="anulado"]'
    );
    if (!anularBtn) throw new Error('Botón anular no encontrado');
    anularBtn.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    // Solo debe haberse llamado 1 vez (carga inicial) — sin PATCH
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  // ── Errores de transición ────────────────────────────────────────────────────

  it('debe mostrar error 409 cuando la transición no es permitida por el servidor', async () => {
    const apiError = new ApiError(409, { title: 'Transición inválida' });
    mockApiFetch.mockResolvedValueOnce(movimientoBorrador).mockRejectedValueOnce(apiError);
    mockConfirm.mockResolvedValue(true);

    movimientosDetailPage.render(container, { id: 'mov-007' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    // Anular es destructiva — requiere confirmación (mockConfirm retorna true)
    const anularBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="anulado"]'
    );
    if (!anularBtn) throw new Error('Botón anular no encontrado');
    anularBtn.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-error')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Transición no permitida');
  });

  // ── Estado de error en carga ─────────────────────────────────────────────────

  it('debe mostrar alerta de error cuando apiFetch falla al cargar', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el movimiento');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────────

  it('debe navegar a #/movimientos al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container, { id: 'mov-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/movimientos');
  });

  it('debe usar mov-001 por defecto si no se pasan params', async () => {
    mockApiFetch.mockResolvedValueOnce(movimientoEjecutado);

    movimientosDetailPage.render(container);

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/api/movimientos/mov-001', expect.any(Object));
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    movimientosDetailPage.render(container, { id: 'mov-001' });

    expect(() => {
      movimientosDetailPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      movimientosDetailPage.destroy();
    }).not.toThrow();
  });
});

// ── Tests unitarios del mapa ALLOWED ────────────────────────────────────────

describe('ALLOWED transition map', () => {
  it('borrador permite transiciones a pendiente y anulado', () => {
    expect(ALLOWED.borrador).toContain('pendiente');
    expect(ALLOWED.borrador).toContain('anulado');
  });

  it('pendiente permite transiciones a aprobado y borrador', () => {
    expect(ALLOWED.pendiente).toContain('aprobado');
    expect(ALLOWED.pendiente).toContain('borrador');
  });

  it('aprobado permite transiciones a ejecutado y anulado', () => {
    expect(ALLOWED.aprobado).toContain('ejecutado');
    expect(ALLOWED.aprobado).toContain('anulado');
  });

  it('ejecutado no permite transiciones', () => {
    expect(ALLOWED.ejecutado).toHaveLength(0);
  });

  it('anulado no permite transiciones', () => {
    expect(ALLOWED.anulado).toHaveLength(0);
  });
});
