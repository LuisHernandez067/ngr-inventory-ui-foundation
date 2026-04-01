import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import * as dashboardService from '../dashboardService';
import type { MovementRow } from '../types';

import { renderMovementsPanel } from './movementsPanel';

// Tests del widget movementsPanel.
// Se mockea dashboardService para aislar el comportamiento de renderizado.

// Fixture de datos de prueba
const mockMovements: MovementRow[] = [
  {
    id: 'mov-001',
    numero: 'MOV-2024-001',
    tipo: 'entrada',
    descripcion: 'Recepción OC-2024-001',
    usuario: 'admin@ngr.com',
    fecha: '2024-03-31T14:30:00Z',
  },
  {
    id: 'mov-002',
    numero: 'MOV-2024-002',
    tipo: 'salida',
    descripcion: 'Despacho OV-2024-089',
    usuario: 'operador@ngr.com',
    fecha: '2024-03-31T13:00:00Z',
  },
  {
    id: 'mov-003',
    numero: 'MOV-2024-003',
    tipo: 'ajuste',
    descripcion: 'Ajuste de inventario — Zona A',
    usuario: 'supervisor@ngr.com',
    fecha: '2024-03-31T10:15:00Z',
  },
  {
    id: 'mov-004',
    numero: 'MOV-2024-004',
    tipo: 'transferencia',
    descripcion: 'Transferencia Bodega Norte → Sur',
    usuario: 'operador@ngr.com',
    fecha: '2024-03-31T09:00:00Z',
  },
];

describe('movementsPanel.ts', () => {
  let container: HTMLElement;
  let fetchMovementsSpy: MockInstance;

  beforeEach(() => {
    container = document.createElement('div');
    fetchMovementsSpy = vi.spyOn(dashboardService, 'fetchMovements');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Caso exitoso ─────────────────────────────────────────────────────────────

  it('debe renderizar la tabla de movimientos con los datos recibidos', async () => {
    fetchMovementsSpy.mockResolvedValueOnce(mockMovements);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    // Primero debe mostrar el spinner
    expect(container.innerHTML).toContain('spinner-border');

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockMovements.length);
    expect(container.innerHTML).toContain('MOV-2024-001');
    expect(container.innerHTML).toContain('MOV-2024-002');
  });

  it('debe mostrar los encabezados de columnas correctos', async () => {
    fetchMovementsSpy.mockResolvedValueOnce(mockMovements);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    const headers = container.querySelectorAll('th');
    const headerTexts = Array.from(headers).map((h) => h.textContent);
    expect(headerTexts).toContain('Fecha');
    expect(headerTexts).toContain('Número');
    expect(headerTexts).toContain('Tipo');
    expect(headerTexts).toContain('Descripción');
    expect(headerTexts).toContain('Usuario');
  });

  it('debe renderizar badges de tipo con colores correctos', async () => {
    fetchMovementsSpy.mockResolvedValueOnce(mockMovements);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // entrada → success, salida → danger, ajuste → warning, transferencia → info
    expect(container.innerHTML).toContain('bg-success');
    expect(container.innerHTML).toContain('bg-danger');
    expect(container.innerHTML).toContain('bg-warning');
    expect(container.innerHTML).toContain('bg-info');
  });

  it('debe formatear la fecha en formato español (es-CO)', async () => {
    fetchMovementsSpy.mockResolvedValueOnce([mockMovements[0]]);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // La fecha '2024-03-31T14:30:00Z' debe aparecer formateada (el formato exacto
    // depende del locale de jsdom, pero al menos no debe aparecer como ISO 8601)
    expect(container.innerHTML).not.toContain('2024-03-31T14:30:00Z');
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    fetchMovementsSpy.mockReturnValueOnce(new Promise(vi.fn()));

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando movimientos');
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  it('debe mostrar estado vacío cuando no hay movimientos', async () => {
    fetchMovementsSpy.mockResolvedValueOnce([]);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.ngr-empty-state')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Sin movimientos recientes');
    // Con DataTable el wrapper siempre existe, pero no hay filas de datos
    const dataRows = container.querySelectorAll('tbody tr td:not([colspan])');
    expect(dataRows.length).toBe(0);
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar alerta de error con botón de reintento cuando fetchMovements falla', async () => {
    fetchMovementsSpy.mockRejectedValueOnce(new Error('Error 500: Internal Server Error'));

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#movements-retry-btn')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('alert-danger');
    expect(container.innerHTML).toContain('Error al cargar los movimientos');
    expect(container.querySelector('#movements-retry-btn')).not.toBeNull();
  });

  it('debe reintentar la carga al hacer clic en el botón de reintento', async () => {
    fetchMovementsSpy
      .mockRejectedValueOnce(new Error('Error 500'))
      .mockResolvedValueOnce(mockMovements);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#movements-retry-btn')).not.toBeNull();
    });

    container.querySelector<HTMLButtonElement>('#movements-retry-btn')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    expect(fetchMovementsSpy).toHaveBeenCalledTimes(2);
  });

  it('no debe mostrar error cuando la señal es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    fetchMovementsSpy.mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    renderMovementsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(fetchMovementsSpy).toHaveBeenCalledOnce();
    });

    // No debe mostrar error — AbortError se suprime silenciosamente
    expect(container.innerHTML).not.toContain('alert-danger');
  });
});
