import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

// ── Suite: Accesibilidad WCAG AA — página de login ───────────────────────────
// Req A3: axe check en /login (ruta #/auth) — página de login sin autenticar

test.describe('A11y: Login page — WCAG 2.1 AA (Req A3)', () => {
  test('login page passes axe accessibility check', async ({ page }) => {
    // Navegar a la base URL — la app redirige automáticamente a #/auth sin sesión
    await page.goto('/');

    // Limpiar cualquier sesión previa para garantizar el estado de login visible
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Recargar para que la app detecte la ausencia de sesión y muestre el form de login
    await page.goto('/');

    // Esperar que el formulario de login esté completamente renderizado
    await page.waitForSelector('#login-form', { timeout: 5000 });

    // Ejecutar análisis de accesibilidad con reglas WCAG 2.1 AA
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // No debe haber violaciones — el mensaje de fallo incluye los IDs para facilitar el diagnóstico
    expect(
      results.violations,
      `Violaciones WCAG AA en /login: ${results.violations
        .map((v: { id: string; description: string }) => `${v.id}: ${v.description}`)
        .join('; ')}`
    ).toHaveLength(0);
  });
});
