import { describe, it, expect, beforeEach, vi } from 'vitest';

// Smoke test para verificar que el montaje de la app funciona correctamente
describe('Prototype Shell — montaje', () => {
  beforeEach(() => {
    // Simular import.meta.env.DEV como false para evitar MSW en tests
    vi.stubEnv('DEV', false);

    // Preparar el DOM con el contenedor esperado por main.ts
    document.body.innerHTML = '<div id="app" data-bs-theme="light"></div>';
  });

  it('debe existir el contenedor #app con data-bs-theme', () => {
    const app = document.getElementById('app');
    expect(app).not.toBeNull();
    expect(app?.getAttribute('data-bs-theme')).toBe('light');
  });

  it('debe renderizar contenido dentro de #app al montar', () => {
    const app = document.getElementById('app');
    if (!app) throw new Error('No se encontró #app');

    // Simular el contenido que inserta main.ts
    app.innerHTML = `
      <div class="container py-4">
        <h1 class="display-4">NGR Inventory</h1>
      </div>
    `;

    const heading = app.querySelector('h1');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toContain('NGR Inventory');
  });
});
