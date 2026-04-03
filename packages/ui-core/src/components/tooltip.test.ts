import { Tooltip } from 'bootstrap';
import { describe, it, expect, vi } from 'vitest';

import { render, initTooltips, createTooltipAttrs } from './tooltip';

// Tests del componente Tooltip
describe('Tooltip — render()', () => {
  it('debe envolver el contenido en un span con data-bs-toggle="tooltip"', () => {
    const html = render({ title: 'Ayuda', content: '<button>Info</button>' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const wrapper = el.querySelector('[data-bs-toggle="tooltip"]');
    expect(wrapper).not.toBeNull();
  });

  it('debe incluir el atributo title con el texto del tooltip', () => {
    const html = render({ title: 'Más información', content: 'Texto' });
    expect(html).toContain('title="Más información"');
  });

  it('debe usar placement "top" por defecto', () => {
    const html = render({ title: 'Tooltip', content: 'Texto' });
    expect(html).toContain('data-bs-placement="top"');
  });

  it('debe usar el placement especificado', () => {
    const html = render({ title: 'Tooltip', placement: 'bottom', content: 'Texto' });
    expect(html).toContain('data-bs-placement="bottom"');
  });

  it('debe incluir el contenido HTML dentro del wrapper', () => {
    const html = render({ title: 'Tooltip', content: '<strong>Contenido</strong>' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('strong')?.textContent).toBe('Contenido');
  });
});

describe('createTooltipAttrs()', () => {
  it('debe retornar los atributos data-bs de tooltip', () => {
    const attrs = createTooltipAttrs({ text: 'Ayuda' });
    expect(attrs).toContain('data-bs-toggle="tooltip"');
    expect(attrs).toContain('title="Ayuda"');
  });

  it('debe usar "top" como placement por defecto', () => {
    const attrs = createTooltipAttrs({ text: 'Info' });
    expect(attrs).toContain('data-bs-placement="top"');
  });

  it('debe usar el placement especificado', () => {
    const attrs = createTooltipAttrs({ text: 'Info', placement: 'end' });
    expect(attrs).toContain('data-bs-placement="end"');
  });
});

describe('initTooltips()', () => {
  it('debe llamar a new Tooltip para cada elemento con data-bs-toggle="tooltip"', () => {
    const mockTooltip = vi.mocked(Tooltip);
    mockTooltip.mockClear();

    const root = document.createElement('div');
    root.innerHTML = `
      <span data-bs-toggle="tooltip" title="T1">Elem 1</span>
      <span data-bs-toggle="tooltip" title="T2">Elem 2</span>
    `;

    initTooltips(root);

    expect(mockTooltip).toHaveBeenCalledTimes(2);
  });
});
