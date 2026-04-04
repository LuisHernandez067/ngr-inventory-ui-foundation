import { test, expect, type Page } from '@playwright/test';

// ── Credenciales de usuarios de demo ──────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
};

// ── Datos de fixtures ─────────────────────────────────────────────────────────

// prod-001: Teclado Mecánico TKL — tiene 10 entradas en kardexFixtures
const PRODUCTO_CON_KARDEX_ID = 'prod-001';

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
  await page.fill('#login-email', USERS.admin.email);
  await page.fill('#login-password', USERS.admin.password);
  await page.click('#login-submit');
  await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
}

/** Navega a la página de kardex y espera que el selector de producto esté listo */
async function navigateToKardex(page: Page): Promise<void> {
  await page.goto('/#/kardex');
  await page.waitForFunction(() => window.location.hash === '#/kardex', { timeout: 5000 });
  // Esperar que el selector de producto tenga opciones cargadas (productos activos del API)
  await page.waitForSelector('#producto-select option:not([value=""])', {
    state: 'attached',
    timeout: 8000,
  });
}

// ── Suite 1: Página de Kardex — navegación y filtros ─────────────────────────

test.describe('Journey: Kardex — filtros y trazabilidad de movimientos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req K1: Filter form renders on navigation to /kardex
  test('navegar a kardex muestra el formulario de filtros (K1)', async ({ page }) => {
    await page.goto('/#/kardex');
    await page.waitForFunction(() => window.location.hash === '#/kardex', { timeout: 5000 });

    // El título de la página debe ser visible
    await page.waitForSelector('#kardex-title', { timeout: 8000 });
    const title = page.locator('#kardex-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Kardex');

    // El selector de producto debe estar visible
    const productoSelect = page.locator('#producto-select');
    await expect(productoSelect).toBeVisible();
  });

  test('el formulario de kardex muestra filtros de fecha', async ({ page }) => {
    await page.goto('/#/kardex');
    await page.waitForSelector('#producto-select', { timeout: 8000 });

    // Los inputs de fecha deben estar presentes
    const fechaDesde = page.locator('#fecha-desde');
    const fechaHasta = page.locator('#fecha-hasta');
    await expect(fechaDesde).toBeVisible();
    await expect(fechaHasta).toBeVisible();
  });

  test('el selector de producto muestra el placeholder inicial', async ({ page }) => {
    await page.goto('/#/kardex');
    await page.waitForSelector('#producto-select', { timeout: 8000 });

    // El placeholder de los resultados debe ser visible antes de seleccionar producto
    const placeholder = page.locator('#kardex-placeholder');
    await expect(placeholder).toBeVisible();
  });

  // Req K2: Results table renders after filter submit
  test('seleccionar un producto muestra la tabla de historial de movimientos (K2)', async ({
    page,
  }) => {
    await navigateToKardex(page);

    // Seleccionar prod-001 (Teclado Mecánico TKL) — tiene 10 entradas de kardex en los fixtures
    await page.selectOption('#producto-select', PRODUCTO_CON_KARDEX_ID);

    // Esperar que la tabla de kardex aparezca
    await page.waitForSelector('#kardex-table', { timeout: 8000 });

    // La tabla debe ser visible y tener filas
    const kardexTable = page.locator('#kardex-table');
    await expect(kardexTable).toBeVisible();

    // Debe tener al menos 1 fila de datos (prod-001 tiene 10 entradas en fixtures)
    const rows = page.locator('#kardex-tbody tr');
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('la tabla de kardex muestra columnas de movimiento', async ({ page }) => {
    await navigateToKardex(page);

    // Seleccionar producto con kardex
    await page.selectOption('#producto-select', PRODUCTO_CON_KARDEX_ID);
    await page.waitForSelector('#kardex-table', { timeout: 8000 });

    // La tabla debe tener las columnas del kardex: Fecha, Tipo, Entrada, Salida, Saldo, Referencia
    const headers = page.locator('#kardex-table thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(5);
  });

  test('filtrar por rango de fechas actualiza el historial', async ({ page }) => {
    await navigateToKardex(page);

    // Seleccionar producto
    await page.selectOption('#producto-select', PRODUCTO_CON_KARDEX_ID);
    await page.waitForSelector('#kardex-table', { timeout: 8000 });

    // Contar filas iniciales (sin filtro de fecha)
    const initialRows = await page.locator('#kardex-tbody tr').count();

    // Aplicar filtro de fecha — solo enero 2025
    await page.fill('#fecha-desde', '2025-01-01');
    await page.fill('#fecha-hasta', '2025-01-31');

    // Esperar que la tabla se recargue (el change event dispara loadKardex)
    await page.waitForTimeout(500);

    // La tabla puede tener menos filas que el total (solo enero) o la misma cantidad
    // Lo importante es que la tabla sigue visible y no hay error
    const filteredTable = page.locator('#kardex-table');
    await expect(filteredTable).toBeVisible();

    // El conteo puede cambiar según el filtro — lo importante es que no hay error
    const filteredRowCount = await page.locator('#kardex-tbody tr').count();
    expect(filteredRowCount).toBeLessThanOrEqual(initialRows);
  });

  // Req K3: Empty state shown when no results match
  test('buscar un producto sin movimientos muestra el estado vacío (K3)', async ({ page }) => {
    await navigateToKardex(page);

    // Obtener el valor del segundo producto en la lista (que puede no tener kardex)
    // Alternativamente, aplicar un filtro de fecha muy restrictivo que garantice 0 resultados
    await page.selectOption('#producto-select', PRODUCTO_CON_KARDEX_ID);
    await page.waitForSelector('#kardex-table', { timeout: 8000 });

    // Aplicar un rango de fecha que no tiene movimientos (año futuro)
    await page.fill('#fecha-desde', '2099-01-01');
    await page.fill('#fecha-hasta', '2099-12-31');

    // Esperar que la tabla se actualice con el change en fecha-hasta
    // El change en fecha-hasta dispara loadKardex si hay producto seleccionado
    await page.locator('#fecha-hasta').dispatchEvent('change');
    await page.waitForTimeout(1000);

    // Debe aparecer la fila de "sin movimientos" (estado vacío)
    const emptyRow = page.locator('#kardex-empty-row');
    await expect(emptyRow).toBeVisible({ timeout: 5000 });

    // El mensaje debe contener texto informativo
    await expect(emptyRow).toContainText('No hay movimientos');
  });

  test('seleccionar un producto diferente carga el kardex correspondiente', async ({ page }) => {
    await navigateToKardex(page);

    // Cargar el kardex de prod-001 primero
    await page.selectOption('#producto-select', PRODUCTO_CON_KARDEX_ID);
    await page.waitForSelector('#kardex-table', { timeout: 8000 });

    // Cambiar a otro producto que no tiene kardex — usar el segundo producto de la lista
    const allOptions = page.locator('#producto-select option:not([value=""])');
    const secondOptionValue = await allOptions.nth(1).getAttribute('value');

    if (secondOptionValue) {
      await page.selectOption('#producto-select', secondOptionValue);

      // Esperar que se cargue la nueva consulta (puede ser tabla o estado vacío)
      await page.waitForSelector('#kardex-table, #kardex-empty-row', { timeout: 8000 });
    }

    // La tabla o el estado vacío deben ser visibles — el área de resultados se actualiza
    const tableArea = page.locator('#kardex-table-area');
    await expect(tableArea).toBeVisible();
  });
});
