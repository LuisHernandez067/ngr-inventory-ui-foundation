import { describe, it, expect } from 'vitest';
import { UI_CORE_VERSION } from './index';

// Smoke test para verificar que el paquete ui-core está correctamente configurado
describe('ui-core — configuración del paquete', () => {
  it('debe exportar la versión del paquete', () => {
    expect(UI_CORE_VERSION).toBe('0.0.1');
  });

  it('debe ejecutarse en entorno jsdom', () => {
    // Verifica que el entorno DOM está disponible
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('debe poder crear elementos DOM', () => {
    const el = document.createElement('div');
    el.setAttribute('data-testid', 'ui-core-test');
    document.body.appendChild(el);

    const found = document.querySelector('[data-testid="ui-core-test"]');
    expect(found).not.toBeNull();
    expect(found?.tagName.toLowerCase()).toBe('div');
  });
});
