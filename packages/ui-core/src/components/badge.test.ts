import { describe, it, expect } from 'vitest';

import { render, init } from './badge';

// Tests del componente Badge
describe('Badge — render()', () => {
  it('debe renderizar el texto en un span con clase badge', () => {
    const html = render({ variant: 'primary', text: 'Activo' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const badge = el.querySelector('.badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('Activo');
  });

  it('debe aplicar la clase bg-{variant} según la variante', () => {
    const html = render({ variant: 'success', text: 'OK' });
    expect(html).toContain('bg-success');
  });

  it('debe aplicar rounded-pill cuando pill es true', () => {
    const html = render({ variant: 'info', text: 'Info', pill: true });
    expect(html).toContain('rounded-pill');
  });

  it('debe aplicar ngr-badge-dot cuando dot es true', () => {
    const html = render({ variant: 'danger', text: 'ignore', dot: true });
    expect(html).toContain('ngr-badge-dot');
  });

  it('no debe mostrar el texto en modo dot', () => {
    const html = render({ variant: 'warning', text: 'ignorado', dot: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    const badge = el.querySelector('.badge');
    // El contenido es &nbsp; en modo dot, no el texto original
    expect(badge?.textContent).not.toBe('ignorado');
  });

  it('debe aplicar clases adicionales con className', () => {
    const html = render({ variant: 'secondary', text: 'Extra', className: 'ms-2' });
    expect(html).toContain('ms-2');
  });
});

describe('Badge — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ variant: 'primary', text: 'Test' });
    expect(() => {
      init(root);
    }).not.toThrow();
  });
});
