import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, init } from '../patterns/search-bar';

// Tests del patrón SearchBar
describe('SearchBar — render()', () => {
  it('debe renderizar un input de búsqueda', () => {
    const html = render({});
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('input[type="search"]')).not.toBeNull();
  });

  it('debe usar el placeholder proporcionado', () => {
    const html = render({ placeholder: 'Buscar producto...' });
    expect(html).toContain('Buscar producto...');
  });

  it('debe usar "Buscar..." como placeholder por defecto', () => {
    const html = render({});
    expect(html).toContain('Buscar...');
  });

  it('debe incluir el valor inicial cuando se proporciona', () => {
    const html = render({ initialValue: 'laptop' });
    expect(html).toContain('value="laptop"');
  });

  it('debe incluir el botón de limpiar con data-action="clear"', () => {
    const html = render({});
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('[data-action="clear"]')).not.toBeNull();
  });
});

describe('SearchBar — init()', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe emitir ngr:search con debounce al escribir en el input', () => {
    const root = document.createElement('div');
    root.innerHTML = render({});
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:search', spy);

    const input = root.querySelector<HTMLInputElement>('input');
    if (!input) throw new Error('Input no encontrado');

    // Simular escritura
    input.value = 'laptop';
    input.dispatchEvent(new Event('input'));

    // Antes del delay no debe emitir
    expect(spy).not.toHaveBeenCalled();

    // Después del delay debe emitir una vez
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail.query).toBe('laptop');

    document.body.removeChild(root);
  });

  it('debe limpiar el input y emitir ngr:search vacío al hacer clic en limpiar', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ initialValue: 'laptop' });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:search', spy);

    const clearBtn = root.querySelector<HTMLElement>('[data-action="clear"]');
    clearBtn?.click();

    // El botón de limpiar emite inmediatamente (sin debounce)
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail.query).toBe('');

    const input = root.querySelector<HTMLInputElement>('input');
    expect(input?.value).toBe('');

    document.body.removeChild(root);
  });
});
