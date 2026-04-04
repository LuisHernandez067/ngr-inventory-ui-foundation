// Módulo de la barra de navegación superior
import { authService } from '../services/authService';

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

          <!-- Área de usuario autenticado — actualizada por refreshNavbar() -->
          <span id="navbar-user" class="d-none d-md-flex align-items-center gap-2 me-2">
            <!-- Nombre y rol del usuario autenticado — actualizado por refreshNavbar() -->
          </span>

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
 * Actualiza el área de usuario en la navbar según el estado de autenticación actual.
 * Muestra el nombre y rol del usuario si hay sesión activa; limpia el área si no hay sesión.
 */
export function refreshNavbar(): void {
  const userArea = document.getElementById('navbar-user');
  if (!userArea) return;

  const user = authService.getUser();
  if (!user) {
    userArea.innerHTML = '';
    return;
  }

  // Clase del badge según el perfil del usuario
  const roleBadgeClass =
    user.perfil === 'admin'
      ? 'bg-danger'
      : user.perfil === 'operador'
        ? 'bg-warning'
        : 'bg-secondary';

  userArea.innerHTML = `
    <span class="small fw-medium">${user.nombre}</span>
    <span class="badge ${roleBadgeClass}">${user.rol}</span>
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

  // Reaccionar a cambios de autenticación — actualiza el área de usuario
  window.addEventListener('ngr:auth-change', refreshNavbar);

  // Llamar de inmediato para reflejar el estado inicial de autenticación
  refreshNavbar();
}
