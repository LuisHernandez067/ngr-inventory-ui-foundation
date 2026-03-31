import { describe, it, expect, vi } from 'vitest';
import { render, init } from './empty-state';

// Tests del componente EmptyState
describe('EmptyState — render()', () => {
  it('debe aplicar la clase ngr-empty-state y text-center', () => {
    const html = render({ icon: 'inbox', title: 'Sin datos' });
    expect(html).toContain('ngr-empty-state');
    expect(html).toContain('text-center');
  });

  it('debe incluir el ícono Bootstrap con display-1 text-muted', () => {
    const html = render({ icon: 'inbox', title: 'Sin datos' });
    expect(html).toContain('bi-inbox');
    expect(html).toContain('display-1');
    expect(html).toContain('text-muted');
  });

  it('debe incluir el título en un h3', () => {
    const html = render({ icon: 'inbox', title: 'No hay productos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const h3 = el.querySelector('h3');
    expect(h3?.textContent).toBe('No hay productos');
  });

  it('debe incluir la descripción cuando se proporciona', () => {
    const html = render({
      icon: 'inbox',
      title: 'Vacío',
      description: 'Agrega tu primer producto',
    });
    expect(html).toContain('Agrega tu primer producto');
  });

  it('no debe incluir descripción cuando no se proporciona', () => {
    const html = render({ icon: 'inbox', title: 'Vacío' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('p.text-muted')).toBeNull();
  });

  it('debe incluir el botón CTA cuando ctaLabel se proporciona', () => {
    const html = render({ icon: 'inbox', title: 'Vacío', ctaLabel: 'Agregar producto' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('button')).not.toBeNull();
    expect(el.querySelector('button')?.textContent).toContain('Agregar producto');
  });

  it('no debe incluir botón CTA cuando ctaLabel no se proporciona', () => {
    const html = render({ icon: 'inbox', title: 'Vacío' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('button')).toBeNull();
  });
});

describe('EmptyState — init()', () => {
  it('debe emitir ngr:action al hacer clic en el CTA', () => {
    const root = document.createElement('div');
    root.innerHTML = render({
      icon: 'inbox',
      title: 'Vacío',
      ctaLabel: 'Agregar',
      ctaAction: 'add-item',
    });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:action', spy);

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail.action).toBe('add-item');

    document.body.removeChild(root);
  });

  it('debe ejecutarse sin errores cuando no hay CTA', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ icon: 'inbox', title: 'Vacío' });
    expect(() => init(root)).not.toThrow();
  });
});
