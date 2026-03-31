import { describe, it, expect } from 'vitest';
import { render, init } from './spinner';

// Tests del componente Spinner
describe('Spinner — render()', () => {
  it('debe incluir role="status" para accesibilidad', () => {
    const html = render({});
    const el = document.createElement('div');
    el.innerHTML = html;
    const spinner = el.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();
  });

  it('debe incluir el label visually-hidden por defecto "Cargando..."', () => {
    const html = render({});
    const el = document.createElement('div');
    el.innerHTML = html;
    const hidden = el.querySelector('.visually-hidden');
    expect(hidden?.textContent).toBe('Cargando...');
  });

  it('debe usar el label personalizado cuando se proporciona', () => {
    const html = render({ label: 'Procesando...' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const hidden = el.querySelector('.visually-hidden');
    expect(hidden?.textContent).toBe('Procesando...');
  });

  it('debe aplicar la clase text-{variant} según la variante', () => {
    const html = render({ variant: 'danger' });
    expect(html).toContain('text-danger');
  });

  it('debe aplicar spinner-border-sm para size="sm"', () => {
    const html = render({ size: 'sm' });
    expect(html).toContain('spinner-border-sm');
  });

  it('debe aplicar estilo inline de 3rem para size="lg"', () => {
    const html = render({ size: 'lg' });
    expect(html).toContain('3rem');
  });

  it('debe usar variante "primary" por defecto', () => {
    const html = render({});
    expect(html).toContain('text-primary');
  });
});

describe('Spinner — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({});
    expect(() => init(root)).not.toThrow();
  });
});
