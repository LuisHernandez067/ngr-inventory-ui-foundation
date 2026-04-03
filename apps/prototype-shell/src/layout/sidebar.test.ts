import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { render, setActive, init, NAV_ITEMS } from './sidebar';

// Tests del módulo de sidebar — render agrupado, active-link y eventos
describe('sidebar.ts', () => {
  beforeEach(() => {
    // Preparar DOM base
    document.body.innerHTML = '<div id="layout-root"></div>';
  });

  afterEach(() => {
    // Limpiar listeners globales
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  describe('NAV_ITEMS', () => {
    it('debe tener exactamente 15 ítems de navegación', () => {
      expect(NAV_ITEMS).toHaveLength(15);
    });

    it('debe incluir Dashboard en el grupo top', () => {
      const dashboard = NAV_ITEMS.find((item) => item.id === 'dashboard');
      expect(dashboard).toBeDefined();
      expect(dashboard?.group).toBe('top');
      expect(dashboard?.hash).toBe('#/');
    });

    it('debe incluir todos los módulos del grupo inventario', () => {
      const inventario = NAV_ITEMS.filter((item) => item.group === 'inventario');
      expect(inventario).toHaveLength(5);
      const ids = inventario.map((item) => item.id);
      expect(ids).toContain('productos');
      expect(ids).toContain('categorias');
      expect(ids).toContain('proveedores');
      expect(ids).toContain('almacenes');
      expect(ids).toContain('ubicaciones');
    });

    it('debe incluir todos los módulos del grupo movimientos', () => {
      const movimientos = NAV_ITEMS.filter((item) => item.group === 'movimientos');
      expect(movimientos).toHaveLength(4);
      const ids = movimientos.map((item) => item.id);
      expect(ids).toContain('movimientos');
      expect(ids).toContain('stock');
      expect(ids).toContain('kardex');
      expect(ids).toContain('conteos');
    });

    it('debe incluir todos los módulos del grupo administracion', () => {
      const admin = NAV_ITEMS.filter((item) => item.group === 'administracion');
      expect(admin).toHaveLength(4);
      const ids = admin.map((item) => item.id);
      expect(ids).toContain('usuarios');
      expect(ids).toContain('roles');
      expect(ids).toContain('reportes');
      expect(ids).toContain('auditoria');
    });

    it('debe incluir el ítem auth', () => {
      const auth = NAV_ITEMS.find((item) => item.id === 'auth');
      expect(auth).toBeDefined();
      expect(auth?.hash).toBe('#/auth');
    });
  });

  describe('render()', () => {
    it('debe retornar un string HTML no vacío', () => {
      const html = render();
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });

    it('debe incluir el elemento aside#sidebar', () => {
      const html = render();
      expect(html).toContain('id="sidebar"');
      expect(html).toContain('<aside');
    });

    it('debe incluir las clases offcanvas-lg y offcanvas-start', () => {
      const html = render();
      expect(html).toContain('offcanvas-lg');
      expect(html).toContain('offcanvas-start');
    });

    it('debe incluir el grupo Inventario con sus ítems', () => {
      const html = render();
      expect(html).toContain('Inventario');
      expect(html).toContain('Productos');
      expect(html).toContain('Categorías');
    });

    it('debe incluir el grupo Movimientos', () => {
      const html = render();
      expect(html).toContain('Movimientos');
      expect(html).toContain('Stock');
      expect(html).toContain('Kardex');
    });

    it('debe incluir el grupo Administración', () => {
      const html = render();
      expect(html).toContain('Administración');
      expect(html).toContain('Usuarios');
      expect(html).toContain('Auditoría');
    });

    it('debe incluir atributos data-hash en los enlaces', () => {
      const html = render();
      expect(html).toContain('data-hash="#/productos"');
      expect(html).toContain('data-hash="#/stock"');
    });

    it('debe incluir el encabezado del offcanvas para mobile', () => {
      const html = render();
      expect(html).toContain('offcanvas-header');
      expect(html).toContain('d-lg-none');
    });
  });

  describe('setActive(hash)', () => {
    beforeEach(() => {
      // Montar el sidebar en el DOM para probar setActive
      document.body.innerHTML = render();
    });

    it('debe añadir la clase active al enlace que coincide con el hash', () => {
      setActive('#/productos');
      const link = document.querySelector<HTMLAnchorElement>('[data-hash="#/productos"]');
      expect(link?.classList.contains('active')).toBe(true);
    });

    it('debe añadir aria-current="page" al enlace activo', () => {
      setActive('#/stock');
      const link = document.querySelector<HTMLAnchorElement>('[data-hash="#/stock"]');
      expect(link?.getAttribute('aria-current')).toBe('page');
    });

    it('debe quitar la clase active de los demás enlaces', () => {
      // Primero activar productos
      setActive('#/productos');
      // Luego activar stock
      setActive('#/stock');

      const productosLink = document.querySelector<HTMLAnchorElement>('[data-hash="#/productos"]');
      const stockLink = document.querySelector<HTMLAnchorElement>('[data-hash="#/stock"]');

      expect(productosLink?.classList.contains('active')).toBe(false);
      expect(stockLink?.classList.contains('active')).toBe(true);
    });

    it('debe activar el enlace de Dashboard con hash vacío', () => {
      setActive('#/');
      const dashboardLink = document.querySelector<HTMLAnchorElement>('[data-hash="#/"]');
      expect(dashboardLink?.classList.contains('active')).toBe(true);
    });

    it('debe quitar aria-current de enlaces inactivos', () => {
      setActive('#/kardex');
      // Ahora cambiar a otro
      setActive('#/usuarios');

      const kardexLink = document.querySelector<HTMLAnchorElement>('[data-hash="#/kardex"]');
      expect(kardexLink?.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('init(root)', () => {
    it('debe reaccionar al evento hashchange actualizando el enlace activo', async () => {
      document.body.innerHTML = render();
      const root = document.body;
      init(root);

      // Simular cambio de hash
      window.location.hash = '#/proveedores';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      // Esperar al siguiente tick
      await new Promise((resolve) => setTimeout(resolve, 0));

      const link = document.querySelector<HTMLAnchorElement>('[data-hash="#/proveedores"]');
      expect(link?.classList.contains('active')).toBe(true);
    });
  });
});
