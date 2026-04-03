import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

import { rolFixtures } from '../../../../../api-mocks/src/fixtures/roles.fixtures';
import { usuarioFixtures } from '../../../../../api-mocks/src/fixtures/usuarios.fixtures';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Genera el badge de estado activo/inactivo */
function activoBadge(activo: boolean): string {
  return activo
    ? `<span class="badge bg-success">Activo</span>`
    : `<span class="badge bg-secondary">Inactivo</span>`;
}

/** Genera las filas de la tabla de usuarios */
function buildRows(usuarios: typeof usuarioFixtures): string {
  if (usuarios.length === 0) {
    return `<tr><td colspan="4" class="text-center text-muted py-4">Sin usuarios registrados</td></tr>`;
  }
  return usuarios
    .map(
      (u) => `
      <tr style="cursor:pointer;" data-id="${u.id}">
        <td>${u.nombre} ${u.apellido}</td>
        <td class="text-muted small">${u.email}</td>
        <td>${u.rolNombre}</td>
        <td>${activoBadge(u.activo)}</td>
      </tr>`
    )
    .join('');
}

/** Genera el HTML de la barra de filtros */
function buildFiltros(params: { rolIdSelected?: string; activoSelected?: string }): string {
  const roleOptions = rolFixtures
    .map(
      (r) =>
        `<option value="${r.id}"${params.rolIdSelected === r.id ? ' selected' : ''}>${r.nombre}</option>`
    )
    .join('');

  return `
    <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
      <div>
        <label for="rol-filter" class="form-label small mb-1">Rol</label>
        <select id="rol-filter" class="form-select form-select-sm" style="min-width:160px;">
          <option value="">Todos los roles</option>
          ${roleOptions}
        </select>
      </div>
      <div>
        <label for="activo-filter" class="form-label small mb-1">Estado</label>
        <select id="activo-filter" class="form-select form-select-sm" style="min-width:140px;">
          <option value="">Todos</option>
          <option value="true"${params.activoSelected === 'true' ? ' selected' : ''}>Activo</option>
          <option value="false"${params.activoSelected === 'false' ? ' selected' : ''}>Inactivo</option>
        </select>
      </div>
    </div>`;
}

/** Genera el layout completo de la lista de usuarios */
function buildListaHtml(params: {
  usuarios: typeof usuarioFixtures;
  showNuevoBtn?: boolean;
  rolIdSelected?: string;
  activoSelected?: string;
}): string {
  const { usuarios, showNuevoBtn = true } = params;
  const nuevoBtn = showNuevoBtn
    ? `<button class="btn btn-primary btn-sm">
         <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
         Nuevo usuario
       </button>`
    : '';

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Usuarios</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Usuarios del sistema</h1>
          <div class="d-flex gap-2 align-items-center">
            ${nuevoBtn}
          </div>
        </div>

        ${buildFiltros(params)}

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Nombre completo</th>
                    <th>Email</th>
                    <th style="width:160px;">Rol</th>
                    <th style="width:100px;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildRows(usuarios)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p class="text-muted small mt-2">${String(usuarios.length)} usuario(s) encontrado(s)</p>
      </div>
    </div>
  `;
}

// ── Meta ──────────────────────────────────────────────────────────────────────

/** Lista de usuarios del sistema — estados, filtros y acciones gateadas */
const meta = {
  title: 'Mockups/Usuarios/Lista de usuarios',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/usuarios', () =>
          HttpResponse.json({
            data: usuarioFixtures,
            total: usuarioFixtures.length,
            page: 1,
            pageSize: 50,
            totalPages: 1,
          })
        ),
        http.get('/api/roles', () =>
          HttpResponse.json({
            data: rolFixtures,
            total: rolFixtures.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Lista completa — los 12 usuarios sin ningún filtro activo */
export const ListaCompleta: Story = {
  name: 'Lista completa',
  render: () => buildListaHtml({ usuarios: usuarioFixtures }),
};

/** Lista filtrada por rol Operario (rol-003) — 4 usuarios */
export const FiltradoPorRol: Story = {
  name: 'Filtrado por rol',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/usuarios', ({ request }) => {
          const url = new URL(request.url);
          const rolId = url.searchParams.get('rolId') ?? '';
          const filtered = rolId
            ? usuarioFixtures.filter((u) => u.rolId === rolId)
            : usuarioFixtures;
          return HttpResponse.json({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/roles', () =>
          HttpResponse.json({
            data: rolFixtures,
            total: rolFixtures.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
      ],
    },
  },
  render: () =>
    buildListaHtml({
      usuarios: usuarioFixtures.filter((u) => u.rolId === 'rol-003'),
      rolIdSelected: 'rol-003',
    }),
};

/** Solo activos — filtro activo=true aplicado (8 usuarios) */
export const SoloActivos: Story = {
  name: 'Solo activos',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/usuarios', ({ request }) => {
          const url = new URL(request.url);
          const activoParam = url.searchParams.get('activo') ?? '';
          const filtered =
            activoParam === 'true' || activoParam === 'false'
              ? usuarioFixtures.filter((u) => u.activo === (activoParam === 'true'))
              : usuarioFixtures;
          return HttpResponse.json({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/roles', () =>
          HttpResponse.json({
            data: rolFixtures,
            total: rolFixtures.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
      ],
    },
  },
  render: () =>
    buildListaHtml({
      usuarios: usuarioFixtures.filter((u) => u.activo),
      activoSelected: 'true',
    }),
};

/** Solo inactivos — filtro activo=false aplicado (4 usuarios) */
export const SoloInactivos: Story = {
  name: 'Solo inactivos',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/usuarios', ({ request }) => {
          const url = new URL(request.url);
          const activoParam = url.searchParams.get('activo') ?? '';
          const filtered =
            activoParam === 'true' || activoParam === 'false'
              ? usuarioFixtures.filter((u) => u.activo === (activoParam === 'true'))
              : usuarioFixtures;
          return HttpResponse.json({
            data: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/roles', () =>
          HttpResponse.json({
            data: rolFixtures,
            total: rolFixtures.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
      ],
    },
  },
  render: () =>
    buildListaHtml({
      usuarios: usuarioFixtures.filter((u) => !u.activo),
      activoSelected: 'false',
    }),
};

/** Sin permiso de gestión — botón "Nuevo usuario" oculto */
export const SinPermisoGestion: Story = {
  name: 'Sin permiso de gestión',
  render: () => buildListaHtml({ usuarios: usuarioFixtures, showNuevoBtn: false }),
};
