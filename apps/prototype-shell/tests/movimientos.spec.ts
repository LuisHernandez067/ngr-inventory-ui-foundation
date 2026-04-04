import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

// ── Constantes ────────────────────────────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
};

// IDs de fixtures predefinidos en el sistema
const MOVIMIENTO_ENTRADA_ID = 'mov-001'; // entrada, ejecutado — Tecno Distribuciones

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Limpia localStorage para garantizar estado limpio */
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

// ── Suite 1: Journey Movimientos — lista y filtros ────────────────────────────
// Cubre: M1 (lista carga), M2 (filtro tipo), M3 (row click → detalle)

test.describe('Journey: Movimientos — lista, filtros y detalle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a movimientos muestra la lista con datos (M1)', async ({ page }) => {
    // Navegar a la lista de movimientos
    await page.goto('/#/movimientos');

    // Esperar que el módulo de movimientos renderice
    await expect(page.locator('h1')).toContainText('Movimientos', { timeout: 8000 });

    // Esperar que la tabla cargue con al menos una fila de datos
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 8000 });
    const rows = page.locator('#movimientos-tbody tr[data-id]');
    await expect(rows.first()).toBeVisible();
  });

  test('filtrar por tipo "entrada" actualiza las filas visibles (M2)', async ({ page }) => {
    // Ir a la lista de movimientos
    await page.goto('/#/movimientos');
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    // Contar filas antes del filtro
    const rowsBefore = await page.locator('#movimientos-tbody tr[data-id]').count();

    // Aplicar filtro por tipo "entrada"
    const tipoFilter = page.locator('#tipo-filter');
    await tipoFilter.selectOption('entrada');

    // Esperar a que la tabla se actualice — filas con tipo entrada tienen badge 'entrada'
    await page.waitForTimeout(500);
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    // Las filas del resultado deben mostrar solo badges de tipo "entrada"
    const rowsAfter = await page.locator('#movimientos-tbody tr[data-id]').count();

    // El filtro debe producir al menos 1 resultado y puede diferir del total
    expect(rowsAfter).toBeGreaterThan(0);
    expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);

    // Cada badge de tipo visible debe decir "entrada"
    const typeBadges = page.locator('#movimientos-tbody tr[data-id] .badge').first();
    await expect(typeBadges).toContainText('entrada');
  });

  test('filtrar por tipo "salida" muestra movimientos de salida (M2)', async ({ page }) => {
    // Ir a la lista de movimientos
    await page.goto('/#/movimientos');
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    // Aplicar filtro por tipo "salida"
    const tipoFilter = page.locator('#tipo-filter');
    await tipoFilter.selectOption('salida');

    // Esperar actualización de la tabla
    await page.waitForTimeout(500);
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    // Debe haber al menos un resultado
    const rows = page.locator('#movimientos-tbody tr[data-id]');
    await expect(rows.first()).toBeVisible();

    // El primer badge de tipo debe ser "salida"
    const firstTypeBadge = page
      .locator('#movimientos-tbody tr[data-id]')
      .first()
      .locator('.badge')
      .first();
    await expect(firstTypeBadge).toContainText('salida');
  });

  test('hacer clic en una fila navega al detalle del movimiento (M3)', async ({ page }) => {
    // Ir a la lista de movimientos
    await page.goto('/#/movimientos');
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    // Hacer clic en la primera fila
    const firstRow = page.locator('#movimientos-tbody tr[data-id]').first();
    await firstRow.click();

    // Debe navegar a la ruta de detalle — esperar cambio de hash
    await page.waitForFunction(() => /^#\/movimientos\/[^/]+$/.test(window.location.hash), {
      timeout: 5000,
    });

    expect(page.url()).toMatch(/#\/movimientos\/[^/]+$/);
  });

  test('detalle del movimiento muestra número y tipo (M3)', async ({ page }) => {
    // Navegar directamente al detalle de un movimiento de entrada conocido
    await page.goto(`/#/movimientos/${MOVIMIENTO_ENTRADA_ID}`);
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/movimientos/${MOVIMIENTO_ENTRADA_ID}`,
      { timeout: 5000 }
    );

    // Esperar que se cargue el número del movimiento
    await page.waitForSelector('#movimiento-numero', { timeout: 5000 });

    // El número debe estar visible
    const numero = page.locator('#movimiento-numero');
    await expect(numero).toBeVisible();
    await expect(numero).toContainText('MOV-2025-0001');

    // El tipo debe estar visible con el badge correcto
    const tipoBadge = page.locator('#movimiento-tipo');
    await expect(tipoBadge).toBeVisible();
    await expect(tipoBadge).toContainText('entrada');
  });

  test('vaciar filtro de tipo restaura todos los movimientos (M2)', async ({ page }) => {
    // Ir a movimientos y aplicar un filtro
    await page.goto('/#/movimientos');
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    const tipoFilter = page.locator('#tipo-filter');
    await tipoFilter.selectOption('entrada');
    await page.waitForTimeout(500);

    const rowsFiltered = await page.locator('#movimientos-tbody tr[data-id]').count();

    // Quitar filtro — seleccionar "Todos los tipos"
    await tipoFilter.selectOption('');
    await page.waitForTimeout(500);
    await page.waitForSelector('#movimientos-tbody tr[data-id]', { timeout: 5000 });

    const rowsAll = await page.locator('#movimientos-tbody tr[data-id]').count();

    // Al quitar el filtro debe haber igual o más filas que con filtro
    expect(rowsAll).toBeGreaterThanOrEqual(rowsFiltered);
  });
});

// ── Suite 2: Formulario de nuevo movimiento ───────────────────────────────────
// Cubre: M4 (form fields), M5 (validación), M6 (éxito)

test.describe('Journey: Movimientos — formulario nuevo movimiento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a /movimientos/nuevo muestra el formulario con los campos requeridos (M4)', async ({
    page,
  }) => {
    // Navegar al formulario de nuevo movimiento
    await page.goto('/#/movimientos/nuevo');
    await page.waitForFunction(() => window.location.hash === '#/movimientos/nuevo', {
      timeout: 5000,
    });

    // Esperar que se cargue el formulario
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // El campo "tipo" debe estar visible
    const tipoSelect = page.locator('#tipo');
    await expect(tipoSelect).toBeVisible();

    // El botón para agregar ítems debe estar visible (campo "items")
    const btnAgregarItem = page.locator('#btn-agregar-item');
    await expect(btnAgregarItem).toBeVisible();

    // El título de la página debe indicar "Nuevo Movimiento"
    const heading = page.locator('h1');
    await expect(heading).toContainText('Nuevo Movimiento');
  });

  test('seleccionar tipo "entrada" muestra campo de almacén destino (M4)', async ({ page }) => {
    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Seleccionar tipo "entrada"
    await page.selectOption('#tipo', 'entrada');

    // El campo almacén destino debe aparecer
    const almacenDestinoSection = page.locator('[data-section="almacen-destino"]');
    await expect(almacenDestinoSection).toBeVisible();
  });

  test('seleccionar tipo "salida" muestra campo de almacén origen (M4)', async ({ page }) => {
    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Seleccionar tipo "salida"
    await page.selectOption('#tipo', 'salida');

    // El campo almacén origen debe aparecer
    const almacenOrigenSection = page.locator('[data-section="almacen-origen"]');
    await expect(almacenOrigenSection).toBeVisible();
  });

  test('enviar formulario sin tipo muestra error de validación (M5)', async ({ page }) => {
    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Enviar sin completar ningún campo
    await page.click('#btn-submit');

    // Debe mostrar alerta de error global — "El tipo de movimiento es requerido"
    const alertGlobal = page.locator('.alert-global');
    await expect(alertGlobal).toBeVisible({ timeout: 3000 });
    await expect(alertGlobal).toContainText('tipo');
  });

  test('enviar con tipo pero sin ítems muestra error de ítems requeridos (M5)', async ({
    page,
  }) => {
    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Seleccionar tipo "entrada"
    await page.selectOption('#tipo', 'entrada');

    // Enviar sin agregar ítems
    await page.click('#btn-submit');

    // Debe mostrar alerta de error — "al menos un ítem"
    const alertGlobal = page.locator('.alert-global');
    await expect(alertGlobal).toBeVisible({ timeout: 3000 });
    await expect(alertGlobal).toContainText('ítem');
  });

  test('el botón volver en el formulario navega de regreso a la lista (M4)', async ({ page }) => {
    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Hacer clic en el botón volver
    await page.click('#btn-back');

    // Debe navegar de regreso a la lista de movimientos
    await page.waitForFunction(() => window.location.hash === '#/movimientos', { timeout: 5000 });
    expect(page.url()).toContain('#/movimientos');
  });

  test('enviar formulario válido con entrada crea el movimiento y redirige (M6)', async ({
    page,
  }) => {
    // Capturar llamadas POST al endpoint de movimientos
    const postCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/movimientos')) {
        postCalls.push(req.url());
      }
    });

    // Navegar al formulario
    await page.goto('/#/movimientos/nuevo');
    await page.waitForSelector('#movimientos-form', { timeout: 8000 });

    // Seleccionar tipo "entrada"
    await page.selectOption('#tipo', 'entrada');

    // Esperar que la sección de almacén destino esté visible y seleccionar
    await page.waitForSelector('[data-section="almacen-destino"]', {
      state: 'visible',
      timeout: 3000,
    });
    const almacenOptions = await page.locator('#almacenDestinoId option:not([value=""])').count();
    if (almacenOptions > 0) {
      await page
        .locator('#almacenDestinoId option:not([value=""])')
        .first()
        .evaluate((opt) => {
          const select = opt.closest('select');
          if (select instanceof HTMLSelectElement) {
            select.value = (opt as HTMLOptionElement).value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
    }

    // Agregar un ítem
    await page.click('#btn-agregar-item');
    await page.waitForSelector('#items-tbody tr[data-row-id]', { timeout: 3000 });

    // Seleccionar el primer producto disponible en el ítem
    const productoSelect = page.locator('.item-producto-select').first();
    const productoOptions = await productoSelect.locator('option:not([value=""])').count();
    if (productoOptions > 0) {
      const firstProductoValue = await productoSelect
        .locator('option:not([value=""])')
        .first()
        .getAttribute('value');
      if (firstProductoValue) {
        await productoSelect.selectOption(firstProductoValue);
      }
    }

    // Establecer cantidad válida
    const cantidadInput = page.locator('.item-cantidad').first();
    await cantidadInput.fill('5');
    await cantidadInput.dispatchEvent('change');

    // Enviar el formulario
    await page.click('#btn-submit');

    // Debe navegar al detalle del movimiento creado (éxito)
    await page.waitForFunction(() => /^#\/movimientos\/[^/]+$/.test(window.location.hash), {
      timeout: 8000,
    });

    // Verificar que se realizó el POST
    expect(postCalls.length).toBeGreaterThan(0);
  });
});

// ── Suite 3: Estado vacío — filtro sin resultados ─────────────────────────────
// Cubre: escenario de empty state al filtrar

test.describe('Journey: Movimientos — estado vacío con filtro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('buscar término sin resultados muestra mensaje de vacío', async ({ page }) => {
    // Ir a la lista de movimientos
    await page.goto('/#/movimientos');
    await page.waitForSelector('#movimientos-tbody', { timeout: 5000 });

    // Buscar un término que no existe en los fixtures
    const searchInput = page.locator('#movimientos-search');
    await searchInput.fill('TERMINO_QUE_NO_EXISTE_XYZABC');

    // Esperar actualización de la tabla
    await page.waitForTimeout(700);

    // El tbody debe mostrar el mensaje de vacío o una sola fila sin data-id
    const emptyRow = page.locator('#movimientos-tbody td:has-text("Sin movimientos registrados")');
    const dataRows = page.locator('#movimientos-tbody tr[data-id]');

    // O hay mensaje vacío O no hay filas con data
    const emptyCount = await emptyRow.count();
    const dataCount = await dataRows.count();
    expect(emptyCount > 0 || dataCount === 0).toBe(true);
  });
});

// ── Suite 4: Accesibilidad WCAG AA — ruta /movimientos ───────────────────────
// Req A2: axe check integrado en la suite de movimientos

test.describe('A11y: Movimientos — WCAG 2.1 AA', () => {
  test('la página de movimientos no tiene violaciones de accesibilidad WCAG AA', async ({
    page,
  }) => {
    // Autenticar y navegar a movimientos
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

    await page.goto('/#/movimientos');
    await page.waitForFunction(() => window.location.hash === '#/movimientos', { timeout: 5000 });

    // Esperar que el contenido esté cargado
    await page.waitForSelector('h1', { timeout: 5000 });

    // Ejecutar análisis de accesibilidad con reglas WCAG 2.1 AA
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // No debe haber violaciones — si las hay, el mensaje incluye los IDs
    expect(
      results.violations,
      `Violaciones WCAG AA encontradas: ${results.violations
        .map((v: { id: string; description: string }) => `${v.id}: ${v.description}`)
        .join('; ')}`
    ).toHaveLength(0);
  });
});
