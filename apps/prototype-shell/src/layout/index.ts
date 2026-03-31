// Orquestador de layout — ensambla todos los módulos del admin shell
import { init as initTheme } from './theme';
import { render as renderNavbar, init as initNavbar } from './navbar';
import { render as renderSidebar, init as initSidebar, setActive } from './sidebar';
import { render as renderBreadcrumb, update as updateBreadcrumb } from './breadcrumb';
import { render as renderFooter } from './footer';

/**
 * Ensambla e inicializa el shell de administración completo.
 * Renderiza navbar, sidebar, breadcrumb, área de contenido y footer,
 * luego inicializa los módulos en orden de dependencia.
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

  // 3. Sidebar — conecta listeners de hashchange y teclado
  initSidebar(app);

  // 4. Breadcrumb — listener de hashchange para actualizar la ruta
  updateBreadcrumb(window.location.hash || '#/');
  window.addEventListener('hashchange', () => {
    updateBreadcrumb(window.location.hash || '#/');
    setActive(window.location.hash || '#/');
  });
}
