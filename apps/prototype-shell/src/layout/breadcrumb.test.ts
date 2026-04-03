import { describe, it, expect, beforeEach } from 'vitest';

import { render as renderBreadcrumb, update } from './breadcrumb';
import { render as renderSidebar, init as initSidebar } from './sidebar';

import { initLayout } from './index';

// Tests del módulo breadcrumb — actualización de ruta según hash
describe('breadcrumb.ts', () => {
  describe('render()', () => {
    it('debe retornar un string HTML con el contenedor del breadcrumb', () => {
      const html = renderBreadcrumb();
      expect(typeof html).toBe('string');
      expect(html).toContain('id="breadcrumb-list"');
    });

    it('debe mostrar Dashboard como ítem inicial activo', () => {
      const html = renderBreadcrumb();
      expect(html).toContain('Dashboard');
      expect(html).toContain('aria-current="page"');
    });
  });

  describe('update(hash)', () => {
    // Referencia al contenedor del breadcrumb, resuelto en beforeEach
    let breadcrumb: HTMLElement;

    beforeEach(() => {
      // Montar el breadcrumb en el DOM
      document.body.innerHTML = renderBreadcrumb();
      const el = document.getElementById('breadcrumb-list');
      if (!el) throw new Error('breadcrumb-list no encontrado en el DOM');
      breadcrumb = el;
    });

    it('debe actualizar el breadcrumb a la etiqueta del módulo activo', () => {
      update('#/stock');
      expect(breadcrumb.textContent.trim()).toBe('Stock');
    });

    it('debe mostrar Dashboard con hash vacío', () => {
      update('#/');
      expect(breadcrumb.textContent.trim()).toBe('Dashboard');
    });

    it('debe mostrar el label correcto para Productos', () => {
      update('#/productos');
      expect(breadcrumb.textContent.trim()).toBe('Productos');
    });

    it('debe mostrar el label correcto para Auditoría', () => {
      update('#/auditoria');
      expect(breadcrumb.textContent.trim()).toBe('Auditoría');
    });

    it('debe mantener aria-current="page" en el ítem activo', () => {
      update('#/kardex');
      const activeItem = document.querySelector('[aria-current="page"]');
      expect(activeItem).not.toBeNull();
      if (!activeItem) throw new Error('Elemento aria-current="page" no encontrado');
      expect(activeItem.textContent.trim()).toBe('Kardex');
    });

    it('debe mostrar Dashboard si el hash no corresponde a ningún módulo', () => {
      update('#/ruta-inexistente');
      expect(breadcrumb.textContent.trim()).toBe('Dashboard');
    });
  });
});

// Tests del orquestador de layout — ensamblaje del shell y landmarks
describe('layout/index.ts — initLayout()', () => {
  let appElement: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    // Limpiar hash
    window.location.hash = '';
    const el = document.getElementById('app');
    if (!el) throw new Error('Elemento #app no encontrado en el DOM');
    appElement = el;
  });

  it('debe montar el shell completo en el elemento #app', () => {
    initLayout(appElement);
    expect(appElement.innerHTML.length).toBeGreaterThan(0);
  });

  it('debe incluir el landmark <nav> del navbar', () => {
    initLayout(appElement);
    const navbar = appElement.querySelector('nav.navbar');
    expect(navbar).not.toBeNull();
  });

  it('debe incluir el landmark <aside> del sidebar', () => {
    initLayout(appElement);
    const sidebar = appElement.querySelector('aside#sidebar');
    expect(sidebar).not.toBeNull();
  });

  it('debe incluir el landmark <main> del área de contenido', () => {
    initLayout(appElement);
    const main = appElement.querySelector('main#main-content');
    expect(main).not.toBeNull();
  });

  it('debe incluir el target del skip-link: id="main-content"', () => {
    initLayout(appElement);
    const mainContent = appElement.querySelector('#main-content');
    expect(mainContent).not.toBeNull();
  });

  it('debe incluir el contenedor #page-content para el contenido de cada módulo', () => {
    initLayout(appElement);
    const pageContent = appElement.querySelector('#page-content');
    expect(pageContent).not.toBeNull();
  });

  it('debe incluir el footer del layout', () => {
    initLayout(appElement);
    const footer = appElement.querySelector('footer.layout-footer');
    expect(footer).not.toBeNull();
  });

  it('debe incluir el breadcrumb con id="breadcrumb-list"', () => {
    initLayout(appElement);
    const breadcrumb = appElement.querySelector('#breadcrumb-list');
    expect(breadcrumb).not.toBeNull();
  });

  it('debe incluir el botón de cambio de tema', () => {
    initLayout(appElement);
    const themeSwitcher = appElement.querySelector('#theme-switcher');
    expect(themeSwitcher).not.toBeNull();
  });
});

// Tests de integración sidebar — asegurar que el sidebar usa el root correcto
describe('sidebar.ts — init con DOM real', () => {
  it('debe inicializar sin errores con un root válido', () => {
    document.body.innerHTML = renderSidebar();
    expect(() => {
      initSidebar(document.body);
    }).not.toThrow();
  });
});
