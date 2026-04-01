// Orquestador de layout — ensambla todos los módulos del admin shell
import { init as initTheme } from './theme';
import { render as renderNavbar, init as initNavbar, refreshNavbar } from './navbar';
import { render as renderSidebar, init as initSidebar, refreshSidebar } from './sidebar';
import { render as renderBreadcrumb, update as updateBreadcrumb } from './breadcrumb';
import { render as renderFooter } from './footer';

export { update as updateBreadcrumb } from './breadcrumb';
export { setActive } from './sidebar';

/**
 * Ensambla e inicializa el shell de administración completo.
 * Renderiza navbar, sidebar, breadcrumb, área de contenido y footer,
 * luego inicializa los módulos en orden de dependencia.
 *
 * NOTA: El listener de hashchange fue removido de esta función.
 * El Router es el único propietario del listener hashchange — evita
 * condiciones de carrera y listeners duplicados. El router llama
 * directamente a updateBreadcrumb() y setActive() tras cada navegación.
 *
 * @param app - Elemento raíz (#app) donde se monta el shell
 */
export function initLayout(app: HTMLElement): void {
  // Construir el HTML completo del shell
  const shellHTML = `
    <div class="layout-wrapper">
      ${renderNavbar()}

      ${renderSidebar()}

      <div class="main-wrapper">
        <main id="main-content" class="main-content" tabindex="-1">
          ${renderBreadcrumb()}
          <div id="page-content" class="page-content">
            <!-- El contenido de cada módulo se inyecta aquí -->
          </div>
          ${renderFooter()}
        </main>
      </div>
    </div>
  `;

  // Montar el shell en el DOM
  app.innerHTML = shellHTML;

  // Inicializar módulos en orden de dependencia:
  // 1. Tema — aplica el tema guardado (o el por defecto)
  initTheme();

  // 2. Navbar — conecta el ciclo de temas y el toggle del offcanvas
  initNavbar(app);

  // 3. Sidebar — conecta listeners de teclado (hashchange lo maneja el Router)
  initSidebar(app);

  // 4. Breadcrumb — estado inicial sin registrar listener (lo hace el Router)
  updateBreadcrumb(window.location.hash || '#/');

  // 5. Refrescar sidebar y navbar con el estado de autenticación actual
  //    Cubre el caso de recarga de página donde el usuario ya tiene sesión activa
  refreshSidebar();
  refreshNavbar();
}
