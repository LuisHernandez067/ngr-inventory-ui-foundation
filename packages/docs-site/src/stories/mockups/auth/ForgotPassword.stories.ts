import type { Meta, StoryObj } from '@storybook/html';

/** Pantalla de recuperación de contraseña del sistema NGR Inventory */
const meta = {
  title: 'Mockups/Autenticación/Recuperar contraseña',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const forgotPasswordHtml = `
<div style="min-width: 400px;">
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
          />
        </div>

        <!-- Botón de submit -->
        <button type="submit" class="btn btn-primary w-100 mb-3" id="forgot-submit">
          Enviar instrucciones
        </button>

      </form>

      <!-- Link para volver al login -->
      <div class="text-center">
        <a href="#" class="small">← Volver al login</a>
      </div>

    </div>
  </div>
</div>
`;

export const Default: Story = {
  render: () => forgotPasswordHtml,
};

export const EmailSent: Story = {
  render: () => `
<div style="min-width: 400px;">
  <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
    <div class="card-body p-4">

      <!-- Ícono de confirmación -->
      <div class="text-center mb-3">
        <i class="bi bi-envelope-check fs-1 text-success"></i>
      </div>

      <!-- Título de confirmación -->
      <h5 class="card-title text-center mb-3">Email enviado</h5>

      <!-- Mensaje con el email ingresado -->
      <p class="card-text text-muted text-center mb-4">
        Si el correo <strong>usuario@empresa.com</strong> está registrado, recibirás las
        instrucciones en los próximos minutos.
      </p>

      <!-- Botón para volver al login -->
      <button class="btn btn-outline-primary w-100">
        Volver al login
      </button>

    </div>
  </div>
</div>
  `,
};
