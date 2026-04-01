// Módulo de la barra de navegación superior
import { cycleTheme, getTheme } from './theme';

/**
 * Renderiza el HTML de la barra de navegación principal.
 * Retorna un string HTML que será inyectado por el orquestador de layout.
 */
export function render(): string {
  return `
    <nav class="navbar navbar-expand-lg fixed-top navbar-ngr"
         aria-label="Barra de navegación principal">
      <div class="container-fluid">
        <!-- Botón de toggle para sidebar en mobile -->
        <button
          class="btn btn-sm me-2 d-lg-none"
          id="sidebar-toggle"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar"
          aria-controls="sidebar"
          aria-label="Abrir menú lateral"
        >
          <i class="bi bi-list fs-5"></i>
        </button>

        <!-- Marca de la aplicación -->
        <a class="navbar-brand fw-semibold" href="#/">NGR Inventory</a>

        <!-- Controles del lado derecho -->
        <div class="ms-auto d-flex align-items-center gap-2">
          <!-- Selector de tema -->
          <button
            class="btn btn-sm btn-outline-secondary"
            id="theme-switcher"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            <i class="bi bi-circle-half"></i>
          </button>

          <!-- Placeholder de notificaciones -->
          <button
            class="btn btn-sm btn-outline-secondary"
            aria-label="Notificaciones"
            title="Notificaciones"
          >
            <i class="bi bi-bell"></i>
          </button>

          <!-- Placeholder de avatar de usuario -->
          <div
            class="avatar-placeholder rounded-circle"
            role="img"
            aria-label="Usuario"
            title="Perfil de usuario"
          ></div>

          <!-- Botón de cierre de sesión -->
          <button
            class="btn btn-sm btn-outline-danger"
            id="btn-logout"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Inicializa los listeners del navbar: ciclo de temas y toggle del sidebar offcanvas.
 * Debe llamarse después de que el HTML del navbar esté en el DOM.
 */
export function init(root: HTMLElement): void {
  // Botón de cambio de tema — cicla por los temas disponibles
  const themeSwitcher = root.querySelector<HTMLButtonElement>('#theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', () => {
      const newTheme = cycleTheme();
      themeSwitcher.setAttribute('title', `Tema actual: ${newTheme}`);
    });

    // Refleja el tema inicial en el título del botón
    themeSwitcher.setAttribute('title', `Tema actual: ${getTheme()}`);
  }

  // Botón de logout — limpia el token y redirige al login
  const logoutBtn = root.querySelector<HTMLButtonElement>('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ngr_auth_token');
      window.location.hash = '#/auth';
    });
  }
}
