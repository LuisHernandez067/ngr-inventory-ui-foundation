// Página de error 404 — Recurso no encontrado
import type { PageModule } from '../../router/router';

export const page404: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <!-- Código de error con ícono -->
        <div class="mb-3">
          <i class="bi bi-map display-1 text-warning"></i>
        </div>
        <span class="display-1 fw-bold text-warning">404</span>

        <!-- Título y descripción -->
        <h1 class="h3 mt-3 mb-2">Página No Encontrada</h1>
        <p class="text-muted mb-4" style="max-width: 420px;">
          La sección que buscás no existe o fue movida.
        </p>

        <!-- Acción principal -->
        <button class="btn btn-secondary" id="btn-404-action">
          <i class="bi bi-house me-2"></i>Volver al inicio
        </button>
      </div>
    `;

    // Listener para navegar al dashboard
    const btn = container.querySelector<HTMLButtonElement>('#btn-404-action');
    btn?.addEventListener('click', () => {
      window.location.hash = '#/dashboard';
    });
  },

  destroy(): void {
    // Sin recursos que limpiar
  },
};
