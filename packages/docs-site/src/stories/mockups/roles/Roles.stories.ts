import type { Permiso, Rol } from '@ngr-inventory/api-contracts';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

import { rolFixtures } from '../../../../../api-mocks/src/fixtures/roles.fixtures';
import { PERMISOS_CATALOG } from '../../../../../api-mocks/src/handlers/roles.handlers';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Agrupa un array de permisos por módulo */
function groupByModulo(permisos: Permiso[]): Record<string, Permiso[]> {
  return permisos.reduce<Record<string, Permiso[]>>((acc, p) => {
    const list = acc[p.modulo] ?? [];
    list.push(p);
    acc[p.modulo] = list;
    return acc;
  }, {});
}

/** Genera badges de permisos agrupados por módulo */
function buildPermisoBadges(permisos: Permiso[]): string {
  const grouped = groupByModulo(permisos);
  return Object.entries(grouped)
    .map(
      ([modulo, items]) => `
        <div class="mb-3">
          <p class="text-muted small mb-1 text-uppercase fw-semibold">${modulo}</p>
          <div class="d-flex flex-wrap gap-2">
            ${items.map((p) => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle">${p.nombre}</span>`).join('')}
          </div>
        </div>`
    )
    .join('');
}

/** Genera las filas de la tabla de roles */
function buildRolRows(roles: Rol[]): string {
  if (roles.length === 0) {
    return `<tr><td colspan="3" class="text-center text-muted py-4">Sin roles registrados</td></tr>`;
  }
  return roles
    .map(
      (r) => `
      <tr style="cursor:pointer;" data-id="${r.id}">
        <td>
          <span class="fw-semibold">${r.nombre}</span>
          ${r.esAdmin ? '<span class="badge bg-warning ms-2 small">Admin</span>' : ''}
        </td>
        <td class="text-muted small">${r.descripcion ?? '—'}</td>
        <td class="text-end">
          <span class="badge bg-secondary">${String(r.permisos.length)} permiso(s)</span>
        </td>
      </tr>`
    )
    .join('');
}

/** Genera el layout de la lista de roles */
function buildListaRolesHtml(params: { roles: Rol[]; showNuevoBtn?: boolean }): string {
  const { roles, showNuevoBtn = true } = params;
  const nuevoBtn = showNuevoBtn
    ? `<button class="btn btn-primary btn-sm">
         <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
         Nuevo rol
       </button>`
    : '';

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Roles</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Roles del sistema</h1>
          ${nuevoBtn}
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style="width:200px;">Nombre</th>
                    <th>Descripción</th>
                    <th style="width:130px;" class="text-end">Permisos</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildRolRows(roles)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p class="text-muted small mt-2">${String(roles.length)} rol(es) encontrado(s)</p>
      </div>
    </div>
  `;
}

/** Genera el layout de detalle de un rol */
function buildRolDetalleHtml(params: { rol: Rol; canGestionar?: boolean }): string {
  const { rol, canGestionar = true } = params;

  const editBtn = canGestionar
    ? `<a href="#/roles/${rol.id}/editar" class="btn btn-outline-primary btn-sm">
         <i class="bi bi-pencil me-1" aria-hidden="true"></i>
         Editar
       </a>`
    : '';

  const permisosGrouped = buildPermisoBadges(rol.permisos);

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Roles</a></li>
            <li class="breadcrumb-item active">${rol.nombre}</li>
          </ol>
        </nav>
      </div>

      <div class="p-4" style="max-width:860px;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Roles
          </button>
          <div class="d-flex gap-2">
            ${editBtn}
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0">${rol.nombre}</h1>
          ${rol.esAdmin ? '<span class="badge bg-warning">Administrador</span>' : ''}
        </div>
        ${rol.descripcion ? `<p class="text-muted small mb-4">${rol.descripcion}</p>` : '<p class="text-muted small mb-4">Sin descripción</p>'}

        <!-- Info general -->
        <div class="card mb-3">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información general
          </div>
          <div class="card-body">
            <dl class="row mb-0">
              <dt class="col-sm-4 text-muted fw-normal">Nombre</dt>
              <dd class="col-sm-8 fw-semibold mb-2">${rol.nombre}</dd>
              <dt class="col-sm-4 text-muted fw-normal">Tipo</dt>
              <dd class="col-sm-8 fw-semibold mb-2">${rol.esAdmin ? 'Administrador' : 'Estándar'}</dd>
              <dt class="col-sm-4 text-muted fw-normal">Total de permisos</dt>
              <dd class="col-sm-8 fw-semibold mb-2">${String(rol.permisos.length)}</dd>
            </dl>
          </div>
        </div>

        <!-- Permisos agrupados por módulo -->
        <div class="card">
          <div class="card-header fw-semibold">
            <i class="bi bi-shield-check me-2" aria-hidden="true"></i>
            Permisos asignados
          </div>
          <div class="card-body">
            ${rol.permisos.length > 0 ? permisosGrouped : '<p class="text-muted small mb-0">Este rol no tiene permisos asignados.</p>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Fixtures seleccionados ────────────────────────────────────────────────────

/** rol-001: Administrador — acceso completo, 10 permisos */
const rolAdmin: Rol = {
  id: 'rol-001',
  nombre: 'Administrador',
  descripcion:
    'Acceso completo al sistema — gestión de usuarios, configuración y todos los módulos',
  esAdmin: true,
  permisos: PERMISOS_CATALOG,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  createdBy: 'system',
  updatedBy: 'system',
};

// ── Meta ──────────────────────────────────────────────────────────────────────

/** Lista y detalle de roles — permisos agrupados por módulo y acciones gateadas */
const meta = {
  title: 'Mockups/Roles',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/roles', () =>
          HttpResponse.json({
            data: rolFixtures,
            total: rolFixtures.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
        http.get('/api/roles/:id', ({ params }) => {
          const rol = rolFixtures.find((r) => r.id === params['id']);
          if (!rol) {
            return HttpResponse.json(
              {
                type: '/errors/not-found',
                title: 'Rol no encontrado',
                status: 404,
                detail: `No existe un rol con id "${String(params['id'])}"`,
              },
              { status: 404 }
            );
          }
          return HttpResponse.json(rol);
        }),
        http.get('/api/permisos', () => HttpResponse.json(PERMISOS_CATALOG)),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Lista completa — los 4 roles con conteo de permisos */
export const ListaRoles: Story = {
  name: 'Lista de roles',
  render: () => buildListaRolesHtml({ roles: rolFixtures }),
};

/** Detalle del rol Administrador — 10 permisos agrupados por módulo */
export const RolDetalle: Story = {
  name: 'Detalle de rol',
  render: () => buildRolDetalleHtml({ rol: rolAdmin }),
};

/** Sin permiso de gestión — botón "Nuevo rol" oculto */
export const SinPermisoGestion: Story = {
  name: 'Sin permiso de gestión',
  render: () => buildListaRolesHtml({ roles: rolFixtures, showNuevoBtn: false }),
};
