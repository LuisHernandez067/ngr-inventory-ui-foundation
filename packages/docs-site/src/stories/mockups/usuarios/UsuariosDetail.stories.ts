import type { Usuario } from '@ngr-inventory/api-contracts';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

import { usuarioFixtures } from '../../../../../api-mocks/src/fixtures/usuarios.fixtures';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formatea una fecha ISO a formato legible en es-CO */
function formatFecha(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Badge de estado activo/inactivo */
function buildActivoBadge(activo: boolean): string {
  return activo
    ? `<span class="badge bg-success" role="status">Activo</span>`
    : `<span class="badge bg-danger" role="status">Inactivo</span>`;
}

/** Genera fila descripción/valor del listado de detalle */
function dtRow(label: string, value: string): string {
  return (
    `<dt class="col-sm-5 text-muted fw-normal">${label}</dt>` +
    `<dd class="col-sm-7 fw-semibold mb-2">${value}</dd>`
  );
}

/** Genera el layout completo del detalle de usuario */
function buildDetalleHtml(params: { usuario: Usuario; canGestionar?: boolean }): string {
  const { usuario, canGestionar = true } = params;

  const toggleLabel = usuario.activo ? 'Desactivar usuario' : 'Activar usuario';
  const toggleBtnClass = usuario.activo
    ? 'btn btn-outline-danger btn-sm'
    : 'btn btn-outline-success btn-sm';
  const toggleIcon = usuario.activo ? 'bi-person-slash' : 'bi-person-check';

  const infoRows = [
    dtRow('Email', usuario.email),
    dtRow('Nombre', `${usuario.nombre} ${usuario.apellido}`),
    dtRow('Rol', usuario.rolNombre),
    dtRow('Teléfono', usuario.telefono ?? '—'),
    dtRow('Último acceso', formatFecha(usuario.ultimoAcceso)),
    dtRow('Creado por', usuario.createdBy ?? '—'),
    dtRow('Actualizado por', usuario.updatedBy ?? '—'),
    dtRow('Fecha de creación', formatFecha(usuario.createdAt)),
    dtRow('Última actualización', formatFecha(usuario.updatedAt)),
  ].join('');

  const actionButtons = canGestionar
    ? `<a href="#/usuarios/${usuario.id}/editar" class="btn btn-outline-primary btn-sm">
         <i class="bi bi-pencil me-1" aria-hidden="true"></i>
         Editar
       </a>
       <button type="button" class="${toggleBtnClass}">
         <i class="bi ${toggleIcon} me-1" aria-hidden="true"></i>
         ${toggleLabel}
       </button>`
    : '';

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Usuarios</a></li>
            <li class="breadcrumb-item active">${usuario.nombre} ${usuario.apellido}</li>
          </ol>
        </nav>
      </div>

      <div class="p-4" style="max-width:860px;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Usuarios
          </button>
          <div class="d-flex gap-2">
            ${actionButtons}
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0">${usuario.nombre} ${usuario.apellido}</h1>
          ${buildActivoBadge(usuario.activo)}
        </div>
        <p class="text-muted small mb-4">${usuario.email}</p>

        <div class="card">
          <div class="card-header fw-semibold">
            <i class="bi bi-person-lines-fill me-2" aria-hidden="true"></i>
            Información del usuario
          </div>
          <div class="card-body">
            <dl class="row mb-0">
              ${infoRows}
            </dl>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Genera el layout del estado 404 */
function build404Html(): string {
  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Usuarios</a></li>
            <li class="breadcrumb-item active">No encontrado</li>
          </ol>
        </nav>
      </div>

      <div class="p-4" style="max-width:860px;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Usuarios
          </button>
        </div>

        <div class="card">
          <div class="card-body text-center py-5">
            <i class="bi bi-person-x fs-1 text-muted d-block mb-3" aria-hidden="true"></i>
            <h5 class="text-muted">Usuario no encontrado</h5>
            <p class="text-muted small mb-3">El usuario solicitado no existe o fue eliminado.</p>
            <a href="#/usuarios" class="btn btn-outline-primary btn-sm">Volver al listado</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Fixtures seleccionados ────────────────────────────────────────────────────

/** usr-001: Roberto Fernández — Administrador, activo */
const usuarioActivo: Usuario = {
  id: 'usr-001',
  email: 'admin@ngr.com',
  nombre: 'Roberto',
  apellido: 'Fernández',
  telefono: '+54 11 4500-1234',
  rolId: 'rol-001',
  rolNombre: 'Administrador',
  activo: true,
  ultimoAcceso: '2025-03-30T08:45:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-03-30T08:45:00.000Z',
  createdBy: 'system',
  updatedBy: 'system',
};

/** usr-006: Patricia Díaz — Solo Lectura, inactivo */
const usuarioInactivo: Usuario = {
  id: 'usr-006',
  email: 'gerencia@ngr.com',
  nombre: 'Patricia',
  apellido: 'Díaz',
  telefono: '+54 11 4500-3456',
  rolId: 'rol-004',
  rolNombre: 'Solo Lectura',
  activo: false,
  ultimoAcceso: '2025-02-15T11:00:00.000Z',
  createdAt: '2025-01-15T09:00:00.000Z',
  updatedAt: '2025-03-01T10:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// ── Meta ──────────────────────────────────────────────────────────────────────

/** Detalle de usuario — estados activo/inactivo, acciones gateadas, 404 */
const meta = {
  title: 'Mockups/Usuarios/Detalle de usuario',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/usuarios/:id', ({ params }) => {
          const usuario = usuarioFixtures.find((u) => u.id === params['id']);
          if (!usuario) {
            return HttpResponse.json(
              {
                type: '/errors/not-found',
                title: 'Usuario no encontrado',
                status: 404,
                detail: `No existe un usuario con id "${String(params['id'])}"`,
              },
              { status: 404 }
            );
          }
          return HttpResponse.json(usuario);
        }),
        http.patch('/api/usuarios/:id/toggle-activo', ({ params }) => {
          const usuario = usuarioFixtures.find((u) => u.id === params['id']);
          if (!usuario) {
            return HttpResponse.json(
              { type: '/errors/not-found', title: 'No encontrado', status: 404, detail: '' },
              { status: 404 }
            );
          }
          return HttpResponse.json({ ...usuario, activo: !usuario.activo });
        }),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Usuario activo — Roberto Fernández, Administrador, con botones editar y desactivar */
export const UsuarioActivo: Story = {
  name: 'Usuario activo',
  render: () => buildDetalleHtml({ usuario: usuarioActivo }),
};

/** Usuario inactivo — Patricia Díaz, Solo Lectura, con botón "Activar usuario" */
export const UsuarioInactivo: Story = {
  name: 'Usuario inactivo',
  render: () => buildDetalleHtml({ usuario: usuarioInactivo }),
};

/** Sin permisos de edición — botones editar y toggle ocultos */
export const SinPermisosEdicion: Story = {
  name: 'Sin permisos de edición',
  render: () => buildDetalleHtml({ usuario: usuarioActivo, canGestionar: false }),
};

/** Usuario no encontrado — estado 404 */
export const UsuarioNoEncontrado: Story = {
  name: 'Usuario no encontrado',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/usuarios/:id', () =>
          HttpResponse.json(
            {
              type: '/errors/not-found',
              title: 'Usuario no encontrado',
              status: 404,
              detail: 'No existe un usuario con id "usr-999"',
            },
            { status: 404 }
          )
        ),
      ],
    },
  },
  render: () => build404Html(),
};
