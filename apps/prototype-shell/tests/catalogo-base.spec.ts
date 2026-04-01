import { test, expect, type Page } from '@playwright/test';

// ── Constantes ────────────────────────────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
};

// IDs de fixtures predefinidos en el sistema
const PRODUCTO_ID = 'prod-001';
const CATEGORIA_ID = 'cat-001'; // Periféricos — tiene productoCount > 0

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Limpia localStorage y navega a la raíz para garantizar estado limpio */
async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/** Completa el formulario de login y hace submit */
async function loginAs(page: Page, user: { email: string; password: string }): Promise<void> {
  await page.fill('#login-email', user.email);
  await page.fill('#login-password', user.password);
  await page.click('#login-submit');
}

/** Autentica como administrador y espera el dashboard */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/#/auth');
  await page.waitForSelector('#login-form', { timeout: 5000 });
  await loginAs(page, USERS.admin);
  await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 8000 });
}

// ── Suite 1: Journey Productos ────────────────────────────────────────────────
// Cubre: lista → detalle → editar → guardar

test.describe('Journey: Productos — lista → detalle → editar → guardar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a productos muestra la lista con datos', async ({ page }) => {
    // Ir a la lista de productos
    await page.goto('/#/productos');
    await page.waitForFunction(() => window.location.hash === '#/productos', { timeout: 5000 });

    // Esperar que la tabla cargue — hay filas en la tabla
    await page.waitForSelector('#table-container tbody tr', { timeout: 5000 });

    // La tabla debe tener al menos una fila de datos
    const rows = page.locator('#table-container tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('hacer clic en una fila navega al detalle del producto', async ({ page }) => {
    // Ir a la lista de productos
    await page.goto('/#/productos');
    await page.waitForSelector('#table-container tbody tr.cursor-pointer', { timeout: 5000 });

    // Hacer clic en la primera fila clickeable
    await page.locator('#table-container tbody tr.cursor-pointer').first().click();

    // Debe navegar a la ruta de detalle — esperar cambio de hash
    await page.waitForFunction(() => /^#\/productos\/[^/]+$/.test(window.location.hash), {
      timeout: 5000,
    });

    expect(page.url()).toMatch(/#\/productos\/[^/]+$/);
  });

  test('detalle de producto muestra nombre y código', async ({ page }) => {
    // Navegar directamente al detalle del primer producto del fixture
    await page.goto(`/#/productos/${PRODUCTO_ID}`);
    await page.waitForFunction(() => window.location.hash === `#/productos/${PRODUCTO_ID}`, {
      timeout: 5000,
    });

    // Esperar que se renderice el h1 con el nombre del producto
    await page.waitForSelector('h1', { timeout: 5000 });

    // El h1 debe mostrar el nombre del producto
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Teclado Mecánico TKL');
  });

  test('hacer clic en Editar desde el detalle navega al formulario de edición', async ({
    page,
  }) => {
    // Navegar al detalle del producto
    await page.goto(`/#/productos/${PRODUCTO_ID}`);
    await page.waitForSelector('#producto-actions', { timeout: 5000 });

    // Abrir el menú de acciones (ActionMenu)
    const actionMenuToggle = page.locator('#producto-actions [data-bs-toggle="dropdown"]');
    await actionMenuToggle.click();

    // Esperar que el dropdown esté visible y hacer clic en Editar
    const editButton = page.locator('#producto-actions [data-action-id="edit"]');
    await editButton.waitFor({ state: 'visible', timeout: 3000 });
    await editButton.click();

    // Debe navegar a la ruta de edición del producto
    await page.waitForFunction(() => window.location.hash === `#/productos/${PRODUCTO_ID}/editar`, {
      timeout: 5000,
    });

    expect(page.url()).toContain(`#/productos/${PRODUCTO_ID}/editar`);
  });

  test('formulario de edición está pre-rellenado con datos del producto', async ({ page }) => {
    // Navegar directamente al formulario de edición
    await page.goto(`/#/productos/${PRODUCTO_ID}/editar`);
    await page.waitForSelector('#productos-form', { timeout: 5000 });

    // El formulario debe tener el nombre del producto
    const nombreInput = page.locator('[name="nombre"]');
    await expect(nombreInput).toHaveValue('Teclado Mecánico TKL');

    // El SKU debe estar pre-rellenado
    const skuInput = page.locator('[name="sku"]');
    await expect(skuInput).not.toHaveValue('');
  });

  test('enviar el formulario de edición hace la llamada PUT', async ({ page }) => {
    // Interceptar y capturar la llamada PUT
    const putCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/api/productos/')) {
        putCalls.push(req.url());
      }
    });

    // Navegar al formulario de edición
    await page.goto(`/#/productos/${PRODUCTO_ID}/editar`);
    await page.waitForSelector('#productos-form', { timeout: 5000 });

    // Modificar el nombre del producto
    const nombreInput = page.locator('[name="nombre"]');
    await nombreInput.clear();
    await nombreInput.fill('Teclado Mecánico TKL — Editado');

    // Enviar el formulario
    await page.click('#btn-submit');

    // Esperar a que se realice la llamada PUT
    await page.waitForFunction(() => window.location.hash !== `#/productos/${PRODUCTO_ID}/editar`, {
      timeout: 5000,
    });

    // Verificar que se realizó una llamada PUT al endpoint correcto
    expect(putCalls.length).toBeGreaterThan(0);
    expect(putCalls[0]).toContain(`/api/productos/${PRODUCTO_ID}`);
  });
});

// ── Suite 2: Journey Categorías ───────────────────────────────────────────────
// Cubre: lista → detalle → eliminar con advertencia de impacto → cancelar

test.describe('Journey: Categorías — lista → detalle → eliminar con impacto → cancelar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a categorías muestra la lista con datos', async ({ page }) => {
    // Ir a la lista de categorías
    await page.goto('/#/categorias');
    await page.waitForFunction(() => window.location.hash === '#/categorias', { timeout: 5000 });

    // Esperar que la tabla cargue
    await page.waitForSelector('#table-container tbody tr', { timeout: 5000 });

    // La tabla debe tener al menos una fila
    const rows = page.locator('#table-container tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('hacer clic en una fila navega al detalle de la categoría', async ({ page }) => {
    // Ir a la lista de categorías
    await page.goto('/#/categorias');
    await page.waitForSelector('#table-container tbody tr.cursor-pointer', { timeout: 5000 });

    // Hacer clic en la primera fila clickeable
    await page.locator('#table-container tbody tr.cursor-pointer').first().click();

    // Debe navegar a la ruta de detalle de categoría
    await page.waitForFunction(() => /^#\/categorias\/[^/]+$/.test(window.location.hash), {
      timeout: 5000,
    });

    expect(page.url()).toMatch(/#\/categorias\/[^/]+$/);
  });

  test('detalle de categoría muestra advertencia de impacto cuando tiene productos', async ({
    page,
  }) => {
    // Navegar al detalle de la categoría Periféricos que tiene productos asociados
    // cat-001 es "Periféricos" que tiene múltiples productos en los fixtures
    await page.goto(`/#/categorias/${CATEGORIA_ID}`);
    await page.waitForFunction(() => window.location.hash === `#/categorias/${CATEGORIA_ID}`, {
      timeout: 5000,
    });

    // Esperar que se cargue la página (h1 con nombre de la categoría)
    await page.waitForSelector('h1', { timeout: 5000 });

    // El nombre de la categoría debe ser visible
    await expect(page.locator('h1')).toContainText('Periféricos');

    // La alerta de impacto debe estar visible — indica que hay productos asociados
    const impactWarning = page.locator('#impact-warning');
    await expect(impactWarning).toBeVisible({ timeout: 5000 });

    // El mensaje de impacto debe mencionar la cantidad de productos
    await expect(impactWarning).toContainText('producto');
  });

  test('alerta de impacto muestra la cantidad de productos asociados', async ({ page }) => {
    // Navegar al detalle de Periféricos
    await page.goto(`/#/categorias/${CATEGORIA_ID}`);
    await page.waitForSelector('#impact-warning', { timeout: 5000 });

    // Obtener el texto de la alerta
    const warningText = await page.locator('#impact-warning').textContent();

    // El texto debe contener un número (la cantidad de productos)
    expect(warningText).toMatch(/\d+/);
    expect(warningText).toContain('producto');
  });

  test('cancelar la eliminación no realiza ninguna llamada DELETE', async ({ page }) => {
    // Rastrear llamadas DELETE
    const deleteCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/api/categorias/')) {
        deleteCalls.push(req.url());
      }
    });

    // Navegar al detalle de la categoría
    await page.goto(`/#/categorias/${CATEGORIA_ID}`);
    await page.waitForSelector('#categoria-actions', { timeout: 5000 });

    // Abrir el menú de acciones
    const actionMenuToggle = page.locator('#categoria-actions [data-bs-toggle="dropdown"]');
    await actionMenuToggle.click();

    // Hacer clic en Eliminar para abrir el diálogo de confirmación
    const deleteButton = page.locator('#categoria-actions [data-action-id="delete"]');
    await deleteButton.waitFor({ state: 'visible', timeout: 3000 });
    await deleteButton.click();

    // Esperar a que aparezca el diálogo SweetAlert2
    await page.waitForSelector('.swal2-popup', { timeout: 5000 });

    // El diálogo debe mencionar el conteo de productos en el mensaje de advertencia
    const swalContent = await page.locator('.swal2-html-container').textContent();
    expect(swalContent).toContain('producto');

    // Cancelar el diálogo — hacer clic en "Cancelar"
    const cancelButton = page.locator('.swal2-cancel');
    if ((await cancelButton.count()) > 0) {
      await cancelButton.click();
    } else {
      // Si no hay botón cancelar, usar la tecla Escape
      await page.keyboard.press('Escape');
    }

    // Esperar un momento para asegurarse de que no se realizó ninguna llamada
    await page.waitForTimeout(500);

    // Verificar que NO se realizó ninguna llamada DELETE
    expect(deleteCalls).toHaveLength(0);

    // La URL debe permanecer en el detalle de la categoría
    expect(page.url()).toContain(`#/categorias/${CATEGORIA_ID}`);
  });

  test('el diálogo de eliminación muestra el mensaje con el número de productos', async ({
    page,
  }) => {
    // Navegar al detalle de Periféricos
    await page.goto(`/#/categorias/${CATEGORIA_ID}`);
    await page.waitForSelector('#categoria-actions', { timeout: 5000 });

    // Abrir menú y hacer clic en Eliminar
    await page.locator('#categoria-actions [data-bs-toggle="dropdown"]').click();

    const deleteButton = page.locator('#categoria-actions [data-action-id="delete"]');
    await deleteButton.waitFor({ state: 'visible', timeout: 3000 });
    await deleteButton.click();

    // Esperar el diálogo SweetAlert2
    await page.waitForSelector('.swal2-popup', { timeout: 5000 });

    // El mensaje del diálogo debe incluir información sobre los productos impactados
    const htmlContent = await page.locator('.swal2-html-container').textContent();
    // El mensaje construido en buildDeleteMessage() incluye el productoCount
    expect(htmlContent).toMatch(/\d+ producto/);

    // Cerrar el diálogo con Escape para no afectar otros tests
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
});
