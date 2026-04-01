// Página de restablecimiento de contraseña — formulario para definir nueva contraseña
// Dos estados: formulario con validación y confirmación de cambio exitoso
import type { PageModule } from '../../router/router';

// Estado local del módulo — scoped fuera del objeto para evitar conflictos con PageModule
let submitHandler: ((e: Event) => void) | null = null;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let redirectTimeout: ReturnType<typeof setTimeout> | null = null;
let formRef: HTMLFormElement | null = null;

/**
 * Renderiza el estado de éxito tras cambiar la contraseña.
 * Reemplaza el contenido de la card y dispara auto-redirect a los 3 segundos.
 */
function showSuccessState(container: HTMLElement): void {
  const cardBody = container.querySelector<HTMLElement>('.card-body');
  if (!cardBody) return;

  cardBody.innerHTML = `
    <!-- Ícono de éxito -->
    <div class="text-center mb-3">
      <i class="bi bi-check-circle fs-1 text-success"></i>
    </div>

    <!-- Título de confirmación -->
    <h5 class="card-title text-center mb-3">Contraseña actualizada</h5>

    <!-- Mensaje de confirmación -->
    <p class="card-text text-muted text-center mb-4">
      Tu contraseña fue actualizada correctamente.
    </p>

    <!-- Botón para ir al login -->
    <button id="reset-goto-login-btn" class="btn btn-primary w-100">
      Ir al login
    </button>
  `;

  // Registrar el handler del botón de ir al login
  const gotoLoginBtn = cardBody.querySelector<HTMLButtonElement>('#reset-goto-login-btn');
  gotoLoginBtn?.addEventListener('click', () => {
    window.location.hash = '#/auth';
  });

  // Auto-redirect al login después de 3 segundos
  redirectTimeout = setTimeout(() => {
    redirectTimeout = null;
    window.location.hash = '#/auth';
  }, 3000);
}

/**
 * Maneja el envío del formulario de reset.
 * Valida que las contraseñas coincidan antes de simular el guardado.
 */
function handleSubmit(container: HTMLElement): void {
  const newPasswordInput = container.querySelector<HTMLInputElement>('#reset-password');
  const confirmPasswordInput = container.querySelector<HTMLInputElement>('#reset-password-confirm');
  const submitBtn = container.querySelector<HTMLButtonElement>('#reset-submit');
  const errorAlert = container.querySelector<HTMLDivElement>('#reset-error');

  if (!newPasswordInput || !confirmPasswordInput || !submitBtn || !errorAlert) return;

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validar que las contraseñas coincidan
  if (newPassword !== confirmPassword) {
    errorAlert.classList.remove('d-none');
    confirmPasswordInput.focus();
    return;
  }

  // Ocultar error previo y activar estado de carga
  errorAlert.classList.add('d-none');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Guardando...
  `;

  // Simular latencia de guardado — 1200ms antes de mostrar confirmación
  pendingTimeout = setTimeout(() => {
    pendingTimeout = null;
    showSuccessState(container);
  }, 1200);
}

export const resetPasswordPage: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center py-5">
        <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
          <div class="card-body p-4">

            <!-- Logo y título de la app -->
            <div class="text-center mb-4">
              <h4 class="fw-bold text-primary mb-1">NGR Inventory</h4>
            </div>

            <!-- Título y subtítulo del formulario -->
            <h5 class="card-title text-center mb-1">Nueva contraseña</h5>
            <p class="text-muted text-center small mb-4">
              Ingresá tu nueva contraseña.
            </p>

            <!-- Alerta de validación — oculta por defecto -->
            <div
              id="reset-error"
              class="alert alert-danger d-none"
              role="alert"
              aria-live="assertive"
            >
              <i class="bi bi-exclamation-circle me-2"></i>
              Las contraseñas no coinciden.
            </div>

            <!-- Formulario de nueva contraseña -->
            <form id="reset-form" novalidate>

              <!-- Campo de nueva contraseña -->
              <div class="mb-3">
                <label for="reset-password" class="form-label">Nueva contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  id="reset-password"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                />
              </div>

              <!-- Campo de confirmación de contraseña -->
              <div class="mb-3">
                <label for="reset-password-confirm" class="form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  id="reset-password-confirm"
                  name="password-confirm"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  required
                />
              </div>

              <!-- Botón de submit -->
              <button type="submit" class="btn btn-primary w-100" id="reset-submit">
                Guardar contraseña
              </button>

            </form>

          </div>
        </div>
      </div>
    `;

    const form = container.querySelector<HTMLFormElement>('#reset-form');
    if (!form) return;

    // Guardar referencia al formulario para poder limpiar en destroy()
    formRef = form;

    // Crear y almacenar el handler para poder removerlo en destroy()
    submitHandler = (e: Event) => {
      e.preventDefault();
      handleSubmit(container);
    };

    form.addEventListener('submit', submitHandler);
  },

  destroy(): void {
    // Cancelar timeouts pendientes para evitar efectos secundarios tras desmontar
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    if (redirectTimeout !== null) {
      clearTimeout(redirectTimeout);
      redirectTimeout = null;
    }

    // Remover el listener del formulario para evitar memory leaks
    if (formRef && submitHandler) {
      formRef.removeEventListener('submit', submitHandler);
      formRef = null;
      submitHandler = null;
    }
  },
};
