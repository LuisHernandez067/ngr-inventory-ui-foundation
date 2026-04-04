import { test, expect, type Page } from '@playwright/test';

// ── Credenciales de usuarios de demo ──────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
};

// ── Datos de fixtures ─────────────────────────────────────────────────────────

// cnt-001: completado — Depósito Central, 3 ítems con discrepancias
const CONTEO_COMPLETADO_ID = 'cnt-001';
const CONTEO_COMPLETADO_NUMERO = 'CNT-2025-0001';

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

// ── Suite 1: Lista de conteos ─────────────────────────────────────────────────

test.describe('Journey: Conteos — lista de conteos físicos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req CO1: List renders on navigation to /conteos
  test('navegar a conteos muestra la lista con datos (CO1)', async ({ page }) => {
    await page.goto('/#/conteos');
    await page.waitForFunction(() => window.location.hash === '#/conteos', { timeout: 5000 });

    // Esperar que el tbody cargue filas reales (no el spinner)
    await page.waitForSelector('#conteos-tbody tr[data-id]', { timeout: 8000 });

    // La tabla debe tener al menos una fila de conteo
    const rows = page.locator('#conteos-tbody tr[data-id]');
    await expect(rows.first()).toBeVisible();
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('la página de conteos muestra el título y el botón "Nuevo Conteo"', async ({ page }) => {
    await page.goto('/#/conteos');
    await page.waitForFunction(() => window.location.hash === '#/conteos', { timeout: 5000 });

    // El h1 debe mostrar "Conteos físicos"
    await page.waitForSelector('h1', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Conteos físicos');

    // El botón de crear debe estar visible
    const btnNuevo = page.locator('#btn-nuevo-conteo');
    await expect(btnNuevo).toBeVisible();
  });

  test('la tabla de conteos muestra los estados con badges', async ({ page }) => {
    await page.goto('/#/conteos');
    await page.waitForSelector('#conteos-tbody tr[data-id]', { timeout: 8000 });

    // Debe haber badges de estado en la tabla
    const badges = page.locator('#conteos-tbody .badge');
    await expect(badges.first()).toBeVisible();
  });
});

// ── Suite 2: Crear nuevo conteo ───────────────────────────────────────────────

test.describe('Journey: Conteos — crear nuevo conteo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req CO2: Navigating to /conteos/nuevo renders the count creation form
  test('navegar a conteos/nuevo muestra el formulario de creación (CO2)', async ({ page }) => {
    await page.goto('/#/conteos/nuevo');
    await page.waitForFunction(() => window.location.hash === '#/conteos/nuevo', { timeout: 5000 });

    // Esperar que el formulario cargue (catalogo de almacenes y productos)
    await page.waitForSelector('#conteos-nuevo-form', { timeout: 10000 });

    // El formulario debe tener los campos requeridos
    const almacenSelect = page.locator('#almacenId');
    const descripcionInput = page.locator('#descripcion');
    await expect(almacenSelect).toBeVisible();
    await expect(descripcionInput).toBeVisible();
  });

  test('el botón "Nuevo Conteo" desde la lista navega al formulario', async ({ page }) => {
    await page.goto('/#/conteos');
    await page.waitForFunction(() => window.location.hash === '#/conteos', { timeout: 5000 });

    // Hacer clic en el botón Nuevo Conteo
    await page.click('#btn-nuevo-conteo');

    // Debe navegar a /conteos/nuevo
    await page.waitForFunction(() => window.location.hash === '#/conteos/nuevo', { timeout: 5000 });
    expect(page.url()).toContain('#/conteos/nuevo');
  });

  // Req CO2: Form fields validation — almacén, descripción, productos
  test('el formulario muestra la sección de productos a contar', async ({ page }) => {
    await page.goto('/#/conteos/nuevo');
    await page.waitForSelector('#conteos-nuevo-form', { timeout: 10000 });

    // La tabla de items debe estar presente con el botón agregar
    const btnAgregarProducto = page.locator('#btn-agregar-producto');
    await expect(btnAgregarProducto).toBeVisible();

    // La tabla de items vacía debe mostrar el mensaje de placeholder
    const emptyRow = page.locator('#items-empty-row');
    await expect(emptyRow).toBeVisible();
  });

  // Req CO3: Submit form redirects to count-in-progress detail page
  test('completar y enviar el formulario redirige al detalle del conteo (CO3)', async ({
    page,
  }) => {
    await page.goto('/#/conteos/nuevo');
    await page.waitForSelector('#conteos-nuevo-form', { timeout: 10000 });

    // Esperar que el select de almacén tenga opciones cargadas
    await page.waitForSelector('#almacenId option:not([value=""])', {
      state: 'attached',
      timeout: 8000,
    });

    // Seleccionar el primer almacén disponible
    const almacenOptions = page.locator('#almacenId option:not([value=""])');
    const firstAlmacenValue = await almacenOptions.first().getAttribute('value');
    if (firstAlmacenValue) {
      await page.selectOption('#almacenId', firstAlmacenValue);
    }

    // Completar la descripción
    await page.fill('#descripcion', 'Conteo E2E test — automatizado');

    // Agregar al menos un producto
    await page.click('#btn-agregar-producto');

    // Esperar que aparezca el select de producto en la primera fila
    await page.waitForSelector('.item-producto-select', { timeout: 5000 });

    // Esperar que el select de producto tenga opciones cargadas
    await page.waitForSelector('.item-producto-select option:not([value=""])', {
      state: 'attached',
      timeout: 8000,
    });

    // Seleccionar el primer producto disponible
    const productoOptions = page.locator('.item-producto-select option:not([value=""])');
    const firstProductoValue = await productoOptions.first().getAttribute('value');
    if (firstProductoValue) {
      await page.selectOption('.item-producto-select', firstProductoValue);
    }

    // Interceptar llamadas POST para verificar que se realizó
    const postCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/conteos')) {
        postCalls.push(req.url());
      }
    });

    // Enviar el formulario
    await page.click('#btn-submit');

    // Esperar navegación al detalle del conteo creado
    await page.waitForFunction(() => /^#\/conteos\/[^/]+$/.test(window.location.hash), {
      timeout: 8000,
    });

    // La URL debe ser /conteos/:id (detalle del nuevo conteo)
    expect(page.url()).toMatch(/#\/conteos\/[^/]+$/);

    // Verificar que se realizó el POST
    expect(postCalls.length).toBeGreaterThan(0);
  });
});

// ── Suite 3: Cierre de conteo y reconciliación ────────────────────────────────

test.describe('Journey: Conteos — cierre y reconciliación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  // Req CO4: The cierre page shows a reconciliation table
  test('la página de cierre muestra la tabla de reconciliación (CO4)', async ({ page }) => {
    // Navegar directamente al cierre del conteo completado cnt-001
    await page.goto(`/#/conteos/${CONTEO_COMPLETADO_ID}/cierre`);
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/conteos/${CONTEO_COMPLETADO_ID}/cierre`,
      { timeout: 5000 }
    );

    // Esperar que la tabla de diff se cargue
    await page.waitForSelector('#diff-table', { timeout: 8000 });

    // La tabla debe ser visible
    const diffTable = page.locator('#diff-table');
    await expect(diffTable).toBeVisible();

    // La tabla debe tener filas de datos
    const tableRows = page.locator('#diff-table tbody tr');
    await expect(tableRows.first()).toBeVisible();
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('la página de cierre muestra el número de conteo correcto', async ({ page }) => {
    await page.goto(`/#/conteos/${CONTEO_COMPLETADO_ID}/cierre`);
    await page.waitForSelector('#diff-table', { timeout: 8000 });

    // El encabezado debe mostrar el número del conteo
    const pageContent = await page.content();
    expect(pageContent).toContain(CONTEO_COMPLETADO_NUMERO);
  });

  test('la tabla de reconciliación muestra columnas de discrepancia', async ({ page }) => {
    await page.goto(`/#/conteos/${CONTEO_COMPLETADO_ID}/cierre`);
    await page.waitForSelector('#diff-table', { timeout: 8000 });

    // La tabla debe tener headers de cant sistema, contada y diferencia
    const headers = page.locator('#diff-table thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThanOrEqual(4);
  });

  test('las tarjetas de resumen muestran estadísticas del conteo', async ({ page }) => {
    await page.goto(`/#/conteos/${CONTEO_COMPLETADO_ID}/cierre`);
    await page.waitForSelector('#diff-table', { timeout: 8000 });

    // Las tarjetas de resumen deben estar visibles
    // cnt-001 tiene 3 ítems: 1 OK (Mouse), 2 faltantes (Teclado y Auriculares)
    const summaryCards = page.locator('.card .fs-3.fw-bold');
    await expect(summaryCards.first()).toBeVisible();
    const cardCount = await summaryCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4);
  });
});
