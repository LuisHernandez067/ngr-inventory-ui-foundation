// Modal de sesión expirada — se monta sobre el contenido actual como overlay fijo
// No es una página: se inyecta directamente en document.body
import { authService } from '../services/authService';

// ID del overlay para evitar duplicados
const OVERLAY_ID = 'session-expired-overlay';

// Referencia al elemento enfocado antes de mostrar el modal — para restaurar foco al cerrar
let previouslyFocused: HTMLElement | null = null;

/**
 * Maneja el click del botón de re-login dentro del modal.
 * Cierra sesión, redirige al login y oculta el modal.
 */
function handleReloginClick(): void {
  authService.logout();
  window.location.hash = '#/auth';
  sessionExpiredModal.hide();
}

/**
 * Modal de sesión expirada.
 * Se muestra como overlay fixed sobre toda la aplicación cuando la sesión expira por inactividad.
 */
export const sessionExpiredModal = {
  /**
   * Muestra el modal si no está ya visible.
   * El overlay se inyecta directamente en document.body para cubrr toda la pantalla.
   */
  show(): void {
    // Evitar duplicados si ya está montado
    if (document.getElementById(OVERLAY_ID)) return;

    // Guardar elemento enfocado antes de montar el modal para restaurarlo al cerrar
    previouslyFocused = document.activeElement as HTMLElement | null;

    // Crear el elemento overlay
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;

    // Estilos inline solo para el comportamiento de overlay fixed — no contienen colores
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';

    overlay.innerHTML = `
      <div class="card shadow-lg" style="max-width:400px;width:100%;">
        <div class="card-body text-center p-4">

          <!-- Ícono de advertencia de sesión expirada -->
          <div class="fs-1 text-warning mb-3">
            <i class="bi bi-clock-history"></i>
          </div>

          <!-- Título y mensaje del modal -->
          <h5 class="card-title">Sesión expirada</h5>
          <p class="card-text text-muted">
            Tu sesión ha expirado por inactividad.
            Iniciá sesión nuevamente para continuar.
          </p>

          <!-- Botón para volver al login -->
          <button id="btn-relogin" class="btn btn-primary w-100">
            Iniciar sesión
          </button>

        </div>
      </div>
    `;

    // Registrar el handler del botón antes de insertar en el DOM
    const reloginBtn = overlay.querySelector<HTMLButtonElement>('#btn-relogin');
    reloginBtn?.addEventListener('click', handleReloginClick);

    // Montar el overlay sobre toda la aplicación
    document.body.appendChild(overlay);
  },

  /**
   * Oculta y remueve el modal del DOM si está presente.
   */
  hide(): void {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
      // Remover el event listener antes de eliminar el nodo
      const reloginBtn = overlay.querySelector<HTMLButtonElement>('#btn-relogin');
      reloginBtn?.removeEventListener('click', handleReloginClick);

      overlay.remove();

      // Restaurar foco al elemento que estaba activo antes de abrir el modal
      previouslyFocused?.focus();
      previouslyFocused = null;
    }
  },
};
