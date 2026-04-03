import { describe, it, expect } from 'vitest';

import { render } from '../patterns/form-field';

// Tests del patrón FormField
describe('FormField — render()', () => {
  it('debe renderizar un input con el nombre y tipo especificados', () => {
    const html = render({ label: 'Nombre', name: 'nombre' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input[name="nombre"]');
    expect(input).not.toBeNull();
    expect(input?.getAttribute('type')).toBe('text');
  });

  it('debe renderizar la etiqueta con for apuntando al id del input', () => {
    const html = render({ label: 'Producto', name: 'producto' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const label = el.querySelector('label');
    expect(label?.getAttribute('for')).toBe('producto');
  });

  it('debe agregar clase is-invalid y aria-invalid cuando hay error', () => {
    const html = render({ label: 'Stock', name: 'stock', error: 'Campo requerido' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input');
    expect(input?.classList.contains('is-invalid')).toBe(true);
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });

  it('debe mostrar el mensaje de error en invalid-feedback', () => {
    const html = render({ label: 'Stock', name: 'stock', error: 'Valor inválido' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const feedback = el.querySelector('.invalid-feedback');
    expect(feedback?.textContent).toContain('Valor inválido');
  });

  it('debe incluir aria-describedby apuntando al error', () => {
    const html = render({ label: 'Stock', name: 'stock', error: 'Error' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toContain('stock-error');
  });

  it('debe incluir aria-describedby apuntando al helper text', () => {
    const html = render({
      label: 'Stock',
      name: 'stock',
      helperText: 'Ingrese un número positivo',
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input');
    expect(input?.getAttribute('aria-describedby')).toContain('stock-helper');
  });

  it('debe mostrar el helper text con el id correcto', () => {
    const html = render({ label: 'Precio', name: 'precio', helperText: 'En pesos argentinos' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const helper = el.querySelector('#precio-helper');
    expect(helper?.textContent).toContain('En pesos argentinos');
  });

  it('debe incluir required y aria-required cuando required es true', () => {
    const html = render({ label: 'Nombre', name: 'nombre', required: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input');
    expect(input?.hasAttribute('required')).toBe(true);
    expect(input?.getAttribute('aria-required')).toBe('true');
  });

  it('debe incluir disabled cuando disabled es true', () => {
    const html = render({ label: 'Código', name: 'codigo', disabled: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    const input = el.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  it('no debe incluir aria-describedby si no hay helper ni error', () => {
    const html = render({ label: 'Simple', name: 'simple' });
    expect(html).not.toContain('aria-describedby');
  });
});
