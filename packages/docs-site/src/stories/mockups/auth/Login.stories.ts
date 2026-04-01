import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Pantalla de login del sistema NGR Inventory */
const meta = {
  title: 'Mockups/Autenticación/Login',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.post('/api/auth/login', () =>
          HttpResponse.json({
            user: {
              id: '1',
              email: 'admin@ngr.com',
              nombre: 'Administrador',
              roles: ['admin'],
              permisos: ['*'],
            },
            token: 'mock-token',
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
          })
        ),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const loginHtml = `
<div class="min-vh-100 d-flex align-items-center justify-content-center bg-body-secondary">
  <div class="card shadow-sm" style="width: 100%; max-width: 420px">
    <div class="card-body p-5">
      <div class="text-center mb-4">
        <div class="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center mb-3" style="width: 56px; height: 56px; font-size: 1.5rem; font-weight: 700">N</div>
        <h4 class="fw-bold mb-1">NGR Inventory</h4>
        <p class="text-muted small">Ingresá con tus credenciales</p>
      </div>
      <form>
        <div class="mb-3">
          <label for="email" class="form-label fw-medium">Correo electrónico</label>
          <input type="email" id="email" class="form-control" placeholder="usuario@empresa.com" value="admin@ngr.com">
        </div>
        <div class="mb-4">
          <label for="password" class="form-label fw-medium">Contraseña</label>
          <input type="password" id="password" class="form-control" placeholder="••••••••" value="password123">
        </div>
        <button type="submit" class="btn btn-primary w-100 fw-medium">Iniciar sesión</button>
        <div class="text-center mt-3">
          <a href="#" class="text-muted small">¿Olvidaste tu contraseña?</a>
        </div>
      </form>
    </div>
  </div>
</div>
`;

export const Predeterminado: Story = { render: () => loginHtml };

export const ConError: Story = {
  render: () =>
    loginHtml.replace(
      '<button type="submit"',
      `<div class="alert alert-danger small py-2 mb-3" role="alert">
      <i class="bi bi-exclamation-circle me-1"></i> Credenciales inválidas. Verificá tu correo y contraseña.
    </div>
    <button type="submit"`
    ),
};

export const Cargando: Story = {
  render: () =>
    loginHtml
      .replace(
        'Iniciar sesión</button>',
        `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Verificando...</button>`
      )
      .replace('<button type="submit"', '<button type="submit" disabled'),
};
