import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

import * as authServiceModule from '../../../services/authService';
import * as dashboardService from '../dashboardService';
import type { DashboardAlert } from '../types';

import { renderAlertsPanel } from './alertsPanel';

// Tests del widget alertsPanel.
// Se mockean dashboardService y authService para aislar el comportamiento del widget.

// Fixture de datos de prueba
const mockAlerts: DashboardAlert[] = [
  {
    id: 'alert-001',
    tipo: 'bajo-stock',
    severity: 'warning',
    titulo: 'Stock bajo en Bodega Norte',
    descripcion: '3 productos por debajo del mínimo',
    enlace: '#/stock',
  },
  {
    id: 'alert-002',
    tipo: 'orden-pendiente',
    severity: 'info',
    titulo: 'Orden de compra pendiente',
    descripcion: 'OC-2024-089 sin aprobar hace 3 días',
  },
  {
    id: 'alert-003',
    tipo: 'conteo-vencido',
    severity: 'danger',
    titulo: 'Conteo cíclico vencido',
    descripcion: 'Zona A sin conteo hace 30 días',
    enlace: '#/conteos',
  },
];

describe('alertsPanel.ts', () => {
  let container: HTMLElement;
  let fetchAlertsSpy: MockInstance;

  beforeEach(() => {
    container = document.createElement('div');
    fetchAlertsSpy = vi.spyOn(dashboardService, 'fetchAlerts');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restaurar display por si fue ocultado
    container.style.display = '';
  });

  // ── Caso exitoso ─────────────────────────────────────────────────────────────

  it('debe renderizar la lista de alertas para el rol admin', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockResolvedValueOnce(mockAlerts);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    // Primero debe mostrar el spinner
    expect(container.innerHTML).toContain('spinner-border');

    await vi.waitFor(() => {
      expect(container.querySelector('.list-group')).not.toBeNull();
    });

    const items = container.querySelectorAll('.list-group-item');
    expect(items.length).toBe(mockAlerts.length);
    expect(container.innerHTML).toContain('Stock bajo en Bodega Norte');
    expect(container.innerHTML).toContain('Orden de compra pendiente');
    expect(container.innerHTML).toContain('Conteo cíclico vencido');
  });

  it('debe renderizar alertas para el rol operador', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('operador');
    fetchAlertsSpy.mockResolvedValueOnce(mockAlerts);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.list-group')).not.toBeNull();
    });

    expect(container.querySelectorAll('.list-group-item').length).toBe(3);
  });

  it('debe incluir el enlace cuando la alerta tiene un campo enlace', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockResolvedValueOnce([mockAlerts[0]]);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.list-group')).not.toBeNull();
    });

    const link = container.querySelector<HTMLAnchorElement>('a[href="#/stock"]');
    expect(link).not.toBeNull();
  });

  it('debe mostrar los badges de severidad correctos', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockResolvedValueOnce(mockAlerts);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.list-group')).not.toBeNull();
    });

    // Verificar presencia de badges por severidad
    expect(container.innerHTML).toContain('bg-warning');
    expect(container.innerHTML).toContain('bg-info');
    expect(container.innerHTML).toContain('bg-danger');
  });

  // ── Ocultar para rol consulta ─────────────────────────────────────────────────

  it('debe ocultar el contenedor para el rol consulta', () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('consulta');
    fetchAlertsSpy.mockResolvedValueOnce(mockAlerts);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    // El contenedor debe ocultarse inmediatamente sin llamar al servicio
    expect(container.style.display).toBe('none');
    expect(fetchAlertsSpy).not.toHaveBeenCalled();
  });

  it('no debe renderizar contenido para el rol consulta', () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('consulta');

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    // El contenedor debe estar vacío — no se renderizó nada
    expect(container.innerHTML).toBe('');
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  it('debe mostrar estado vacío cuando no hay alertas activas', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockResolvedValueOnce([]);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('.ngr-empty-state')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Sin alertas activas');
    expect(container.querySelector('.list-group')).toBeNull();
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar alerta de error con botón de reintento cuando fetchAlerts falla', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockRejectedValueOnce(new Error('Error 503: Service Unavailable'));

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#alerts-retry-btn')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('alert-danger');
    expect(container.innerHTML).toContain('Error al cargar las alertas');
    expect(container.querySelector('#alerts-retry-btn')).not.toBeNull();
  });

  it('debe reintentar la carga al hacer clic en el botón de reintento', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    fetchAlertsSpy.mockRejectedValueOnce(new Error('Error 503')).mockResolvedValueOnce(mockAlerts);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(container.querySelector('#alerts-retry-btn')).not.toBeNull();
    });

    container.querySelector<HTMLButtonElement>('#alerts-retry-btn')?.click();

    await vi.waitFor(() => {
      expect(container.querySelector('.list-group')).not.toBeNull();
    });

    expect(fetchAlertsSpy).toHaveBeenCalledTimes(2);
  });

  it('no debe mostrar error cuando la señal es abortada', async () => {
    vi.spyOn(authServiceModule.authService, 'getProfile').mockReturnValue('admin');
    const abortError = new DOMException('Cancelado', 'AbortError');
    fetchAlertsSpy.mockRejectedValueOnce(abortError);

    const controller = new AbortController();
    renderAlertsPanel(container, controller.signal);

    await vi.waitFor(() => {
      expect(fetchAlertsSpy).toHaveBeenCalledOnce();
    });

    // No debe mostrar error — AbortError se suprime silenciosamente
    expect(container.innerHTML).not.toContain('alert-danger');
  });
});
