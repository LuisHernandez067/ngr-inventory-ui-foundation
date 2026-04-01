// Página de error 500 — Error interno del servidor
import type { PageModule } from '../../router/router';

export const page500: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <!-- Código de error con ícono -->
        <div class="mb-3">
          <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
        </div>
        <span class="display-1 fw-bold text-danger">500</span>

        <!-- Título y descripción -->
        <h1 class="h3 mt-3 mb-2">Error del Servidor</h1>
        <p class="text-muted mb-4" style="max-width: 420px;">
          Ocurrió un error inesperado. Intentá de nuevo en unos momentos.
        </p>

        <!-- Acción principal -->
        <button class="btn btn-danger" id="btn-500-action">
          <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
        </button>
      </div>
    `;

    // Listener para recargar la página
    const btn = container.querySelector<HTMLButtonElement>('#btn-500-action');
    btn?.addEventListener('click', () => {
      window.location.reload();
    });
  },

  destroy(): void {
    // Sin recursos que limpiar
  },
};
