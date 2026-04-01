// Página de error 403 — Acceso prohibido
import type { PageModule } from '../../router/router';

export const page403: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <!-- Código de error con ícono -->
        <div class="mb-3">
          <i class="bi bi-shield-x display-1 text-warning"></i>
        </div>
        <span class="display-1 fw-bold text-warning">403</span>

        <!-- Título y descripción -->
        <h1 class="h3 mt-3 mb-2">Acceso Prohibido</h1>
        <p class="text-muted mb-4" style="max-width: 420px;">
          Tu cuenta no tiene los permisos necesarios para acceder a esta sección.
        </p>

        <!-- Acción principal -->
        <button class="btn btn-secondary" id="btn-403-action">
          <i class="bi bi-house me-2"></i>Volver al inicio
        </button>
      </div>
    `;

    // Listener para navegar al dashboard
    const btn = container.querySelector<HTMLButtonElement>('#btn-403-action');
    btn?.addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });
  },

  destroy(): void {
    // Sin recursos que limpiar
  },
};
