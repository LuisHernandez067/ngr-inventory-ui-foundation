import { describe, it, expect } from 'vitest';
import { render, init } from './card';

// Tests del componente Card
describe('Card — render()', () => {
  it('debe renderizar un div con clase card', () => {
    const html = render({}, '<p>Contenido</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.card')).not.toBeNull();
  });

  it('debe incluir el contenido del cuerpo en card-body', () => {
    const html = render({}, '<p>Contenido del cuerpo</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    const body = el.querySelector('.card-body');
    expect(body?.innerHTML).toContain('Contenido del cuerpo');
  });

  it('debe incluir card-header con el título cuando se proporciona', () => {
    const html = render({ title: 'Mi Tarjeta' }, '<p>Cuerpo</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.card-header')).not.toBeNull();
    expect(el.querySelector('.card-header')?.textContent).toContain('Mi Tarjeta');
  });

  it('no debe incluir card-header cuando no hay título ni acciones', () => {
    const html = render({}, '<p>Sin header</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.card-header')).toBeNull();
  });

  it('debe incluir card-footer con el HTML del footer cuando se proporciona', () => {
    const html = render({ footer: '<button>Aceptar</button>' }, '<p>Cuerpo</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    const footer = el.querySelector('.card-footer');
    expect(footer).not.toBeNull();
    expect(footer?.innerHTML).toContain('Aceptar');
  });

  it('no debe incluir card-footer cuando no se proporciona', () => {
    const html = render({}, '<p>Sin footer</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.card-footer')).toBeNull();
  });

  it('debe aplicar bodyClass al div card-body', () => {
    const html = render({ bodyClass: 'p-0' }, '<p>Cuerpo</p>');
    const el = document.createElement('div');
    el.innerHTML = html;
    const body = el.querySelector('.card-body');
    expect(body?.className).toContain('p-0');
  });

  it('debe incluir headerActions en el encabezado cuando se proporciona', () => {
    const html = render(
      { title: 'Título', headerActions: '<button>Editar</button>' },
      '<p>Cuerpo</p>'
    );
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.card-header-actions')).not.toBeNull();
  });
});

describe('Card — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ title: 'Test' }, '<p>Cuerpo</p>');
    expect(() => init(root)).not.toThrow();
  });
});
