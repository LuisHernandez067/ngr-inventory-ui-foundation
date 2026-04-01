import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para un almacén con datos completos y conteo de ubicaciones */
interface AlmacenEjemplo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  responsableNombre: string | undefined;
  ubicacionCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Almacén de referencia para stories de edición y detalle
const almacenCentral: AlmacenEjemplo = {
  id: 'alm-001',
  codigo: 'DEP-CEN',
  nombre: 'Depósito Central',
  descripcion: 'Almacén principal para todos los productos.',
  direccion: 'Av. Industrial 1234, Buenos Aires',
  responsableNombre: 'Carlos López',
  ubicacionCount: 3,
  status: 'active',
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-06-15T10:30:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// Datos de ejemplo para la lista de almacenes
const almacenesEjemplo: AlmacenEjemplo[] = [
  almacenCentral,
  {
    id: 'alm-002',
    codigo: 'DEP-SUR',
    nombre: 'Depósito Sur',
    descripcion: 'Almacén secundario en zona sur.',
    direccion: 'Ruta 9 Km 14, Córdoba',
    responsableNombre: 'Ana Martínez',
    ubicacionCount: 3,
    status: 'active',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-07-20T11:00:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'alm-003',
    codigo: 'DEP-OES',
    nombre: 'Depósito Oeste',
    descripcion: 'Almacén temporal en zona oeste.',
    direccion: 'Calle Falsa 456, Mendoza',
    responsableNombre: undefined,
    ubicacionCount: 0,
    status: 'inactive',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

// Ubicaciones para el detalle del almacén
const ubicacionesDeAlm001 = [
  {
    id: 'ubi-001',
    codigo: 'R1-E1',
    nombre: 'Rack 1 Estante 1',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'estante',
    capacidad: 100,
    status: 'active' as const,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'ubi-002',
    codigo: 'R1-E2',
    nombre: 'Rack 1 Estante 2',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'estante',
    capacidad: 100,
    status: 'active' as const,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'ubi-003',
    codigo: 'R2-E1',
    nombre: 'Rack 2 Estante 1',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'estante',
    capacidad: 80,
    status: 'inactive' as const,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

/** Genera el HTML de un par definición/valor para la lista de detalles */
function dtRow(label: string, value: string | undefined): string {
  const display = value ?? '—';
  return `
    <dt class="col-sm-5 text-muted fw-normal">${label}</dt>
    <dd class="col-sm-7 fw-semibold mb-2">${display}</dd>
  `;
}

/** Genera la mini-tabla de ubicaciones embebidas */
function buildUbicacionesTableHtml(
  ubicaciones: { id: string; nombre: string; status: 'active' | 'inactive' }[]
): string {
  if (ubicaciones.length === 0) {
    return `<p class="text-muted fst-italic">Sin ubicaciones registradas</p>`;
  }
  const rows = ubicaciones
    .map(
      (u) =>
        `<tr>
          <td>${u.nombre}</td>
          <td><span class="badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}">${u.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
        </tr>`
    )
    .join('');
  return `
    <table class="table table-sm table-hover">
      <thead>
        <tr><th>Nombre</th><th>Estado</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

const meta = {
  title: 'Mockups/Almacenes/Almacenes',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/almacenes', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          return HttpResponse.json({
            data: almacenesEjemplo,
            total: almacenesEjemplo.length,
            page,
            pageSize: 20,
            totalPages: 1,
          });
        }),
        http.get('/api/almacenes/alm-001', () => HttpResponse.json(almacenCentral)),
        http.get('/api/ubicaciones', ({ request }) => {
          const url = new URL(request.url);
          const almacenId = url.searchParams.get('almacenId');
          const data = almacenId === 'alm-001' ? ubicacionesDeAlm001 : [];
          return HttpResponse.json({
            data,
            total: data.length,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          });
        }),
        http.delete('/api/almacenes/:id', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story principal — lista de almacenes con datos de ejemplo */
export const AlmacenesList: Story = {
  name: 'Lista de almacenes',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Almacenes</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Almacenes</h1>
          <button class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Nuevo almacén
          </button>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="p-3 border-bottom">
              <input type="search" class="form-control" placeholder="Buscar almacenes...">
            </div>
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th style="width:110px;">Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Dirección</th>
                  <th style="width:160px;">Responsable</th>
                  <th style="width:100px;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${almacenesEjemplo
                  .map(
                    (a) => `
                  <tr style="cursor:pointer;">
                    <td>${a.codigo}</td>
                    <td>${a.nombre}</td>
                    <td>${a.descripcion}</td>
                    <td>${a.direccion}</td>
                    <td>${a.responsableNombre ?? '—'}</td>
                    <td><span class="badge ${a.status === 'active' ? 'bg-success' : 'bg-secondary'}">${a.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — formulario vacío para crear nuevo almacén */
export const AlmacenesForm: Story = {
  name: 'Formulario — nuevo almacén',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/almacenes', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...almacenCentral, id: 'alm-new', ...body }, { status: 201 });
        }),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Almacenes</a></li>
            <li class="breadcrumb-item active">Nuevo almacén</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo almacén</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="almacenes-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del almacén <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  placeholder="Ej. Depósito Central">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
                  placeholder="Descripción opcional del almacén..."></textarea>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="activo" name="activo" checked>
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar almacén
                </button>
                <a href="#" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — formulario pre-completado para editar almacén */
export const AlmacenesFormEdit: Story = {
  name: 'Formulario — editar almacén',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/almacenes/alm-001', () => HttpResponse.json(almacenCentral)),
        http.put('/api/almacenes/alm-001', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...almacenCentral, ...body });
        }),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Almacenes</a></li>
            <li class="breadcrumb-item active">Editar almacén</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Editar almacén</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="almacenes-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del almacén <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="${almacenCentral.nombre}">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3">${almacenCentral.descripcion}</textarea>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="activo" name="activo"
                    ${almacenCentral.status === 'active' ? 'checked' : ''}>
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar almacén
                </button>
                <a href="#" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — detalle de almacén con ubicaciones embebidas */
export const AlmacenesDetail: Story = {
  name: 'Detalle de almacén',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/almacenes/alm-001', () => HttpResponse.json(almacenCentral)),
        http.get('/api/ubicaciones', ({ request }) => {
          const url = new URL(request.url);
          const almacenId = url.searchParams.get('almacenId');
          const data = almacenId === 'alm-001' ? ubicacionesDeAlm001 : [];
          return HttpResponse.json({
            data,
            total: data.length,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          });
        }),
        http.delete('/api/almacenes/alm-001', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
  render: () => {
    const almacen = almacenCentral;
    return `
      <div class="bg-body-secondary min-vh-100">
        <div class="bg-body border-bottom px-4 py-3">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Inicio</a></li>
              <li class="breadcrumb-item"><a href="#">Almacenes</a></li>
              <li class="breadcrumb-item active">${almacen.nombre}</li>
            </ol>
          </nav>
        </div>
        <div class="container-fluid p-4">
          <!-- Barra superior: botón volver + acciones -->
          <div class="d-flex align-items-center justify-content-between mb-4">
            <button type="button" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Almacenes
            </button>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-pencil me-1"></i> Editar
              </button>
              <button class="btn btn-outline-danger btn-sm">
                <i class="bi bi-trash me-1"></i> Eliminar
              </button>
            </div>
          </div>

          <!-- Encabezado con nombre y badge -->
          <div class="d-flex align-items-center gap-3 mb-1">
            <h1 class="h3 mb-0">${almacen.nombre}</h1>
            <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle">Activo</span>
          </div>
          <p class="text-muted mb-3">Código: ${almacen.codigo}</p>

          <!-- Alerta de impacto -->
          <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <span>Este almacén tiene ${String(almacen.ubicacionCount)} ubicaciones asociadas. Eliminar el almacén afectará el inventario.</span>
          </div>

          <!-- Tarjeta de información -->
          <div class="row g-3 mb-4">
            <div class="col-12 col-md-6">
              <div class="card h-100">
                <div class="card-header fw-semibold">
                  <i class="bi bi-building me-2" aria-hidden="true"></i>
                  Información
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    ${dtRow('Código', almacen.codigo)}
                    ${dtRow('Nombre', almacen.nombre)}
                    ${dtRow('Descripción', almacen.descripcion)}
                    ${dtRow('Dirección', almacen.direccion)}
                    ${dtRow('Responsable', almacen.responsableNombre)}
                    ${dtRow('Estado', almacen.status === 'active' ? 'Activo' : 'Inactivo')}
                    ${dtRow('Ubicaciones', String(almacen.ubicacionCount))}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de ubicaciones embebidas -->
          <div class="card">
            <div class="card-header fw-semibold">
              <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
              Ubicaciones
            </div>
            <div class="card-body">
              ${buildUbicacionesTableHtml(ubicacionesDeAlm001)}
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
