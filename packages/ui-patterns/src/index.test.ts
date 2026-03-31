import { describe, it, expect } from 'vitest';
import { UI_PATTERNS_VERSION } from './index';

// Smoke test para verificar que el paquete ui-patterns está correctamente configurado
describe('ui-patterns — configuración del paquete', () => {
  it('debe exportar la versión del paquete', () => {
    expect(UI_PATTERNS_VERSION).toBe('0.0.1');
  });

  it('debe ejecutarse en entorno jsdom', () => {
    // Verifica que el entorno DOM está disponible
    expect(typeof document).toBe('object');
    expect(typeof window).toBe('object');
  });

  it('debe poder crear y consultar elementos DOM', () => {
    const container = document.createElement('section');
    container.setAttribute('data-testid', 'ui-patterns-test');
    container.innerHTML = '<p>Patrón de prueba</p>';
    document.body.appendChild(container);

    const found = document.querySelector('[data-testid="ui-patterns-test"]');
    expect(found).not.toBeNull();
    expect(found?.querySelector('p')?.textContent).toBe('Patrón de prueba');
  });
});
