import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import * as authServiceModule from '../../../services/authService';

import { renderQuickAccess, QUICK_ACCESS_CONFIG } from './quickAccess';

// Tests del widget quickAccess.
// Se mockea authService para probar el filtrado por módulos permitidos.

describe('quickAccess.ts', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Verificar config interna ──────────────────────────────────────────────────

  it('debe tener una configuración curada con al menos 5 atajos', () => {
    expect(QUICK_ACCESS_CONFIG.length).toBeGreaterThanOrEqual(5);
    // Verificar estructura de cada item
    for (const item of QUICK_ACCESS_CONFIG) {
      expect(item.key).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.route).toMatch(/^#\//);
    }
  });

  // ── Filtrado por módulos permitidos ───────────────────────────────────────────

  it('debe mostrar todos los atajos cuando el perfil es admin (access: all)', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue('all');

    renderQuickAccess(container);

    const buttons = container.querySelectorAll('a');
    expect(buttons.length).toBe(QUICK_ACCESS_CONFIG.length);
  });

  it('debe filtrar atajos según los módulos permitidos para el perfil operador', () => {
    const allowedModules = ['productos', 'movimientos', 'stock', 'almacenes'];
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue(allowedModules);

    renderQuickAccess(container);

    const buttons = container.querySelectorAll('a');
    expect(buttons.length).toBe(allowedModules.length);

    // Verificar que solo aparecen los módulos permitidos
    const hrefs = Array.from(buttons).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('#/productos');
    expect(hrefs).toContain('#/movimientos');
    expect(hrefs).toContain('#/stock');
    expect(hrefs).toContain('#/almacenes');
    expect(hrefs).not.toContain('#/usuarios');
    expect(hrefs).not.toContain('#/roles');
  });

  it('debe filtrar atajos para el perfil consulta (productos, stock, reportes)', () => {
    const allowedModules = ['productos', 'stock', 'reportes'];
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue(allowedModules);

    renderQuickAccess(container);

    const buttons = container.querySelectorAll('a');
    expect(buttons.length).toBe(3);

    const hrefs = Array.from(buttons).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('#/productos');
    expect(hrefs).toContain('#/stock');
    expect(hrefs).toContain('#/reportes');
  });

  it('debe renderizar los links con las rutas hash correctas', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue([
      'productos',
      'movimientos',
    ]);

    renderQuickAccess(container);

    const linkProductos = container.querySelector<HTMLAnchorElement>('a[href="#/productos"]');
    const linkMovimientos = container.querySelector<HTMLAnchorElement>('a[href="#/movimientos"]');

    expect(linkProductos).not.toBeNull();
    expect(linkMovimientos).not.toBeNull();
  });

  it('debe renderizar los íconos Bootstrap Icons en cada botón', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue(['productos']);

    renderQuickAccess(container);

    const link = container.querySelector('a');
    expect(link?.innerHTML).toContain('bi-box-seam');
  });

  it('debe renderizar las etiquetas en español', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue([
      'productos',
      'movimientos',
      'stock',
    ]);

    renderQuickAccess(container);

    expect(container.innerHTML).toContain('Productos');
    expect(container.innerHTML).toContain('Movimientos');
    expect(container.innerHTML).toContain('Stock');
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────────

  it('debe mostrar mensaje de sin accesos cuando el arreglo de módulos está vacío', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue([]);

    renderQuickAccess(container);

    expect(container.innerHTML).toContain('Sin accesos rápidos disponibles');
    expect(container.querySelector('a')).toBeNull();
  });

  it('debe mostrar mensaje de sin accesos cuando ningún key coincide con los permitidos', () => {
    // Módulo que no existe en QUICK_ACCESS_CONFIG
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue([
      'modulo-inexistente',
    ]);

    renderQuickAccess(container);

    expect(container.innerHTML).toContain('Sin accesos rápidos disponibles');
    expect(container.querySelector('a')).toBeNull();
  });

  // ── Verificar que no hace fetch ───────────────────────────────────────────────

  it('debe renderizar de forma síncrona sin necesitar AbortSignal', () => {
    vi.spyOn(authServiceModule.authService, 'getAllowedModules').mockReturnValue(['productos']);

    // renderQuickAccess no acepta signal — es síncrono
    renderQuickAccess(container);

    // El resultado debe estar disponible inmediatamente
    expect(container.querySelector('a')).not.toBeNull();
  });
});
