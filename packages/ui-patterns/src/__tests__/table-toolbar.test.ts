import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, init } from '../patterns/table-toolbar';

// Tests del patrón TableToolbar
describe('TableToolbar — render()', () => {
  it('debe renderizar la barra de herramientas con la clase ngr-table-toolbar', () => {
    const html = render({});
    expect(html).toContain('ngr-table-toolbar');
  });

  it('debe incluir SearchBar por defecto cuando showSearch es true', () => {
    const html = render({ showSearch: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('no debe incluir SearchBar cuando showSearch es false', () => {
    const html = render({ showSearch: false });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('input[type="search"]')).toBeNull();
  });

  it('debe incluir FilterChips cuando hay filtros', () => {
    const html = render({
      filters: [{ key: 'estado', label: 'Estado', value: 'activo' }],
    });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('[data-action="remove-filter"]')).not.toBeNull();
  });

  it('no debe incluir FilterChips cuando no hay filtros', () => {
    const html = render({ filters: [] });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.ngr-filter-chips')).toBeNull();
  });

  it('debe incluir el HTML de acciones cuando se proporciona', () => {
    const html = render({ actions: '<button class="btn btn-primary">Nuevo</button>' });
    expect(html).toContain('Nuevo');
    expect(html).toContain('ngr-toolbar-actions');
  });
});

describe('TableToolbar — init() — event forwarding', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe burbujear ngr:search desde la SearchBar', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ showSearch: true });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:search', spy);

    const input = root.querySelector<HTMLInputElement>('input[type="search"]');
    if (!input) throw new Error('Input no encontrado');
    input.value = 'laptop';
    input.dispatchEvent(new Event('input'));

    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledOnce();

    document.body.removeChild(root);
  });

  it('debe burbujear ngr:filter-remove desde FilterChips', () => {
    const root = document.createElement('div');
    root.innerHTML = render({
      filters: [{ key: 'categoria', label: 'Categoría', value: 'Laptop' }],
    });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:filter-remove', spy);

    const btn = root.querySelector<HTMLElement>('[data-action="remove-filter"]');
    btn?.click();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail.key).toBe('categoria');

    document.body.removeChild(root);
  });
});
