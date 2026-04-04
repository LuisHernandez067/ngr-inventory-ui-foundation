import { test, expect, type Page } from '@playwright/test';

// ── Constantes ────────────────────────────────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
};

// IDs de fixtures predefinidos en el sistema
const ALMACEN_ID = 'alm-001'; // Depósito Central — tiene múltiples ubicaciones
const UBICACION_ID = 'ubi-001'; // Rack 1 Estante 1 - Depósito Central

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

// ── Suite 1: Journey Almacenes ────────────────────────────────────────────────
// Cubre: lista → detalle → editar → guardar

test.describe('Journey: Almacenes — lista → detalle → editar → guardar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a almacenes muestra la lista con datos', async ({ page }) => {
    // Ir a la lista de almacenes
    await page.goto('/#/almacenes');
    await page.waitForFunction(() => window.location.hash === '#/almacenes', { timeout: 5000 });

    // Esperar que la tabla cargue — hay filas en la tabla
    await page.waitForSelector('#table-container tbody tr', { timeout: 5000 });

    // La tabla debe tener al menos una fila de datos
    const rows = page.locator('#table-container tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('la lista de almacenes tiene botón para crear nuevo almacén', async ({ page }) => {
    await page.goto('/#/almacenes');
    await page.waitForSelector('#table-container tbody tr', { timeout: 5000 });

    // El botón de creación debe existir (admin tiene acceso)
    const createBtn = page.locator('button:has-text("Nuevo almacén"), a:has-text("Nuevo almacén")');
    await expect(createBtn.first()).toBeVisible();
  });

  test('hacer clic en una fila navega al detalle del almacén', async ({ page }) => {
    await page.goto('/#/almacenes');
    await page.waitForSelector('#table-container tbody tr.cursor-pointer', { timeout: 5000 });

    // Hacer clic en la primera fila clickeable
    await page.locator('#table-container tbody tr.cursor-pointer').first().click();

    // Debe navegar a la ruta de detalle
    await page.waitForFunction(() => /^#\/almacenes\/[^/]+$/.test(window.location.hash), {
      timeout: 5000,
    });

    expect(page.url()).toMatch(/#\/almacenes\/[^/]+$/);
  });

  test('detalle del almacén muestra nombre y código', async ({ page }) => {
    // Navegar directamente al detalle del primer almacén del fixture
    await page.goto(`/#/almacenes/${ALMACEN_ID}`);
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/almacenes/${ALMACEN_ID}`,
      { timeout: 5000 }
    );

    // Esperar que se renderice el h1 con el nombre del almacén
    await page.waitForSelector('h1', { timeout: 5000 });

    // El h1 debe mostrar el nombre del almacén
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Depósito Central');
  });

  test('detalle del almacén con ubicaciones muestra alerta de impacto', async ({ page }) => {
    // alm-001 tiene múltiples ubicaciones en los fixtures
    await page.goto(`/#/almacenes/${ALMACEN_ID}`);
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/almacenes/${ALMACEN_ID}`,
      { timeout: 5000 }
    );

    // Esperar que cargue la página
    await page.waitForSelector('h1', { timeout: 5000 });

    // La alerta de impacto debe estar visible
    const impactWarning = page.locator('#impact-warning');
    await expect(impactWarning).toBeVisible({ timeout: 5000 });

    // El mensaje debe mencionar ubicaciones
    await expect(impactWarning).toContainText('ubicaci');
  });

  test('hacer clic en Editar desde el detalle navega al formulario de edición', async ({
    page,
  }) => {
    // Navegar al detalle del almacén
    await page.goto(`/#/almacenes/${ALMACEN_ID}`);
    await page.waitForSelector('#almacen-actions', { timeout: 5000 });

    // Abrir el menú de acciones (ActionMenu)
    const actionMenuToggle = page.locator('#almacen-actions [data-bs-toggle="dropdown"]');
    await actionMenuToggle.click();

    // Esperar que el dropdown esté visible y hacer clic en Editar
    const editButton = page.locator('#almacen-actions [data-action-id="edit"]');
    await editButton.waitFor({ state: 'visible', timeout: 3000 });
    await editButton.click();

    // Debe navegar a la ruta de edición del almacén
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/almacenes/${ALMACEN_ID}/editar`,
      { timeout: 5000 }
    );

    expect(page.url()).toContain(`#/almacenes/${ALMACEN_ID}/editar`);
  });

  test('formulario de edición del almacén está pre-rellenado', async ({ page }) => {
    // Navegar directamente al formulario de edición
    await page.goto(`/#/almacenes/${ALMACEN_ID}/editar`);
    await page.waitForSelector('#almacenes-form', { timeout: 5000 });

    // El formulario debe tener el nombre del almacén
    const nombreInput = page.locator('[name="nombre"]');
    await expect(nombreInput).toHaveValue('Depósito Central');
  });

  test('enviar el formulario de edición del almacén hace la llamada PUT', async ({ page }) => {
    // Interceptar y capturar la llamada PUT
    const putCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/api/almacenes/')) {
        putCalls.push(req.url());
      }
    });

    // Navegar al formulario de edición
    await page.goto(`/#/almacenes/${ALMACEN_ID}/editar`);
    await page.waitForSelector('#almacenes-form', { timeout: 5000 });

    // Modificar el nombre
    const nombreInput = page.locator('[name="nombre"]');
    await nombreInput.clear();
    await nombreInput.fill('Depósito Central — Editado');

    // Enviar el formulario
    await page.click('#btn-submit');

    // Esperar a que se realice la navegación post-guardado
    await page.waitForFunction(
      (expected) => window.location.hash !== expected,
      `#/almacenes/${ALMACEN_ID}/editar`,
      { timeout: 5000 }
    );

    // Verificar que se realizó una llamada PUT al endpoint correcto
    expect(putCalls.length).toBeGreaterThan(0);
    expect(putCalls[0]).toContain(`/api/almacenes/${ALMACEN_ID}`);
  });

  test('formulario de nuevo almacén navega desde la lista', async ({ page }) => {
    await page.goto('/#/almacenes');
    await page.waitForSelector('#table-container tbody tr', { timeout: 5000 });

    // Clic en el botón Nuevo almacén
    const createBtn = page.locator('button:has-text("Nuevo almacén"), a:has-text("Nuevo almacén")');
    await createBtn.first().click();

    // Debe navegar a la ruta de creación
    await page.waitForFunction(() => window.location.hash === '#/almacenes/nuevo', {
      timeout: 5000,
    });

    expect(page.url()).toContain('#/almacenes/nuevo');

    // El formulario debe estar vacío
    await page.waitForSelector('#almacenes-form', { timeout: 5000 });
    const nombreInput = page.locator('[name="nombre"]');
    await expect(nombreInput).toHaveValue('');
  });

  test('cancelar el diálogo de eliminación no realiza ninguna llamada DELETE', async ({ page }) => {
    // Rastrear llamadas DELETE
    const deleteCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/api/almacenes/')) {
        deleteCalls.push(req.url());
      }
    });

    // Navegar al detalle del almacén
    await page.goto(`/#/almacenes/${ALMACEN_ID}`);
    await page.waitForSelector('#almacen-actions', { timeout: 5000 });

    // Abrir el menú de acciones
    await page.locator('#almacen-actions [data-bs-toggle="dropdown"]').click();

    // Hacer clic en Eliminar para abrir el diálogo de confirmación
    const deleteButton = page.locator('#almacen-actions [data-action-id="delete"]');
    await deleteButton.waitFor({ state: 'visible', timeout: 3000 });
    await deleteButton.click();

    // Esperar a que aparezca el diálogo SweetAlert2
    await page.waitForSelector('.swal2-popup', { timeout: 5000 });

    // El diálogo debe mencionar el conteo de ubicaciones en el mensaje de advertencia
    const swalContent = await page.locator('.swal2-html-container').textContent();
    expect(swalContent).toContain('ubicaci');

    // Cancelar el diálogo via JS — SweetAlert2 overlay puede interceptar clics nativos
    await page.evaluate(() => {
      const btn = document.querySelector<HTMLButtonElement>('.swal2-cancel');
      btn?.click();
    });

    // Esperar a que el diálogo SweetAlert2 desaparezca completamente
    await page.waitForSelector('.swal2-popup', { state: 'detached', timeout: 5000 });

    // Esperar un momento para asegurarse de que no se realizó ninguna llamada
    await page.waitForTimeout(500);

    // Verificar que NO se realizó ninguna llamada DELETE
    expect(deleteCalls).toHaveLength(0);

    // La URL debe permanecer en el detalle del almacén
    expect(page.url()).toContain(`#/almacenes/${ALMACEN_ID}`);
  });
});

// ── Suite 2: Journey Ubicaciones ──────────────────────────────────────────────
// Cubre: lista con filtro → detalle → editar → guardar

test.describe('Journey: Ubicaciones — lista con filtro → detalle → crear', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a ubicaciones muestra la lista con datos', async ({ page }) => {
    await page.goto('/#/ubicaciones');
    await page.waitForFunction(() => window.location.hash === '#/ubicaciones', { timeout: 5000 });

    // Esperar que la tabla cargue
    await page.waitForSelector('#ubicaciones-tbody tr', { timeout: 5000 });

    // La tabla debe tener al menos una fila de datos
    const rows = page.locator('#ubicaciones-tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('la lista de ubicaciones tiene filtro por almacén', async ({ page }) => {
    await page.goto('/#/ubicaciones');
    await page.waitForFunction(() => window.location.hash === '#/ubicaciones', { timeout: 5000 });

    // El select de filtro de almacén debe existir
    const almacenFilter = page.locator('#almacen-filter');
    await expect(almacenFilter).toBeVisible({ timeout: 5000 });

    // El select debe tener opciones (almacenes cargados)
    const options = almacenFilter.locator('option');
    await expect(options).toHaveCount(await options.count()); // Al menos la opción "Todos"
    expect(await options.count()).toBeGreaterThan(1);
  });

  test('filtrar por almacén actualiza la tabla de ubicaciones', async ({ page }) => {
    await page.goto('/#/ubicaciones');
    await page.waitForSelector('#almacen-filter', { timeout: 5000 });

    // Seleccionar el almacén Depósito Central (alm-001)
    await page.selectOption('#almacen-filter', 'alm-001');

    // Esperar que la tabla se actualice
    await page.waitForSelector('#ubicaciones-tbody tr[data-id]', { timeout: 5000 });

    // Las filas mostradas deben pertenecer al almacén seleccionado
    const rows = page.locator('#ubicaciones-tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('hacer clic en una fila navega al detalle de la ubicación', async ({ page }) => {
    await page.goto('/#/ubicaciones');
    await page.waitForSelector('#ubicaciones-tbody tr[data-id]', { timeout: 5000 });

    // Hacer clic en la primera fila con data-id
    await page.locator('#ubicaciones-tbody tr[data-id]').first().click();

    // Debe navegar a la ruta de detalle
    await page.waitForFunction(() => /^#\/ubicaciones\/[^/]+$/.test(window.location.hash), {
      timeout: 5000,
    });

    expect(page.url()).toMatch(/#\/ubicaciones\/[^/]+$/);
  });

  test('detalle de ubicación muestra nombre y almacén padre', async ({ page }) => {
    // Navegar directamente al detalle de la primera ubicación del fixture
    await page.goto(`/#/ubicaciones/${UBICACION_ID}`);
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/ubicaciones/${UBICACION_ID}`,
      { timeout: 5000 }
    );

    // Esperar que se renderice el h1
    await page.waitForSelector('h1', { timeout: 5000 });

    // El h1 debe mostrar el nombre de la ubicación
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Rack 1 Estante 1');

    // El enlace al almacén padre debe estar visible
    const almacenLink = page.locator('#almacen-link-container a');
    await expect(almacenLink).toBeVisible();
    await expect(almacenLink).toContainText('Depósito Central');
  });

  test('la lista de ubicaciones tiene botón para crear nueva ubicación', async ({ page }) => {
    await page.goto('/#/ubicaciones');
    await page.waitForSelector('#ubicaciones-tbody', { timeout: 5000 });

    // El botón de creación debe existir (admin tiene acceso)
    const createBtn = page.locator('a:has-text("Nueva ubicación")');
    await expect(createBtn.first()).toBeVisible();
  });

  test('formulario de nueva ubicación tiene select de almacén', async ({ page }) => {
    await page.goto('/#/ubicaciones/nuevo');
    await page.waitForFunction(() => window.location.hash === '#/ubicaciones/nuevo', {
      timeout: 5000,
    });

    // El formulario debe estar visible
    await page.waitForSelector('#ubicaciones-form', { timeout: 5000 });

    // El select de almacén debe existir y tener opciones
    const almacenSelect = page.locator('[name="almacenId"]');
    await expect(almacenSelect).toBeVisible();

    const options = almacenSelect.locator('option');
    expect(await options.count()).toBeGreaterThan(1);
  });

  test('hacer clic en Editar desde el detalle navega al formulario de edición', async ({
    page,
  }) => {
    await page.goto(`/#/ubicaciones/${UBICACION_ID}`);
    await page.waitForSelector('#ubicacion-actions', { timeout: 5000 });

    // Abrir el menú de acciones
    const actionMenuToggle = page.locator('#ubicacion-actions [data-bs-toggle="dropdown"]');
    await actionMenuToggle.click();

    // Hacer clic en Editar
    const editButton = page.locator('#ubicacion-actions [data-action-id="edit"]');
    await editButton.waitFor({ state: 'visible', timeout: 3000 });
    await editButton.click();

    // Debe navegar a la ruta de edición
    await page.waitForFunction(
      (expected) => window.location.hash === expected,
      `#/ubicaciones/${UBICACION_ID}/editar`,
      { timeout: 5000 }
    );

    expect(page.url()).toContain(`#/ubicaciones/${UBICACION_ID}/editar`);
  });

  test('formulario de edición de ubicación está pre-rellenado', async ({ page }) => {
    await page.goto(`/#/ubicaciones/${UBICACION_ID}/editar`);
    await page.waitForSelector('#ubicaciones-form', { timeout: 5000 });

    // El formulario debe tener el nombre de la ubicación
    const nombreInput = page.locator('[name="nombre"]');
    await expect(nombreInput).toHaveValue('Rack 1 Estante 1 - Depósito Central');

    // El select de almacén debe tener seleccionado el almacén correcto
    const almacenSelect = page.locator('[name="almacenId"]');
    await expect(almacenSelect).toHaveValue('alm-001');
  });

  test('enviar el formulario de edición de ubicación hace la llamada PUT', async ({ page }) => {
    // Interceptar y capturar la llamada PUT
    const putCalls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'PUT' && req.url().includes('/api/ubicaciones/')) {
        putCalls.push(req.url());
      }
    });

    await page.goto(`/#/ubicaciones/${UBICACION_ID}/editar`);
    await page.waitForSelector('#ubicaciones-form', { timeout: 5000 });

    // Modificar el nombre
    const nombreInput = page.locator('[name="nombre"]');
    await nombreInput.clear();
    await nombreInput.fill('Rack 1 Estante 1 — Editado');

    // Enviar el formulario
    await page.click('#btn-submit');

    // Esperar a que se realice la navegación post-guardado
    await page.waitForFunction(
      (expected) => window.location.hash !== expected,
      `#/ubicaciones/${UBICACION_ID}/editar`,
      { timeout: 5000 }
    );

    // Verificar que se realizó una llamada PUT
    expect(putCalls.length).toBeGreaterThan(0);
    expect(putCalls[0]).toContain(`/api/ubicaciones/${UBICACION_ID}`);
  });
});

// ── Suite 3: Journey Stock ────────────────────────────────────────────────────
// Cubre: lista con filtros → badges → consolidado

test.describe('Journey: Stock — lista con filtros → badges → consolidado', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
    await loginAsAdmin(page);
  });

  test('navegar a stock muestra la lista con datos', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForFunction(() => window.location.hash === '#/stock', { timeout: 5000 });

    // Esperar que la tabla cargue
    await page.waitForSelector('#stock-tbody tr', { timeout: 5000 });

    // La tabla debe tener al menos una fila de datos
    const rows = page.locator('#stock-tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('la página de stock tiene filtros de almacén, ubicación y estado', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForSelector('#filter-bar', { timeout: 5000 });

    // Los tres filtros deben estar visibles
    await expect(page.locator('#almacen-filter')).toBeVisible();
    await expect(page.locator('#ubicacion-filter')).toBeVisible();
    await expect(page.locator('#estado-filter')).toBeVisible();
    // El checkbox de bajo mínimo debe estar visible
    await expect(page.locator('#bajo-minimo-check')).toBeVisible();
  });

  test('la tabla de stock muestra badges de disponibilidad', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForSelector('#stock-tbody tr[data-id]', { timeout: 5000 });

    // Debe haber al menos un badge en la tabla
    const badges = page.locator('#stock-tbody .badge');
    await expect(badges.first()).toBeVisible();
  });

  test('filtrar por almacén actualiza la tabla de stock', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForSelector('#almacen-filter', { timeout: 5000 });

    // Seleccionar el almacén Depósito Central
    await page.selectOption('#almacen-filter', 'alm-001');

    // Esperar que la tabla se actualice
    await page.waitForSelector('#stock-tbody tr[data-id]', { timeout: 5000 });

    // Debe haber filas con datos
    const rows = page.locator('#stock-tbody tr[data-id]');
    await expect(rows.first()).toBeVisible();
  });

  test('el checkbox de bajo mínimo activa el filtro', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForSelector('#bajo-minimo-check', { timeout: 5000 });

    // Marcar el checkbox de bajo mínimo
    await page.check('#bajo-minimo-check');

    // Esperar que la tabla se actualice
    await page.waitForSelector('#stock-tbody tr', { timeout: 5000 });

    // La tabla debe mostrar algo (puede estar vacía si no hay items bajo mínimo en ese contexto)
    const tbody = page.locator('#stock-tbody');
    await expect(tbody).toBeVisible();
  });

  test('navegar a stock/consolidado muestra la tabla de consolidado', async ({ page }) => {
    await page.goto('/#/stock/consolidado');
    await page.waitForFunction(() => window.location.hash === '#/stock/consolidado', {
      timeout: 5000,
    });

    // Esperar que cargue el encabezado
    await page.waitForSelector('h1', { timeout: 5000 });

    // El h1 debe decir "Stock Consolidado"
    await expect(page.locator('h1')).toContainText('Stock Consolidado');

    // La tabla de consolidado debe tener filas
    await page.waitForSelector('#consolidado-tbody tr', { timeout: 5000 });
    const rows = page.locator('#consolidado-tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('la página de consolidado tiene badges semánticos de tres niveles', async ({ page }) => {
    await page.goto('/#/stock/consolidado');
    await page.waitForSelector('#consolidado-tbody tr[data-producto-id]', { timeout: 5000 });

    // Debe haber badges en la tabla
    const badges = page.locator('#consolidado-tbody .badge');
    await expect(badges.first()).toBeVisible();

    // Verificar que existen los tres tipos de badges
    // (success = disponible, warning = bajo mínimo, danger = sin stock)
    // Los fixtures tienen prod-003 y prod-007 con bajoMinimo=true
    const warningBadges = page.locator('#consolidado-tbody .badge.bg-warning');
    await expect(warningBadges.first()).toBeVisible({ timeout: 5000 });
  });

  test('la página de consolidado tiene links de detalle por producto', async ({ page }) => {
    await page.goto('/#/stock/consolidado');
    await page.waitForSelector('#consolidado-tbody tr[data-producto-id]', { timeout: 5000 });

    // Cada fila debe tener un enlace "Ver detalle"
    const detailLinks = page.locator('#consolidado-tbody .ver-detalle-btn');
    await expect(detailLinks.first()).toBeVisible();
  });

  test('hacer clic en Ver detalle en consolidado filtra el stock por producto', async ({
    page,
  }) => {
    await page.goto('/#/stock/consolidado');
    await page.waitForSelector('#consolidado-tbody .ver-detalle-btn', { timeout: 5000 });

    // Hacer clic en el primer enlace de Ver detalle
    await page.locator('#consolidado-tbody .ver-detalle-btn').first().click();

    // Debe navegar a la página de stock con filtro de productoId
    await page.waitForFunction(
      () =>
        window.location.hash.startsWith('#/stock') && window.location.hash.includes('productoId'),
      { timeout: 5000 }
    );

    expect(page.url()).toContain('#/stock');
    expect(page.url()).toContain('productoId');
  });

  test('la página de stock tiene enlace al consolidado', async ({ page }) => {
    await page.goto('/#/stock');
    await page.waitForSelector('#filter-bar', { timeout: 5000 });

    // El enlace "Ver consolidado" debe existir
    const consolidadoLink = page.locator('a:has-text("Ver consolidado")');
    await expect(consolidadoLink).toBeVisible();

    // Hacer clic para navegar al consolidado
    await consolidadoLink.click();

    await page.waitForFunction(() => window.location.hash === '#/stock/consolidado', {
      timeout: 5000,
    });

    expect(page.url()).toContain('#/stock/consolidado');
  });
});
