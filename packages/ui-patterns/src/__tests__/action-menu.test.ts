import { Dropdown } from 'bootstrap';
import { describe, it, expect, vi } from 'vitest';

import { render, init } from '../patterns/action-menu';
import type { ActionMenuItem } from '../types';

// Items de prueba del menú
const testItems: ActionMenuItem[] = [
  { id: 'editar', label: 'Editar', icon: 'pencil' },
  { id: 'duplicar', label: 'Duplicar' },
  { id: 'eliminar', label: 'Eliminar', icon: 'trash', variant: 'danger' },
];

// Tests del patrón ActionMenu
describe('ActionMenu — render()', () => {
  it('debe renderizar el botón toggle con aria-label="Acciones"', () => {
    const html = render({ items: testItems });
    const el = document.createElement('div');
    el.innerHTML = html;
    const toggle = el.querySelector('[data-bs-toggle="dropdown"]');
    expect(toggle?.getAttribute('aria-label')).toBe('Acciones');
  });

  it('debe renderizar todos los ítems como botones dropdown', () => {
    const html = render({ items: testItems });
    const el = document.createElement('div');
    el.innerHTML = html;
    const buttons = el.querySelectorAll('[data-action-id]');
    // editar, duplicar, eliminar (3 activos)
    expect(buttons).toHaveLength(3);
  });

  it('debe incluir data-action-id con el id del ítem', () => {
    const html = render({ items: testItems });
    expect(html).toContain('data-action-id="editar"');
    expect(html).toContain('data-action-id="eliminar"');
  });

  it('debe aplicar text-danger a los ítems con variant="danger"', () => {
    const html = render({ items: testItems });
    const el = document.createElement('div');
    el.innerHTML = html;
    const dangerBtn = el.querySelector('[data-action-id="eliminar"]');
    expect(dangerBtn?.classList.contains('text-danger')).toBe(true);
  });

  it('debe renderizar ítem deshabilitado sin data-action-id', () => {
    const items: ActionMenuItem[] = [{ id: 'archivar', label: 'Archivar', disabled: true }];
    const html = render({ items });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('[data-action-id]')).toBeNull();
    expect(el.querySelector('.disabled')).not.toBeNull();
  });

  it('debe renderizar el ícono del ítem cuando se proporciona', () => {
    const html = render({ items: [{ id: 'edit', label: 'Editar', icon: 'pencil' }] });
    expect(html).toContain('bi-pencil');
  });
});

describe('ActionMenu — init()', () => {
  it('debe instanciar Bootstrap Dropdown en el toggle', () => {
    const mockDropdown = vi.mocked(Dropdown);
    mockDropdown.mockClear();

    const root = document.createElement('div');
    root.innerHTML = render({ items: testItems });
    init(root);

    expect(mockDropdown).toHaveBeenCalledOnce();
  });

  it('debe emitir ngr:action al hacer clic en un ítem activo', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ items: testItems });
    document.body.appendChild(root);
    init(root);

    const spy = vi.fn();
    root.addEventListener('ngr:action', spy);

    const btn = root.querySelector<HTMLElement>('[data-action-id="editar"]');
    btn?.click();

    expect(spy).toHaveBeenCalledOnce();
    const actionEvent = spy.mock.calls[0]?.[0] as CustomEvent<{ id: string }> | undefined;
    expect(actionEvent?.detail.id).toBe('editar');

    document.body.removeChild(root);
  });
});
