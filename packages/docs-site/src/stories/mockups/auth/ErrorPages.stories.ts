import type { Meta, StoryObj } from '@storybook/html';

const meta = {
  title: 'Mockups/Autenticación/Páginas de error',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const errorPageHtml = (code: string, title: string, description: string) => `
<div class="min-vh-100 d-flex align-items-center justify-content-center bg-body">
  <div class="text-center px-4" style="max-width: 480px">
    <div class="display-1 fw-bold text-primary mb-2">${code}</div>
    <h2 class="h4 fw-semibold mb-3">${title}</h2>
    <p class="text-muted mb-4">${description}</p>
    <div class="d-flex gap-2 justify-content-center">
      <button class="btn btn-primary">Ir al inicio</button>
      <button class="btn btn-outline-secondary">Volver atrás</button>
    </div>
  </div>
</div>
`;

export const NoAutorizado: Story = {
  name: '403 — Sin autorización',
  render: () =>
    errorPageHtml(
      '403',
      'Acceso no autorizado',
      'No tenés permisos para acceder a esta sección. Contactá al administrador si creés que esto es un error.'
    ),
};

export const NoEncontrado: Story = {
  name: '404 — Página no encontrada',
  render: () =>
    errorPageHtml(
      '404',
      'Página no encontrada',
      'La página que buscás no existe o fue movida. Revisá la URL o volvé al inicio.'
    ),
};

export const ErrorServidor: Story = {
  name: '500 — Error del servidor',
  render: () =>
    errorPageHtml(
      '500',
      'Error del servidor',
      'Ocurrió un error inesperado. El equipo técnico fue notificado. Intentá nuevamente en unos minutos.'
    ),
};
