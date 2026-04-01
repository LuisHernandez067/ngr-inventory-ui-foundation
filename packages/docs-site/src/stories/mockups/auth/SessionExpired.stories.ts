import type { Meta, StoryObj } from '@storybook/html';

/** Modal de sesión expirada del sistema NGR Inventory */
const meta = {
  title: 'Mockups/Autenticación/Sesión expirada',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => `
<div style="min-width: 400px; background: rgba(0,0,0,0.6); padding: 2rem; border-radius: 8px;">
  <div class="card shadow-lg" style="max-width: 400px; width: 100%;">
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
      <button class="btn btn-primary w-100">
        Iniciar sesión
      </button>

    </div>
  </div>
</div>
  `,
};
