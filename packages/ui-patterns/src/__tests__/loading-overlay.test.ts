import { describe, it, expect } from 'vitest';

import { show, hide, render } from '../patterns/loading-overlay';

// Tests del patrón LoadingOverlay
describe('LoadingOverlay — show()', () => {
  it('debe agregar el overlay al elemento raíz', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);

    expect(root.querySelector('[data-ngr-overlay]')).not.toBeNull();

    document.body.removeChild(root);
  });

  it('debe establecer aria-busy="true" en el root', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);

    expect(root.getAttribute('aria-busy')).toBe('true');

    document.body.removeChild(root);
  });

  it('debe incluir un Spinner dentro del overlay', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);

    const overlay = root.querySelector('[data-ngr-overlay]');
    expect(overlay?.querySelector('.spinner-border')).not.toBeNull();

    document.body.removeChild(root);
  });

  it('debe usar el mensaje personalizado cuando se proporciona', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root, 'Guardando inventario...');

    const overlay = root.querySelector('[data-ngr-overlay]');
    expect(overlay?.textContent).toContain('Guardando inventario...');

    document.body.removeChild(root);
  });

  it('no debe agregar duplicados si show() se llama varias veces', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);
    show(root);

    expect(root.querySelectorAll('[data-ngr-overlay]')).toHaveLength(1);

    document.body.removeChild(root);
  });

  it('debe tener role="status" y aria-live="polite" en el overlay', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);

    const overlay = root.querySelector('[data-ngr-overlay]');
    expect(overlay?.getAttribute('role')).toBe('status');
    expect(overlay?.getAttribute('aria-live')).toBe('polite');

    document.body.removeChild(root);
  });
});

describe('LoadingOverlay — hide()', () => {
  it('debe remover el overlay del elemento raíz', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);
    hide(root);

    expect(root.querySelector('[data-ngr-overlay]')).toBeNull();

    document.body.removeChild(root);
  });

  it('debe remover aria-busy del root', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    show(root);
    hide(root);

    expect(root.hasAttribute('aria-busy')).toBe(false);

    document.body.removeChild(root);
  });

  it('no debe lanzar error si se llama sin overlay activo', () => {
    const root = document.createElement('div');
    expect(() => {
      hide(root);
    }).not.toThrow();
  });
});

describe('LoadingOverlay — render()', () => {
  it('debe retornar string vacío', () => {
    expect(render()).toBe('');
  });
});
