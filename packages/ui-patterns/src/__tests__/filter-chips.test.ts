import { describe, it, expect, vi } from 'vitest';

import { render, init } from '../patterns/filter-chips';

// Tests del patrón FilterChips
describe('FilterChips — render()', () => {
  it('debe renderizar un chip por cada filtro', () => {
    const html = render({
      filters: [
        { key: 'categoria', label: 'Categoría', value: 'Electrónica' },
        { key: 'estado', label: 'Estado', value: 'activo' },
      ],
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    // Debe haber dos botones de cierre
    expect(el.querySelectorAll('[data-action="remove-filter"]')).toHaveLength(2);
  });

  it('debe incluir data-key y data-value en cada botón de cierre', () => {
    const html = render({
      filters: [{ key: 'estado', label: 'Estado', value: 'activo' }],
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    const btn = el.querySelector('[data-action="remove-filter"]');
    expect(btn?.getAttribute('data-key')).toBe('estado');
    expect(btn?.getAttribute('data-value')).toBe('activo');
  });

  it('debe retornar string vacío cuando no hay filtros', () => {
    const html = render({ filters: [] });
    expect(html).toBe('');
  });

  it('debe mostrar la etiqueta y el valor del filtro', () => {
    const html = render({
      filters: [{ key: 'categoria', label: 'Categoría', value: 'Electrónica' }],
    });
    expect(html).toContain('Categoría');
    expect(html).toContain('Electrónica');
  });
});

describe('FilterChips — init()', () => {
  it('debe emitir ngr:filter-remove al hacer clic en el botón de cierre', () => {
    const root = document.createElement('div');
    root.innerHTML = render({
      filters: [{ key: 'estado', label: 'Estado', value: 'activo' }],
    });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:filter-remove', spy);

    const btn = root.querySelector<HTMLElement>('[data-action="remove-filter"]');
    btn?.click();

    expect(spy).toHaveBeenCalledOnce();
    const detail = (
      spy.mock.calls[0]?.[0] as CustomEvent<{ key: string; value: string }> | undefined
    )?.detail;
    expect(detail?.key).toBe('estado');
    expect(detail?.value).toBe('activo');

    document.body.removeChild(root);
  });

  it('debe incluir aria-label accesible en el botón de cierre', () => {
    const html = render({
      filters: [{ key: 'categoria', label: 'Categoría', value: 'Electrónica' }],
    });
    expect(html).toContain('aria-label="Quitar filtro Categoría"');
  });
});
