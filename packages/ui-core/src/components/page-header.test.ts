import { describe, it, expect } from 'vitest';

import { render, init } from './page-header';

// Tests del componente PageHeader
describe('PageHeader — render()', () => {
  it('debe usar la etiqueta <header> semántica', () => {
    const html = render({ title: 'Productos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('header')).not.toBeNull();
  });

  it('debe aplicar la clase ngr-page-header al encabezado', () => {
    const html = render({ title: 'Inventario' });
    expect(html).toContain('ngr-page-header');
  });

  it('debe renderizar el título en un elemento h1', () => {
    const html = render({ title: 'Lista de Productos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const h1 = el.querySelector('h1');
    expect(h1?.textContent).toBe('Lista de Productos');
  });

  it('debe incluir el subtítulo cuando se proporciona', () => {
    const html = render({ title: 'Productos', subtitle: 'Gestión del catálogo' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const subtitle = el.querySelector('.text-muted');
    expect(subtitle?.textContent).toBe('Gestión del catálogo');
  });

  it('no debe incluir subtítulo cuando no se proporciona', () => {
    const html = render({ title: 'Productos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.text-muted')).toBeNull();
  });

  it('debe incluir el slot de acciones cuando se proporciona', () => {
    const html = render({ title: 'Productos', actions: '<button>Nuevo</button>' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const actions = el.querySelector('.ngr-page-header-actions');
    expect(actions).not.toBeNull();
    expect(actions?.innerHTML).toContain('Nuevo');
  });

  it('no debe incluir el slot de acciones cuando no se proporciona', () => {
    const html = render({ title: 'Productos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.ngr-page-header-actions')).toBeNull();
  });

  it('debe incluir breadcrumb cuando se proporciona', () => {
    const html = render({
      title: 'Detalles',
      breadcrumb: '<ol class="breadcrumb"><li class="breadcrumb-item">Inicio</li></ol>',
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('nav[aria-label="breadcrumb"]')).not.toBeNull();
  });
});

describe('PageHeader — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ title: 'Test' });
    expect(() => {
      init(root);
    }).not.toThrow();
  });
});
