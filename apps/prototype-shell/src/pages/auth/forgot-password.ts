// Página de recuperación de contraseña — formulario para solicitar reset por email
// Dos estados: formulario de envío y confirmación de email enviado
import type { PageModule } from '../../router/router';

// Estado local del módulo — scoped fuera del objeto para evitar conflictos con PageModule
let submitHandler: ((e: Event) => void) | null = null;
let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
let formRef: HTMLFormElement | null = null;

/**
 * Renderiza el estado de confirmación luego de simular el envío del email.
 * Reemplaza el contenido de la card con el mensaje de éxito.
 */
function showConfirmationState(container: HTMLElement, email: string): void {
  const cardBody = container.querySelector<HTMLElement>('.card-body');
  if (!cardBody) return;

  cardBody.innerHTML = `
    <!-- Ícono de confirmación -->
    <div class="text-center mb-3">
      <i class="bi bi-envelope-check fs-1 text-success"></i>
    </div>

    <!-- Título de confirmación -->
    <h5 class="card-title text-center mb-3">Email enviado</h5>

    <!-- Mensaje con el email ingresado -->
    <p class="card-text text-muted text-center mb-4">
      Si el correo <strong>${email}</strong> está registrado, recibirás las
      instrucciones en los próximos minutos.
    </p>

    <!-- Botón para volver al login -->
    <button id="forgot-back-btn" class="btn btn-outline-primary w-100">
      Volver al login
    </button>
  `;

  // Registrar el handler del botón de volver
  const backBtn = cardBody.querySelector<HTMLButtonElement>('#forgot-back-btn');
  backBtn?.addEventListener('click', () => {
    window.location.hash = '#/auth';
  });
}

/**
 * Maneja el envío del formulario de recuperación.
 * Simula una llamada asíncrona de 1200ms antes de mostrar la confirmación.
 */
function handleSubmit(container: HTMLElement): void {
  const emailInput = container.querySelector<HTMLInputElement>('#forgot-email');
  const submitBtn = container.querySelector<HTMLButtonElement>('#forgot-submit');

  if (!emailInput || !submitBtn) return;

  const email = emailInput.value.trim();

  // Activar estado de carga en el botón
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    Enviando...
  `;

  // Simular latencia de envío — 1200ms antes de mostrar confirmación
  pendingTimeout = setTimeout(() => {
    pendingTimeout = null;
    showConfirmationState(container, email);
  }, 1200);
}

export const forgotPasswordPage: PageModule = {
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
            <h5 class="card-title text-center mb-1">Recuperar contraseña</h5>
            <p class="text-muted text-center small mb-4">
              Ingresá tu email y te enviaremos las instrucciones.
            </p>

            <!-- Formulario de recuperación -->
            <form id="forgot-form" novalidate>

              <!-- Campo de email -->
              <div class="mb-3">
                <label for="forgot-email" class="form-label">Correo electrónico</label>
                <input
                  type="email"
                  class="form-control"
                  id="forgot-email"
                  name="email"
                  placeholder="usuario@empresa.com"
                  autocomplete="email"
                  required
                />
              </div>

              <!-- Botón de submit -->
              <button type="submit" class="btn btn-primary w-100 mb-3" id="forgot-submit">
                Enviar instrucciones
              </button>

            </form>

            <!-- Link para volver al login -->
            <div class="text-center">
              <a href="#/auth" class="small">← Volver al login</a>
            </div>

          </div>
        </div>
      </div>
    `;

    const form = container.querySelector<HTMLFormElement>('#forgot-form');
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
