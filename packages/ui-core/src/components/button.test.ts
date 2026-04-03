import { describe, it, expect, vi } from 'vitest';

import { render, init } from './button';

// Tests del componente Button
describe('Button — render()', () => {
  it('debe renderizar un botón con la clase btn y la variante correcta', () => {
    const html = render({ variant: 'primary', label: 'Guardar' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const btn = el.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn?.className).toContain('btn-primary');
  });

  it('debe usar type="button" por defecto', () => {
    const html = render({ variant: 'secondary', label: 'Cancelar' });
    expect(html).toContain('type="button"');
  });

  it('debe aplicar btn-sm para size="sm"', () => {
    const html = render({ variant: 'primary', label: 'Pequeño', size: 'sm' });
    expect(html).toContain('btn-sm');
  });

  it('debe aplicar btn-lg para size="lg"', () => {
    const html = render({ variant: 'primary', label: 'Grande', size: 'lg' });
    expect(html).toContain('btn-lg');
  });

  it('debe mapear la variante ghost a btn-outline-secondary', () => {
    const html = render({ variant: 'ghost', label: 'Ghost' });
    expect(html).toContain('btn-outline-secondary');
  });

  it('debe incluir el ícono al inicio por defecto cuando se proporciona', () => {
    const html = render({ variant: 'primary', label: 'Editar', icon: 'pencil' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const icon = el.querySelector('i.bi.bi-pencil');
    expect(icon).not.toBeNull();
    // El ícono debe aparecer antes del texto
    const btn = el.querySelector('button');
    const children = Array.from(btn?.childNodes ?? []);
    const iconIndex = children.findIndex((n) => n.nodeType === 1 && (n as Element).tagName === 'I');
    expect(iconIndex).toBe(0);
  });

  it('debe incluir el ícono al final cuando iconPosition es "end"', () => {
    const html = render({
      variant: 'primary',
      label: 'Siguiente',
      icon: 'arrow-right',
      iconPosition: 'end',
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    const btn = el.querySelector('button');
    const children = Array.from(btn?.childNodes ?? []).filter((n) => n.nodeType === 1);
    // El último elemento hijo es el ícono
    const lastElement = children[children.length - 1] as Element;
    expect(lastElement.tagName).toBe('I');
  });

  it('debe mostrar spinner y estar deshabilitado en estado loading', () => {
    const html = render({ variant: 'primary', label: 'Guardando', loading: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    const btn = el.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBe(true);
    expect(btn?.getAttribute('aria-disabled')).toBe('true');
    expect(el.querySelector('.spinner-border')).not.toBeNull();
  });

  it('debe estar deshabilitado con aria-disabled cuando disabled es true', () => {
    const html = render({ variant: 'danger', label: 'Eliminar', disabled: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    const btn = el.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBe(true);
    expect(btn?.getAttribute('aria-disabled')).toBe('true');
  });

  it('debe incluir data-action cuando se proporciona', () => {
    const html = render({ variant: 'primary', label: 'Acción', dataAction: 'guardar' });
    expect(html).toContain('data-action="guardar"');
  });
});

describe('Button — init()', () => {
  it('debe emitir el CustomEvent ngr:action al hacer clic en un botón con data-action', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ variant: 'primary', label: 'Test', dataAction: 'test-action' });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:action', spy);

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    expect(spy).toHaveBeenCalledOnce();
    const event = spy.mock.calls[0]?.[0] as CustomEvent<{ action: string }>;
    expect(event.detail.action).toBe('test-action');

    document.body.removeChild(root);
  });

  it('no debe emitir ngr:action si el botón está deshabilitado', () => {
    const root = document.createElement('div');
    root.innerHTML = render({
      variant: 'primary',
      label: 'Disabled',
      dataAction: 'no-action',
      disabled: true,
    });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:action', spy);

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    expect(spy).not.toHaveBeenCalled();

    document.body.removeChild(root);
  });
});
