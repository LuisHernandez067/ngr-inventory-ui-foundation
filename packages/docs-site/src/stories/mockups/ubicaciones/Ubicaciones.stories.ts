import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para una ubicación con datos completos */
interface UbicacionEjemplo {
  id: string;
  codigo: string;
  nombre: string;
  almacenId: string;
  almacenNombre: string;
  tipo: string;
  capacidad?: number;
  descripcion?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Almacenes disponibles para el select de formulario
const almacenesDisponibles = [
  { id: 'alm-001', nombre: 'Depósito Central' },
  { id: 'alm-002', nombre: 'Depósito Sur' },
  { id: 'alm-003', nombre: 'Depósito Oeste' },
];

// Ubicación de referencia para stories de edición y detalle
const ubicacionRack1: UbicacionEjemplo = {
  id: 'ubi-001',
  codigo: 'R1-E1',
  nombre: 'Rack 1 Estante 1',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  tipo: 'estante',
  capacidad: 100,
  descripcion: 'Primer estante del rack 1, zona de periféricos.',
  status: 'active',
  createdAt: '2024-01-10T08:00:00Z',
  updatedAt: '2024-06-15T10:30:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// Datos de ejemplo para la lista de ubicaciones
const ubicacionesEjemplo: UbicacionEjemplo[] = [
  ubicacionRack1,
  {
    id: 'ubi-002',
    codigo: 'R1-E2',
    nombre: 'Rack 1 Estante 2',
    almacenId: 'alm-001',
    almacenNombre: 'Depósito Central',
    tipo: 'estante',
    capacidad: 100,
    status: 'active',
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
    status: 'inactive',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'ubi-004',
    codigo: 'ZF-001',
    nombre: 'Zona Fría 1',
    almacenId: 'alm-002',
    almacenNombre: 'Depósito Sur',
    tipo: 'zona',
    status: 'active',
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-07-20T11:00:00Z',
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

/** Genera las opciones HTML para el select de almacenes */
function almacenOptions(selectedId?: string): string {
  const defaultOpt = '<option value="">— Seleccione un almacén —</option>';
  const opts = almacenesDisponibles
    .map(
      (a) => `<option value="${a.id}"${a.id === selectedId ? ' selected' : ''}>${a.nombre}</option>`
    )
    .join('');
  return defaultOpt + opts;
}

const meta = {
  title: 'Mockups/Ubicaciones/Ubicaciones',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/ubicaciones', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          const almacenId = url.searchParams.get('almacenId');
          const data = almacenId
            ? ubicacionesEjemplo.filter((u) => u.almacenId === almacenId)
            : ubicacionesEjemplo;
          return HttpResponse.json({
            data,
            total: data.length,
            page,
            pageSize: 50,
            totalPages: 1,
          });
        }),
        http.get('/api/almacenes', () =>
          HttpResponse.json({
            data: almacenesDisponibles.map((a) => ({
              ...a,
              codigo: a.id.toUpperCase(),
              status: 'active',
              ubicacionCount: 2,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'admin@ngr.com',
              updatedBy: 'admin@ngr.com',
            })),
            total: almacenesDisponibles.length,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })
        ),
        http.get('/api/ubicaciones/ubi-001', () => HttpResponse.json(ubicacionRack1)),
        http.delete('/api/ubicaciones/:id', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story principal — lista de ubicaciones con filtro por almacén */
export const UbicacionesList: Story = {
  name: 'Lista de ubicaciones (con filtro)',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Ubicaciones</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Ubicaciones</h1>
          <a href="#/ubicaciones/nuevo" class="btn btn-primary">
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
            Nueva ubicación
          </a>
        </div>

        <!-- Barra de filtros -->
        <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <div>
            <label for="almacen-filter" class="form-label small mb-1">Filtrar por almacén</label>
            <select id="almacen-filter" class="form-select form-select-sm" style="min-width:200px;">
              <option value="">Todos los almacenes</option>
              ${almacenesDisponibles
                .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
                .join('')}
            </select>
          </div>
          <div>
            <label for="ubicaciones-search" class="form-label small mb-1">Buscar</label>
            <input id="ubicaciones-search" type="search" class="form-control form-control-sm"
              placeholder="Buscar ubicaciones..." style="min-width:200px;">
          </div>
        </div>

        <!-- Tabla de ubicaciones -->
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="width:110px;">Código</th>
                <th>Nombre</th>
                <th>Almacén</th>
                <th style="width:100px;">Tipo</th>
                <th style="width:100px;">Estado</th>
                <th style="width:80px;"></th>
              </tr>
            </thead>
            <tbody>
              ${ubicacionesEjemplo
                .map(
                  (u) => `
                <tr style="cursor:pointer;">
                  <td>${u.codigo}</td>
                  <td>${u.nombre}</td>
                  <td>${u.almacenNombre}</td>
                  <td>${u.tipo}</td>
                  <td>
                    <span class="badge ${u.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                      ${u.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" title="Eliminar">
                      <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};

/** Story — formulario vacío para crear nueva ubicación */
export const UbicacionesForm: Story = {
  name: 'Formulario — nueva ubicación',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/ubicaciones', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...ubicacionRack1, id: 'ubi-new', ...body }, { status: 201 });
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
            <li class="breadcrumb-item"><a href="#">Ubicaciones</a></li>
            <li class="breadcrumb-item active">Nueva ubicación</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nueva ubicación</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="ubicaciones-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre de la ubicación <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  placeholder="Ej. Rack 1 Estante 1">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="almacenId" class="form-label">
                  Almacén <span class="text-danger">*</span>
                </label>
                <select id="almacenId" name="almacenId" class="form-select" required>
                  ${almacenOptions()}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
                  placeholder="Descripción opcional de la ubicación..."></textarea>
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
                  Guardar ubicación
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

/** Story — formulario pre-completado para editar ubicación */
export const UbicacionesFormEdit: Story = {
  name: 'Formulario — editar ubicación',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/ubicaciones/ubi-001', () => HttpResponse.json(ubicacionRack1)),
        http.put('/api/ubicaciones/ubi-001', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...ubicacionRack1, ...body });
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
            <li class="breadcrumb-item"><a href="#">Ubicaciones</a></li>
            <li class="breadcrumb-item active">Editar ubicación</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Editar ubicación</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="ubicaciones-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre de la ubicación <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="${ubicacionRack1.nombre}">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="almacenId" class="form-label">
                  Almacén <span class="text-danger">*</span>
                </label>
                <select id="almacenId" name="almacenId" class="form-select" required>
                  ${almacenOptions(ubicacionRack1.almacenId)}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3">${ubicacionRack1.descripcion ?? ''}</textarea>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="activo" name="activo"
                    ${ubicacionRack1.status === 'active' ? 'checked' : ''}>
                  <label class="form-check-label" for="activo">Activo</label>
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar ubicación
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

/** Story — detalle de ubicación con enlace al almacén padre */
export const UbicacionesDetail: Story = {
  name: 'Detalle de ubicación',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/ubicaciones/ubi-001', () => HttpResponse.json(ubicacionRack1)),
        http.delete('/api/ubicaciones/ubi-001', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
  render: () => {
    const ubicacion = ubicacionRack1;
    const almacenLink = `<a href="#/almacenes/${ubicacion.almacenId}" class="text-decoration-none">${ubicacion.almacenNombre}</a>`;

    return `
      <div class="bg-body-secondary min-vh-100">
        <div class="bg-body border-bottom px-4 py-3">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0 small">
              <li class="breadcrumb-item"><a href="#">Inicio</a></li>
              <li class="breadcrumb-item"><a href="#">Ubicaciones</a></li>
              <li class="breadcrumb-item active">${ubicacion.nombre}</li>
            </ol>
          </nav>
        </div>
        <div class="container-fluid p-4">
          <!-- Barra superior: botón volver + acciones -->
          <div class="d-flex align-items-center justify-content-between mb-4">
            <button type="button" class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
              Volver a Ubicaciones
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

          <!-- Encabezado con nombre y badge de estado -->
          <div class="d-flex align-items-center gap-3 mb-1">
            <h1 class="h3 mb-0">${ubicacion.nombre}</h1>
            <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle">Activo</span>
          </div>
          <p class="text-muted mb-4">Código: ${ubicacion.codigo}</p>

          <!-- Tarjetas de detalle -->
          <div class="row g-3">
            <!-- Tarjeta: Información -->
            <div class="col-12 col-md-6">
              <div class="card h-100">
                <div class="card-header fw-semibold">
                  <i class="bi bi-geo-alt me-2" aria-hidden="true"></i>
                  Información
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    ${dtRow('Código', ubicacion.codigo)}
                    ${dtRow('Nombre', ubicacion.nombre)}
                    ${dtRow('Tipo', ubicacion.tipo)}
                    ${dtRow('Capacidad', ubicacion.capacidad !== undefined ? String(ubicacion.capacidad) : undefined)}
                    ${dtRow('Estado', ubicacion.status === 'active' ? 'Activo' : 'Inactivo')}
                  </dl>
                </div>
              </div>
            </div>

            <!-- Tarjeta: Almacén padre -->
            <div class="col-12 col-md-6">
              <div class="card h-100">
                <div class="card-header fw-semibold">
                  <i class="bi bi-building me-2" aria-hidden="true"></i>
                  Almacén
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    <dt class="col-sm-5 text-muted fw-normal">Almacén padre</dt>
                    <dd class="col-sm-7 fw-semibold mb-2">${almacenLink}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
