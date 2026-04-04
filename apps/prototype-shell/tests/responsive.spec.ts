import { test, expect, devices, type Page } from '@playwright/test';

// ── Tests de comportamiento responsivo para prototype-shell ───────────────────
// Verifican que las páginas principales no producen desbordamiento horizontal,
// que el toggle de sidebar es visible en mobile, y que las tablas tienen scroll
// horizontal disponible (overflow-x auto/scroll) en lugar de ocultar contenido.

/** Autentica como administrador y espera el dashboard */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/#/auth');
  await page.waitForSelector('#login-form', { timeout: 5000 });
  await page.fill('#login-email', 'administrador@ngr.com');
  await page.fill('#login-password', 'admin123');
  await page.click('#login-submit');
  await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
}

// ── Rutas a verificar para desbordamiento ────────────────────────────────────

const ROUTES: { path: string; name: string }[] = [
  { path: '/', name: 'dashboard' },
  { path: '/#/productos', name: 'lista de productos' },
  { path: '/#/login', name: 'login' },
  { path: '/#/almacenes', name: 'lista de almacenes' },
];

// ── Grupo 1: Sin desbordamiento horizontal ────────────────────────────────────

test.describe('sin desbordamiento horizontal', () => {
  for (const route of ROUTES) {
    test(`no debe haber scroll horizontal en ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);

      // Verifica que no haya desbordamiento horizontal en la página
      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    });
  }
});

// ── Grupo 2: Sidebar toggle visible en mobile ─────────────────────────────────
// El botón hamburguesa debe ser visible cuando el viewport es mobile

test('el botón hamburguesa debe estar visible en el dashboard mobile', async ({ page }) => {
  await page.setViewportSize(devices['iPhone 12'].viewport);
  await page.goto('/');

  // Selector del botón de toggle del sidebar (Bootstrap offcanvas o navbar-toggler)
  const hamburgerButton = page.locator('.navbar-toggler, [data-bs-toggle="offcanvas"]').first();

  await expect(hamburgerButton).toBeVisible();
});

// ── Grupo 3: Tablas con scroll horizontal disponible ─────────────────────────
// Las tablas no deben tener overflow-x: hidden — deben ser auto o scroll

test.describe('tablas con scroll horizontal disponible', () => {
  const TABLE_ROUTES: { path: string; name: string }[] = [
    { path: '/#/productos', name: 'productos' },
    { path: '/#/almacenes', name: 'almacenes' },
  ];

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const route of TABLE_ROUTES) {
    test(`la tabla en ${route.name} debe tener overflow-x accesible`, async ({ page }) => {
      await page.goto(route.path);

      // Buscar el wrapper de la datatable — puede ser .ngr-datatable-wrapper,
      // .table-responsive, o cualquier elemento con clase que contenga "datatable"
      const tableWrapper = page
        .locator('.ngr-datatable-wrapper, .table-responsive, [class*="datatable"]')
        .first();

      // Obtener el valor computado de overflow-x
      const overflowX = await tableWrapper.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });

      // El overflow-x NO debe ser "hidden" — debe ser "auto", "scroll" u otro valor visible
      expect(overflowX).not.toBe('hidden');
    });
  }
});
