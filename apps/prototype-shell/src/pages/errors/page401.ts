// Página de error 401 — Acceso no autorizado
import type { PageModule } from '../../router/router';

export const page401: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <!-- Código de error con ícono -->
        <div class="mb-3">
          <i class="bi bi-shield-lock display-1 text-warning"></i>
        </div>
        <span class="display-1 fw-bold text-warning">401</span>

        <!-- Título y descripción -->
        <h1 class="h3 mt-3 mb-2">No Autorizado</h1>
        <p class="text-muted mb-4" style="max-width: 420px;">
          No tenés permiso para ver este contenido. Iniciá sesión con una cuenta autorizada.
        </p>

        <!-- Acción principal -->
        <button class="btn btn-warning" id="btn-401-action">
          <i class="bi bi-box-arrow-in-right me-2"></i>Ir al login
        </button>
      </div>
    `;

    // Listener para navegar al login
    const btn = container.querySelector<HTMLButtonElement>('#btn-401-action');
    btn?.addEventListener('click', () => {
      window.location.hash = '#/auth';
    });
  },

  destroy(): void {
    // Sin recursos que limpiar
  },
};
