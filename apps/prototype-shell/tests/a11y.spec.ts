import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ── Credenciales de usuario administrador ─────────────────────────────────────

const ADMIN = { email: 'administrador@ngr.com', password: 'admin123' };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Limpia localStorage para garantizar estado de auth limpio */
async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/** Autentica como administrador y espera el dashboard */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/#/auth');
  await page.waitForSelector('#login-form', { timeout: 5000 });
  await page.fill('#login-email', ADMIN.email);
  await page.fill('#login-password', ADMIN.password);
  await page.click('#login-submit');
  await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
}

// ── Suite: Accesibilidad WCAG AA — rutas críticas ─────────────────────────────
// Req A2/A4: axe scans en dashboard (/) y lista de productos (/productos)

test.describe('A11y: Critical routes — WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req A2: dashboard route (/) passes axe WCAG AA
  test('dashboard / passes axe WCAG AA', async ({ page }) => {
    // Navegar al dashboard y esperar que el contenido cargue
    await page.goto('/#/');
    await page.waitForFunction(
      () => window.location.hash === '#/' || window.location.hash === '#/dashboard',
      { timeout: 5000 }
    );

    // Esperar que el h1 del dashboard esté visible antes del análisis
    await page.waitForSelector('h1', { timeout: 5000 });

    // Ejecutar análisis de accesibilidad con reglas WCAG 2.1 AA
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // No debe haber violaciones — si las hay, el mensaje incluye los IDs y descripciones
    expect(
      results.violations,
      `Violaciones WCAG AA en dashboard: ${results.violations
        .map((v: { id: string; description: string }) => `${v.id}: ${v.description}`)
        .join('; ')}`
    ).toHaveLength(0);
  });

  // Req A4: productos page passes axe WCAG AA
  test('productos page passes axe WCAG AA', async ({ page }) => {
    // Navegar a la lista de productos y esperar que cargue
    await page.goto('/#/productos');
    await page.waitForFunction(() => window.location.hash === '#/productos', { timeout: 5000 });

    // Esperar que el contenido esté renderizado antes del análisis
    await page.waitForSelector('h1', { timeout: 5000 });

    // Ejecutar análisis de accesibilidad con reglas WCAG 2.1 AA
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // No debe haber violaciones — si las hay, el mensaje incluye los IDs y descripciones
    expect(
      results.violations,
      `Violaciones WCAG AA en /productos: ${results.violations
        .map((v: { id: string; description: string }) => `${v.id}: ${v.description}`)
        .join('; ')}`
    ).toHaveLength(0);
  });
});
