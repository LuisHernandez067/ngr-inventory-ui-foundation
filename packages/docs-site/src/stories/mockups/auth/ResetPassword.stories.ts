import type { Meta, StoryObj } from '@storybook/html';

/** Pantalla de restablecimiento de contraseña del sistema NGR Inventory */
const meta = {
  title: 'Mockups/Autenticación/Nueva contraseña',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const resetPasswordHtml = `
<div style="min-width: 400px;">
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

export const Default: Story = {
  render: () => resetPasswordHtml,
};

export const PasswordMismatch: Story = {
  render: () => resetPasswordHtml.replace('class="alert alert-danger d-none"', 'class="alert alert-danger"'),
};

export const Success: Story = {
  render: () => `
<div style="min-width: 400px;">
  <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
    <div class="card-body p-4">

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
      <button class="btn btn-primary w-100">
        Ir al login
      </button>

    </div>
  </div>
</div>
  `,
};
