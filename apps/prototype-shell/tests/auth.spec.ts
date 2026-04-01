import { test, expect, type Page } from '@playwright/test';

// ── Credenciales de los usuarios de demo ──────────────────────────────────────

const USERS = {
  admin: { email: 'administrador@ngr.com', password: 'admin123' },
  operador: { email: 'operador@ngr.com', password: 'operador123' },
  consulta: { email: 'consulta@ngr.com', password: 'consulta123' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Limpia localStorage y navega a la base URL para garantizar estado limpio */
async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/** Completa el formulario de login y hace submit */
async function loginAs(page: Page, user: { email: string; password: string }): Promise<void> {
  await page.fill('#login-email', user.email);
  await page.fill('#login-password', user.password);
  await page.click('#login-submit');
}

// ── Suite de autenticación ────────────────────────────────────────────────────

test.describe('Autenticación — flujos E2E', () => {
  // Antes de cada test: navegar a la raíz y limpiar storage
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearAuth(page);
  });

  // ── 1. Redirección cuando no está autenticado ────────────────────────────────

  test.describe('Redirección a login sin autenticación', () => {
    test('navegar a / sin sesión debe redirigir a #/auth', async ({ page }) => {
      // Limpiar storage y navegar
      await page.evaluate(() => localStorage.clear());
      await page.goto('/');

      // Esperar a que el hash cambie a /auth
      await page.waitForFunction(() => window.location.hash === '#/auth', { timeout: 5000 });

      expect(page.url()).toContain('#/auth');
    });

    test('navegar a #/dashboard sin sesión debe redirigir a #/auth', async ({ page }) => {
      await page.evaluate(() => localStorage.clear());
      await page.goto('/#/dashboard');

      await page.waitForFunction(() => window.location.hash === '#/auth', { timeout: 5000 });

      expect(page.url()).toContain('#/auth');
    });
  });

  // ── 2. Login con credenciales de administrador ───────────────────────────────

  test.describe('Login con usuario administrador', () => {
    test('debe navegar al dashboard y mostrar el nombre del usuario', async ({ page }) => {
      await page.goto('/#/auth');

      // Esperar a que el formulario de login esté visible
      await page.waitForSelector('#login-form', { timeout: 5000 });

      // Completar y enviar el formulario
      await loginAs(page, USERS.admin);

      // El login simula 1200ms de latencia — esperar navegación al dashboard
      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      expect(page.url()).toContain('#/dashboard');

      // El heading del dashboard debe ser visible
      await expect(page.locator('h1')).toContainText('Dashboard');

      // La navbar debe mostrar el nombre del administrador
      await expect(page.locator('#navbar-user')).toContainText('Ana García');
    });

    test('una vez autenticado, ir a #/auth debe redirigir al dashboard', async ({ page }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });
      await loginAs(page, USERS.admin);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      // Intentar navegar al login estando autenticado
      await page.goto('/#/auth');

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      expect(page.url()).toContain('#/dashboard');
    });
  });

  // ── 3. Login con usuario operador ────────────────────────────────────────────

  test.describe('Login con usuario operador', () => {
    test('debe navegar al dashboard correctamente', async ({ page }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });

      await loginAs(page, USERS.operador);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      expect(page.url()).toContain('#/dashboard');
      await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('debe poder navegar a #/productos', async ({ page }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });

      await loginAs(page, USERS.operador);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      // Navegar a productos — módulo permitido para operador
      await page.goto('/#/productos');

      await page.waitForFunction(() => window.location.hash === '#/productos', { timeout: 5000 });

      // Debe renderizar la página de productos (no redirigir)
      expect(page.url()).toContain('#/productos');
    });

    test('navegar a #/usuarios debe renderizar la página (el router no bloquea por módulo)', async ({
      page,
    }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });

      await loginAs(page, USERS.operador);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      // Navegar a usuarios — operador está autenticado, el router permite el acceso
      // (el filtro de módulos aplica solo al sidebar, no a la navegación directa)
      await page.goto('/#/usuarios');

      // Esperar a que la app procese el hash
      await page.waitForTimeout(1000);

      // La app mantiene la ruta (autenticado, aunque el módulo no esté en el sidebar)
      expect(page.url()).toContain('#/usuarios');

      // El sidebar del operador NO debe mostrar el enlace a usuarios
      const sidebarUsuariosLink = page.locator('#sidebar-nav a[data-hash="#/usuarios"]');
      await expect(sidebarUsuariosLink).toHaveCount(0);
    });
  });

  // ── 4. Login con credenciales inválidas ──────────────────────────────────────

  test.describe('Login con credenciales inválidas', () => {
    test('debe mostrar alerta de error y permanecer en #/auth', async ({ page }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });

      await page.fill('#login-email', 'wrong@email.com');
      await page.fill('#login-password', 'wrongpass');
      await page.click('#login-submit');

      // Esperar a que aparezca el alert de error (después del timeout de 1200ms)
      await expect(page.locator('#login-error')).toBeVisible({ timeout: 5000 });

      // La URL no debe cambiar
      expect(page.url()).toContain('#/auth');
    });

    test('el alerta de error debe contener mensaje de credenciales incorrectas', async ({
      page,
    }) => {
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });

      await page.fill('#login-email', 'noexiste@ngr.com');
      await page.fill('#login-password', '12345');
      await page.click('#login-submit');

      await expect(page.locator('#login-error')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('#login-error')).toContainText('Credenciales incorrectas');
    });
  });

  // ── 5. Flujo de logout ────────────────────────────────────────────────────────

  test.describe('Logout', () => {
    test('cerrar sesión debe redirigir a #/auth', async ({ page }) => {
      // Login como admin
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });
      await loginAs(page, USERS.admin);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      // Hacer click en el botón de logout
      await page.click('#btn-logout');

      // Debe redirigir al login
      await page.waitForFunction(() => window.location.hash === '#/auth', { timeout: 5000 });

      expect(page.url()).toContain('#/auth');
    });

    test('después del logout, navegar al dashboard debe redirigir a #/auth', async ({ page }) => {
      // Login como admin
      await page.goto('/#/auth');
      await page.waitForSelector('#login-form', { timeout: 5000 });
      await loginAs(page, USERS.admin);

      await page.waitForFunction(() => window.location.hash === '#/dashboard', { timeout: 5000 });

      // Logout
      await page.click('#btn-logout');
      await page.waitForFunction(() => window.location.hash === '#/auth', { timeout: 5000 });

      // Intentar navegar al dashboard
      await page.goto('/#/dashboard');

      await page.waitForFunction(() => window.location.hash === '#/auth', { timeout: 5000 });

      expect(page.url()).toContain('#/auth');
    });
  });

  // ── 6. Flujo de "olvidé mi contraseña" ──────────────────────────────────────

  test.describe('Recuperación de contraseña', () => {
    test('debe mostrar el formulario de recuperación en #/auth/forgot-password', async ({
      page,
    }) => {
      await page.goto('/#/auth/forgot-password');

      await page.waitForSelector('#forgot-form', { timeout: 5000 });

      await expect(page.locator('#forgot-form')).toBeVisible();
      await expect(page.locator('#forgot-email')).toBeVisible();
    });

    test('enviar el formulario debe mostrar el estado de confirmación', async ({ page }) => {
      await page.goto('/#/auth/forgot-password');
      await page.waitForSelector('#forgot-form', { timeout: 5000 });

      await page.fill('#forgot-email', 'usuario@empresa.com');
      await page.click('#forgot-submit');

      // Esperar al estado de confirmación (después del timeout de 1200ms)
      await expect(page.locator('.card-title')).toContainText('Email enviado', { timeout: 5000 });
    });

    test('el estado de confirmación debe mostrar el email enviado', async ({ page }) => {
      await page.goto('/#/auth/forgot-password');
      await page.waitForSelector('#forgot-form', { timeout: 5000 });

      const testEmail = 'prueba@ngr.com';
      await page.fill('#forgot-email', testEmail);
      await page.click('#forgot-submit');

      // Verificar que el email aparece en la confirmación
      await expect(page.locator('.card-body')).toContainText(testEmail, { timeout: 5000 });
    });
  });

  // ── 7. Reset de contraseña — contraseñas no coinciden ────────────────────────

  test.describe('Restablecimiento de contraseña', () => {
    test('debe mostrar el formulario en #/auth/reset-password', async ({ page }) => {
      await page.goto('/#/auth/reset-password');

      await page.waitForSelector('#reset-form', { timeout: 5000 });

      await expect(page.locator('#reset-form')).toBeVisible();
      await expect(page.locator('#reset-password')).toBeVisible();
      await expect(page.locator('#reset-password-confirm')).toBeVisible();
    });

    test('contraseñas que no coinciden deben mostrar alerta de error', async ({ page }) => {
      await page.goto('/#/auth/reset-password');
      await page.waitForSelector('#reset-form', { timeout: 5000 });

      await page.fill('#reset-password', 'nuevapass123');
      await page.fill('#reset-password-confirm', 'otrapass456');
      await page.click('#reset-submit');

      // El error debe ser visible inmediatamente (validación sincrónica)
      await expect(page.locator('#reset-error')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('#reset-error')).toContainText('no coinciden');
    });

    test('contraseñas coincidentes deben mostrar estado de éxito', async ({ page }) => {
      await page.goto('/#/auth/reset-password');
      await page.waitForSelector('#reset-form', { timeout: 5000 });

      const newPassword = 'nuevapassword123';
      await page.fill('#reset-password', newPassword);
      await page.fill('#reset-password-confirm', newPassword);
      await page.click('#reset-submit');

      // Esperar el estado de éxito (después del timeout de 1200ms)
      await expect(page.locator('.card-title')).toContainText('Contraseña actualizada', {
        timeout: 5000,
      });
    });
  });
});
