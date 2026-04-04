import { test, expect } from '@playwright/test';

// Smoke test E2E para prototype-shell
// Verifica que la app carga correctamente con el tema Bootstrap aplicado
test.describe('Prototype Shell — smoke test', () => {
  test('debe cargar la página y tener el atributo data-bs-theme', async ({ page }) => {
    // Navegar a la raíz de la aplicación
    await page.goto('/');

    // Verificar que el contenedor raíz con el tema está visible
    const appContainer = page.locator('[data-bs-theme]');
    await expect(appContainer).toBeVisible();
  });

  test('debe mostrar el título de la aplicación', async ({ page }) => {
    await page.goto('/');

    // Verificar que se renderiza el nombre de la app en la barra de navegación
    const brand = page.locator('.navbar-brand');
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('NGR Inventory');
  });

  test('debe tener data-bs-theme con valor "light" por defecto', async ({ page }) => {
    await page.goto('/');

    const themeAttr = await page.locator('[data-bs-theme]').getAttribute('data-bs-theme');
    expect(themeAttr).toBe('light');
  });
});
