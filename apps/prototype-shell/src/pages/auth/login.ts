// Página de login — formulario de autenticación del prototipo
// No usa autenticación real — simula el flujo con un setTimeout
import type { PageModule } from '../../router/router';

// Estado local del módulo — scoped fuera del objeto para evitar conflictos con PageModule
let submitHandler: ((e: Event) => void) | null = null;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let formRef: HTMLFormElement | null = null;

/**
 * Maneja el envío del formulario de login.
 * Simula una llamada asíncrona de 1200ms antes de validar credenciales.
 */
function handleSubmit(container: HTMLElement): void {
  const emailInput = container.querySelector<HTMLInputElement>('#login-email');
  const passwordInput = container.querySelector<HTMLInputElement>('#login-password');
  const submitBtn = container.querySelector<HTMLButtonElement>('#login-submit');
  const errorAlert = container.querySelector<HTMLDivElement>('#login-error');

  if (!emailInput || !passwordInput || !submitBtn || !errorAlert) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Ocultar error previo y activar estado de carga
  errorAlert.classList.add('d-none');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Verificando...
  `;

  // Simular latencia de red — 1200ms antes de validar
  pendingTimeout = setTimeout(() => {
    pendingTimeout = null;

    // Lógica de validación del prototipo
    const isValid = email.endsWith('@ngr.com') || password === 'admin123';

    if (isValid) {
      // Guardar token mock y navegar al dashboard
      localStorage.setItem('ngr_auth_token', 'mock-token-xyz');
      window.location.hash = '#/dashboard';
    } else {
      // Mostrar error y restaurar el botón
      errorAlert.classList.remove('d-none');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Ingresar';

      // Poner foco en el email para facilitar la corrección
      emailInput.focus();
    }
  }, 1200);
}

export const loginPage: PageModule = {
  render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center py-5">
        <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
          <div class="card-body p-4">

            <!-- Logo y título de la app -->
            <div class="text-center mb-4">
              <h4 class="fw-bold text-primary mb-1">NGR Inventory</h4>
              <p class="text-muted small mb-0">Sistema de gestión de inventario</p>
            </div>

            <!-- Alerta de error — oculta por defecto -->
            <div
              id="login-error"
              class="alert alert-danger d-none"
              role="alert"
              aria-live="assertive"
            >
              <i class="bi bi-exclamation-circle me-2"></i>
              Credenciales incorrectas. Intentá de nuevo.
            </div>

            <!-- Formulario de login -->
            <form id="login-form" novalidate>
              <!-- Campo de email -->
              <div class="mb-3">
                <label for="login-email" class="form-label">Correo electrónico</label>
                <input
                  type="email"
                  class="form-control"
                  id="login-email"
                  name="email"
                  placeholder="usuario@empresa.com"
                  autocomplete="email"
                  required
                />
              </div>

              <!-- Campo de contraseña -->
              <div class="mb-4">
                <label for="login-password" class="form-label">Contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  id="login-password"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                />
              </div>

              <!-- Botón de submit — cambia a estado de carga durante la verificación -->
              <button type="submit" class="btn btn-primary w-100" id="login-submit">
                Ingresar
              </button>
            </form>

          </div>
        </div>
      </div>
    `;

    const form = container.querySelector<HTMLFormElement>('#login-form');
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
    // Cancelar timeout pendiente para evitar efectos secundarios tras desmontar
    if (pendingTimeout !== null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    // Remover el listener del formulario para evitar memory leaks
    if (formRef && submitHandler) {
      formRef.removeEventListener('submit', submitHandler);
      formRef = null;
      submitHandler = null;
    }
  },
};
