import type { Conteo, EstadoConteo } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo conteos-detail.
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

import { ALLOWED, conteosDetailPage } from './conteos-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture — conteo en estado planificado */
const conteoPlanificado: Conteo = {
  id: 'cnt-003',
  numero: 'CNT-2025-0003',
  descripcion: 'Conteo sorpresa monitores y mobiliario',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'planificado',
  items: [
    {
      id: 'cnt-003-1',
      productoId: 'prod-002',
      productoCodigo: 'MON-IPS-001',
      productoNombre: 'Monitor 27 pulgadas IPS',
      cantidadSistema: 4,
      ajustado: false,
    },
  ],
  createdAt: '2025-03-20T10:00:00.000Z',
  updatedAt: '2025-03-20T10:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

/** Fixture — conteo en estado en_curso */
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

/** Fixture — conteo en estado pausado */
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
  ],
  fechaInicio: '2025-04-01T08:00:00.000Z',
  createdAt: '2025-03-28T09:00:00.000Z',
  updatedAt: '2025-04-01T11:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

/** Fixture — conteo en estado completado con discrepancias */
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

/** Fixture — conteo en estado anulado */
const conteoAnulado: Conteo = {
  id: 'cnt-004',
  numero: 'CNT-2025-0004',
  descripcion: 'Conteo general almacén sur',
  almacenId: 'alm-003',
  almacenNombre: 'Almacén Sur',
  estado: 'anulado',
  items: [],
  createdAt: '2025-03-01T08:00:00.000Z',
  updatedAt: '2025-03-05T14:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

describe('conteosDetailPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    conteosDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    conteosDetailPage.render(container, { id: 'cnt-002' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando conteo');
  });

  // ── Renderizado del encabezado ───────────────────────────────────────────────

  it('debe renderizar el número del conteo', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#conteo-numero')).not.toBeNull();
    });

    expect(q(container, '#conteo-numero').textContent.trim()).toBe('CNT-2025-0002');
  });

  it('debe renderizar el badge con nombre español "En Curso" para estado en_curso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')).not.toBeNull();
    });

    expect(q(container, '#estado-badge').textContent.trim()).toBe('En Curso');
  });

  it('debe renderizar el badge con nombre español "Planificado" para estado planificado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPlanificado);

    conteosDetailPage.render(container, { id: 'cnt-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')).not.toBeNull();
    });

    expect(q(container, '#estado-badge').textContent.trim()).toBe('Planificado');
  });

  it('debe renderizar el badge "Completado" con clase bg-success', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosDetailPage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')).not.toBeNull();
    });

    const badge = q(container, '#estado-badge');
    expect(badge.textContent.trim()).toBe('Completado');
    expect(badge.classList.contains('bg-success')).toBe(true);
  });

  // ── Tabla de ítems ───────────────────────────────────────────────────────────

  it('debe renderizar la tabla de ítems con los productos del conteo', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#items-table')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Disco SSD 500GB');
  });

  // ── Botones de transición por estado ────────────────────────────────────────

  it('debe mostrar botones "Iniciar Conteo" y "Anular" para planificado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPlanificado);

    conteosDetailPage.render(container, { id: 'cnt-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const html = container.innerHTML;
    expect(html).toContain('Iniciar Conteo');
    expect(html).toContain('Anular');
  });

  it('debe mostrar botón "Cargar Cantidades" para estado en_curso', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const cargarLink = container.querySelector<HTMLAnchorElement>('a[href*="/carga"]');
    expect(cargarLink).not.toBeNull();
    expect(cargarLink?.getAttribute('href')).toBe('#/conteos/cnt-002/carga');
  });

  it('NO debe mostrar botón "Cargar Cantidades" para estado pausado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPausado);

    conteosDetailPage.render(container, { id: 'cnt-005' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const cargarLink = container.querySelector<HTMLAnchorElement>('a[href*="/carga"]');
    expect(cargarLink).toBeNull();
  });

  it('debe mostrar botón "Cerrar y Conciliar" para estado completado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoCompletado);

    conteosDetailPage.render(container, { id: 'cnt-006' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const cerrarLink = container.querySelector<HTMLAnchorElement>('a[href*="/cierre"]');
    expect(cerrarLink).not.toBeNull();
    expect(cerrarLink?.getAttribute('href')).toBe('#/conteos/cnt-006/cierre');
  });

  it('NO debe mostrar botones de transición para anulado', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoAnulado);

    conteosDetailPage.render(container, { id: 'cnt-004' });

    await vi.waitFor(() => {
      expect(container.querySelector('#conteo-numero')).not.toBeNull();
    });

    expect(container.querySelector('#transition-actions')).toBeNull();
  });

  // ── ConfirmDialog en transiciones ────────────────────────────────────────────

  it('debe abrir ConfirmDialog al hacer clic en "Anular"', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPlanificado);
    mockConfirm.mockResolvedValue(false); // El usuario cancela

    conteosDetailPage.render(container, { id: 'cnt-003' });

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

  it('debe abrir ConfirmDialog para "Iniciar Conteo" y re-renderizar tras confirmar', async () => {
    const conteoActualizado: Conteo = { ...conteoPlanificado, estado: 'en_curso' };
    mockApiFetch
      .mockResolvedValueOnce(conteoPlanificado)
      .mockResolvedValueOnce(conteoActualizado)
      .mockResolvedValueOnce(conteoActualizado);
    mockConfirm.mockResolvedValue(true);

    conteosDetailPage.render(container, { id: 'cnt-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const iniciarBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="en_curso"]'
    );
    if (!iniciarBtn) throw new Error('Botón iniciar conteo no encontrado');
    iniciarBtn.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    expect(mockConfirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Iniciar Conteo' }));
  });

  // ── PATCH exitoso → re-render ────────────────────────────────────────────────

  it('debe re-renderizar con el nuevo estado "En Curso" tras PATCH exitoso', async () => {
    const conteoActualizado: Conteo = { ...conteoPlanificado, estado: 'en_curso' as EstadoConteo };
    mockApiFetch
      .mockResolvedValueOnce(conteoPlanificado)
      .mockResolvedValueOnce(conteoActualizado)
      .mockResolvedValueOnce(conteoActualizado);
    mockConfirm.mockResolvedValue(true);

    conteosDetailPage.render(container, { id: 'cnt-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const iniciarBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="en_curso"]'
    );
    if (!iniciarBtn) throw new Error('Botón iniciar conteo no encontrado');
    iniciarBtn.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#estado-badge')?.textContent).toBe('En Curso');
    });
  });

  it('no debe ejecutar PATCH cuando el usuario cancela el ConfirmDialog', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoPlanificado);
    mockConfirm.mockResolvedValue(false);

    conteosDetailPage.render(container, { id: 'cnt-003' });

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

  it('debe mostrar error 409 "Transición no permitida" al recibir 409', async () => {
    const apiError = new ApiError(409, { title: 'Transición inválida' });
    mockApiFetch.mockResolvedValueOnce(conteoPlanificado).mockRejectedValueOnce(apiError);
    mockConfirm.mockResolvedValue(true);

    conteosDetailPage.render(container, { id: 'cnt-003' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

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

  it('debe mostrar error 422 "ítems sin cantidad contada" al recibir 422', async () => {
    const apiError = new ApiError(422, { title: 'Items sin cantidad' });
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso).mockRejectedValueOnce(apiError);
    mockConfirm.mockResolvedValue(true);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-actions')).not.toBeNull();
    });

    const completarBtn = container.querySelector<HTMLButtonElement>(
      '.transition-btn[data-target="completado"]'
    );
    if (!completarBtn) throw new Error('Botón completar no encontrado');
    completarBtn.click();

    await vi.waitFor(() => {
      expect(container.querySelector('#transition-error')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('ítems sin cantidad contada');
  });

  // ── Estado de error en carga ─────────────────────────────────────────────────

  it('debe mostrar alerta warning cuando el conteo no existe (404)', async () => {
    const apiError = new ApiError(404, { title: 'Not found' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    conteosDetailPage.render(container, { id: 'cnt-999' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('El conteo solicitado no existe');
  });

  it('debe mostrar alerta danger cuando apiFetch falla al cargar', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el conteo');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────────

  it('debe navegar a #/conteos al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(conteoEnCurso);

    conteosDetailPage.render(container, { id: 'cnt-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/conteos');
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    conteosDetailPage.render(container, { id: 'cnt-002' });

    expect(() => {
      conteosDetailPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      conteosDetailPage.destroy();
    }).not.toThrow();
  });
});

// ── Tests unitarios del mapa ALLOWED ────────────────────────────────────────

describe('ALLOWED transition map (conteos)', () => {
  it('planificado permite transiciones a en_curso y anulado', () => {
    expect(ALLOWED.planificado).toContain('en_curso');
    expect(ALLOWED.planificado).toContain('anulado');
  });

  it('en_curso permite transiciones a pausado, completado y anulado', () => {
    expect(ALLOWED.en_curso).toContain('pausado');
    expect(ALLOWED.en_curso).toContain('completado');
    expect(ALLOWED.en_curso).toContain('anulado');
  });

  it('pausado permite transiciones a en_curso y anulado', () => {
    expect(ALLOWED.pausado).toContain('en_curso');
    expect(ALLOWED.pausado).toContain('anulado');
  });

  it('completado no permite transiciones', () => {
    expect(ALLOWED.completado).toHaveLength(0);
  });

  it('anulado no permite transiciones', () => {
    expect(ALLOWED.anulado).toHaveLength(0);
  });
});
