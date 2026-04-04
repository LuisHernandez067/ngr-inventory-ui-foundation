import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ── Credenciales de usuarios de demo ──────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
  consulta: { email: 'consulta@ngr.com', password: 'consulta123' },
};

// ── Datos de fixtures esperados ───────────────────────────────────────────────

// rep-001 = Stock Actual (activo), rep-002 = Kardex (activo),
// rep-003 = Movimientos del Período (activo), rep-005 = Productos Bajo Mínimo (activo)
// rep-004 = Inventario Valorizado (próximamente), rep-006 = Log de Auditoría (próximamente)
// Total de tarjetas activas = 4
const REPORTE_BAJO_STOCK_ID = 'rep-005';

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

/** Autentica como usuario consulta (solo lectura) */
async function loginAsConsulta(page: Page): Promise<void> {
  await page.goto('/#/auth');
  await page.waitForSelector('#login-form', { timeout: 5000 });
  await page.fill('#login-email', USERS.consulta.email);
  await page.fill('#login-password', USERS.consulta.password);
  await page.click('#login-submit');
  await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
}

/** Navega a la página de reportes y espera que el catálogo se cargue */
async function navigateToReportes(page: Page): Promise<void> {
  await page.goto('/#/reportes');
  await page.waitForFunction(() => window.location.hash === '#/reportes', { timeout: 5000 });
  // Esperar que el catálogo renderice al menos una tarjeta de reporte
  await page.waitForSelector('#reportes-catalogo [data-reporte-id]', { timeout: 8000 });
}

// ── Suite 1: Catálogo de reportes ─────────────────────────────────────────────

test.describe('Journey: Reportes — catalog, filters and export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req R1: Navigating to /reportes renders at least 4 report type cards
  test('navigating to reportes shows the catalog with at least 4 reports', async ({ page }) => {
    await navigateToReportes(page);

    // El catálogo debe mostrar las tarjetas — incluyendo activos y próximamente
    const cards = page.locator('#reportes-catalogo [data-reporte-id]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Al menos 4 tarjetas activas (sin pe-none / opacity-50)
    // Los tipos activos: stock_actual, movimientos, kardex, bajo_stock
    const activeCards = page.locator('#reportes-catalogo [data-reporte-id]:not(.pe-none)');
    await expect(activeCards.first()).toBeVisible();
    const activeCount = await activeCards.count();
    expect(activeCount).toBeGreaterThanOrEqual(4);
  });

  // Req R2: Selecting a report type renders the filter panel
  test('selecting a report type shows the filter panel', async ({ page }) => {
    await navigateToReportes(page);

    // Hacer clic en la tarjeta de "Stock Actual" (rep-001, activo)
    const stockCard = page.locator('#reportes-catalogo [data-reporte-id="rep-001"]');
    await expect(stockCard).toBeVisible();
    await stockCard.click();

    // El panel de detalle debe mostrar el formulario de filtros
    await page.waitForSelector('#reportes-detail .card.border-primary', { timeout: 5000 });
    const filterPanel = page.locator('#reportes-detail .card.border-primary');
    await expect(filterPanel).toBeVisible();

    // El botón "Vista previa" debe estar presente en el panel
    const btnVistaPrevia = page.locator('#btn-vista-previa');
    await expect(btnVistaPrevia).toBeVisible();
  });

  // Req R3: Applying filters renders a preview table with at least 1 row
  test('applying filters generates the preview with data', async ({ page }) => {
    await navigateToReportes(page);

    // Seleccionar reporte "Productos Bajo Mínimo" — devuelve datos del mock sin filtros requeridos
    const bajoStockCard = page.locator(
      `#reportes-catalogo [data-reporte-id="${REPORTE_BAJO_STOCK_ID}"]`
    );
    await expect(bajoStockCard).toBeVisible();
    await bajoStockCard.click();

    // Esperar el panel de filtros
    await page.waitForSelector('#btn-vista-previa', { timeout: 5000 });

    // Hacer clic en "Vista previa" sin cambiar filtros (umbral por defecto = 10)
    await page.click('#btn-vista-previa');

    // Esperar que la tabla de preview aparezca
    await page.waitForSelector('#reportes-detail table', { timeout: 8000 });

    // La tabla debe tener al menos una fila de datos
    const tableRows = page.locator('#reportes-detail table tbody tr');
    await expect(tableRows.first()).toBeVisible();
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  // Req R4: Clicking "Exportar" shows export feedback
  test('clicking export shows export feedback', async ({ page }) => {
    await navigateToReportes(page);

    // Seleccionar el reporte "Stock Actual" y generar preview
    const stockCard = page.locator('#reportes-catalogo [data-reporte-id="rep-001"]');
    await stockCard.click();
    await page.waitForSelector('#btn-vista-previa', { timeout: 5000 });
    await page.click('#btn-vista-previa');

    // Esperar la tabla de preview
    await page.waitForSelector('#reportes-detail table', { timeout: 8000 });

    // El botón "Exportar" debe estar visible (admin tiene permiso reportes.exportar)
    const btnExportar = page.locator('#btn-exportar');
    await expect(btnExportar).toBeVisible({ timeout: 5000 });

    // Hacer clic en exportar — como el dataset es pequeño, va a fase 'done' inmediatamente
    await page.click('#btn-exportar');

    // Debe aparecer el indicador de progreso OR el mensaje de éxito
    // La lógica: si previewRows.length <= 200 → done inmediato con alert-success
    // Si previewRows.length > 200 → spinner (exporting phase)
    const exportFeedback = page.locator(
      '#reportes-detail .alert-success, #reportes-detail .spinner-border, #btn-descargar-reporte'
    );
    await expect(exportFeedback.first()).toBeVisible({ timeout: 5000 });
  });

  // Req R5: Export button hidden for consulta role
  test('export button is NOT visible for consulta user', async ({ page }) => {
    // Limpiar auth y loguearse como consulta
    await clearAuth(page);
    await loginAsConsulta(page);
    await navigateToReportes(page);

    // Seleccionar un reporte activo y generar preview
    const stockCard = page.locator('#reportes-catalogo [data-reporte-id="rep-001"]');
    await stockCard.click();
    await page.waitForSelector('#btn-vista-previa', { timeout: 5000 });
    await page.click('#btn-vista-previa');

    // Esperar la tabla de preview
    await page.waitForSelector('#reportes-detail table', { timeout: 8000 });

    // El botón "Exportar" NO debe estar visible para consulta
    const btnExportar = page.locator('#btn-exportar');
    await expect(btnExportar).toHaveCount(0);
  });

  // Req R2 + filtro de rango de fechas: the filter panel renders date inputs for movimientos
  test('movimientos report shows date range filters', async ({ page }) => {
    await navigateToReportes(page);

    // Seleccionar "Movimientos del Período" (rep-003)
    const movCard = page.locator('#reportes-catalogo [data-reporte-id="rep-003"]');
    await expect(movCard).toBeVisible();
    await movCard.click();

    // El panel de filtros debe mostrar los inputs de fecha
    await page.waitForSelector('#filter-fecha-desde', { timeout: 5000 });
    const fechaDesde = page.locator('#filter-fecha-desde');
    const fechaHasta = page.locator('#filter-fecha-hasta');
    await expect(fechaDesde).toBeVisible();
    await expect(fechaHasta).toBeVisible();
  });

  // Req R3 + filtro por fecha: preview updates when date range is set
  test('filtering by date range updates the preview', async ({ page }) => {
    await navigateToReportes(page);

    // Seleccionar reporte de movimientos
    const movCard = page.locator('#reportes-catalogo [data-reporte-id="rep-003"]');
    await movCard.click();
    await page.waitForSelector('#filter-fecha-desde', { timeout: 5000 });

    // Establecer un rango de fechas amplio (2025)
    await page.fill('#filter-fecha-desde', '2025-01-01');
    await page.fill('#filter-fecha-hasta', '2025-12-31');

    // Aplicar filtros
    await page.click('#btn-vista-previa');

    // Esperar resultado — puede ser tabla con datos o mensaje de sin datos
    await page.waitForSelector('#reportes-detail table, #reportes-detail .alert-secondary', {
      timeout: 8000,
    });

    // La fase debe haber cambiado a previewing (ya no se muestra el panel de filtros)
    const filterPanel = page.locator('#btn-vista-previa');
    await expect(filterPanel).toHaveCount(0);
  });
});

// ── Suite 2: Accesibilidad — WCAG AA en /reportes ──────────────────────────────

test.describe('A11y: Reportes page — WCAG 2.1 AA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto('/#/auth');
    await page.waitForSelector('#login-form', { timeout: 5000 });
    await page.fill('#login-email', USERS.admin.email);
    await page.fill('#login-password', USERS.admin.password);
    await page.click('#login-submit');
    await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
  });

  // Req A2/A4: Zero WCAG 2.1 AA violations on /reportes
  test('reportes page has no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/#/reportes');
    await page.waitForFunction(() => window.location.hash === '#/reportes', { timeout: 5000 });

    // Esperar que el catálogo esté cargado antes del análisis axe
    await page.waitForSelector('#reportes-catalogo [data-reporte-id]', { timeout: 8000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('[aria-hidden="true"]')
      .analyze();

    // Req A5: If violations found, message includes violation description
    expect(
      accessibilityScanResults.violations,
      `Violaciones WCAG AA encontradas:\n${JSON.stringify(accessibilityScanResults.violations, null, 2)}`
    ).toHaveLength(0);
  });
});
