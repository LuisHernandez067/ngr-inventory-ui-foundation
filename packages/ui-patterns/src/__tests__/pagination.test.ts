import { describe, it, expect, vi } from 'vitest';
import { render, init } from '../patterns/pagination';

// Tests del patrón Pagination
describe('Pagination — render()', () => {
  it('debe renderizar nav con aria-label="Paginación"', () => {
    const html = render({ currentPage: 1, totalPages: 5 });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('nav[aria-label="Paginación"]')).not.toBeNull();
  });

  it('debe deshabilitar el botón anterior en la primera página', () => {
    const html = render({ currentPage: 1, totalPages: 5 });
    const el = document.createElement('div');
    el.innerHTML = html;
    const prev = el.querySelector('[aria-label="Página anterior"]');
    expect(prev?.hasAttribute('disabled')).toBe(true);
  });

  it('debe deshabilitar el botón siguiente en la última página', () => {
    const html = render({ currentPage: 5, totalPages: 5 });
    const el = document.createElement('div');
    el.innerHTML = html;
    const next = el.querySelector('[aria-label="Página siguiente"]');
    expect(next?.hasAttribute('disabled')).toBe(true);
  });

  it('debe marcar la página actual como active con aria-current="page"', () => {
    const html = render({ currentPage: 3, totalPages: 5 });
    const el = document.createElement('div');
    el.innerHTML = html;
    const activeItem = el.querySelector('.page-item.active');
    expect(activeItem?.getAttribute('aria-current')).toBe('page');
  });

  it('debe mostrar todas las páginas sin elipsis cuando totalPages <= 7', () => {
    const html = render({ currentPage: 3, totalPages: 5 });
    const el = document.createElement('div');
    el.innerHTML = html;
    // Las páginas 1-5 deben estar presentes (excluyendo prev/next)
    const pageButtons = el.querySelectorAll('[data-page]:not([aria-label])');
    expect(pageButtons).toHaveLength(5);
  });

  it('debe mostrar elipsis cuando totalPages > 7', () => {
    const html = render({ currentPage: 5, totalPages: 10 });
    expect(html).toContain('…');
  });

  it('debe incluir siempre la primera y última página en elipsis mode', () => {
    const html = render({ currentPage: 5, totalPages: 10 });
    const el = document.createElement('div');
    el.innerHTML = html;
    const buttons = el.querySelectorAll<HTMLButtonElement>('[data-page]:not([aria-label])');
    const pages = Array.from(buttons).map((b) => parseInt(b.getAttribute('data-page') ?? ''));
    expect(pages).toContain(1);
    expect(pages).toContain(10);
  });

  it('debe incluir currentPage ± 1 en elipsis mode', () => {
    const html = render({ currentPage: 5, totalPages: 10 });
    const el = document.createElement('div');
    el.innerHTML = html;
    const buttons = el.querySelectorAll<HTMLButtonElement>('[data-page]:not([aria-label])');
    const pages = Array.from(buttons).map((b) => parseInt(b.getAttribute('data-page') ?? ''));
    expect(pages).toContain(4);
    expect(pages).toContain(5);
    expect(pages).toContain(6);
  });
});

describe('Pagination — init()', () => {
  it('debe emitir ngr:page-change al hacer clic en una página', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ currentPage: 1, totalPages: 5 });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:page-change', spy);

    // Clic en página 3
    const buttons = root.querySelectorAll<HTMLButtonElement>('[data-page]:not([aria-label])');
    const page3 = Array.from(buttons).find((b) => b.getAttribute('data-page') === '3');
    page3?.click();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0].detail.page).toBe(3);

    document.body.removeChild(root);
  });

  it('no debe emitir ngr:page-change al hacer clic en un botón deshabilitado', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ currentPage: 1, totalPages: 5 });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:page-change', spy);

    const prev = root.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]');
    prev?.click();

    expect(spy).not.toHaveBeenCalled();

    document.body.removeChild(root);
  });
});
