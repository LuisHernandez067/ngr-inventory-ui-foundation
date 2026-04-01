import type { PaginatedResponse } from '@ngr-inventory/api-contracts';
import { render as renderPageHeader } from '@ngr-inventory/ui-core/components/page-header';
import type { ColumnDef } from '@ngr-inventory/ui-patterns';
import {
  render as renderDataTable,
  init as initDataTable,
} from '@ngr-inventory/ui-patterns/patterns/data-table';
import { render as renderStatusBadge } from '@ngr-inventory/ui-patterns/patterns/status-badge';
import {
  render as renderToolbar,
  init as initToolbar,
} from '@ngr-inventory/ui-patterns/patterns/table-toolbar';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

// Type helpers for untyped deep imports (modules without TS declarations)
type RenderFn = (opts: Record<string, unknown>) => string;
type InitFn = (el: HTMLElement, opts?: Record<string, unknown>) => void;
const typedRenderToolbar = renderToolbar as RenderFn;
const typedInitToolbar = initToolbar as InitFn;
const typedRenderDataTable = renderDataTable as RenderFn;
const typedInitDataTable = initDataTable as InitFn;
const typedRenderPageHeader = renderPageHeader as RenderFn;
const typedRenderStatusBadge = renderStatusBadge as (opts: { status: string }) => string;

// Datos de ejemplo para categorías
const categoriasEjemplo = [
  {
    id: 'cat-001',
    codigo: 'PER',
    nombre: 'Periféricos',
    descripcion: 'Teclados, mouse, auriculares y accesorios de computación.',
    status: 'active' as const,
    productoCount: 12,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'cat-002',
    codigo: 'MON',
    nombre: 'Monitores',
    descripcion: 'Pantallas LCD, LED y OLED de diversas resoluciones.',
    status: 'active' as const,
    productoCount: 5,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'cat-003',
    codigo: 'ALM',
    nombre: 'Almacenamiento',
    descripcion: 'Discos rígidos, SSDs y memorias USB.',
    status: 'active' as const,
    productoCount: 0,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
  {
    id: 'cat-004',
    codigo: 'RED',
    nombre: 'Redes',
    descripcion: 'Switches, routers y cables de red.',
    status: 'inactive' as const,
    productoCount: 3,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

const meta = {
  title: 'Mockups/Categorías/Lista de categorías',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/categorias', ({ request }) => {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get('page') ?? '1');
          const response: PaginatedResponse<(typeof categoriasEjemplo)[0]> = {
            data: categoriasEjemplo,
            total: categoriasEjemplo.length,
            page,
            pageSize: 20,
            totalPages: 1,
          };
          return HttpResponse.json(response);
        }),
        http.delete('/api/categorias/:id', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Columnas de la tabla de categorías
const columnas: ColumnDef[] = [
  { key: 'codigo', header: 'Código', width: '100px' },
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'descripcion', header: 'Descripción' },
  {
    key: 'status',
    header: 'Estado',
    width: '130px',
    render: (val) => typedRenderStatusBadge({ status: String(val) }),
  },
];

/** Story principal — lista de categorías con datos de ejemplo */
export const Predeterminado: Story = {
  render: () => {
    const toolbarId = 'mockup-toolbar-categorias';
    const tableId = 'mockup-table-categorias';

    async function initTable(): Promise<void> {
      const toolbar = document.getElementById(toolbarId);
      const table = document.getElementById(tableId);
      if (toolbar) typedInitToolbar(toolbar);
      if (!table) return;

      const response = await fetch('/api/categorias?page=1&pageSize=20');
      const result = (await response.json()) as PaginatedResponse<Record<string, unknown>>;

      typedInitDataTable(table, { columns: columnas, rows: result.data });
    }

    setTimeout(() => {
      void initTable();
    }, 0);

    const pageHeader = typedRenderPageHeader({
      title: 'Categorías',
      breadcrumb:
        '<ol class="breadcrumb mb-0 small"><li class="breadcrumb-item"><a href="#">Inicio</a></li><li class="breadcrumb-item"><a href="#">Catálogo</a></li><li class="breadcrumb-item active">Categorías</li></ol>',
    });

    const toolbar = typedRenderToolbar({
      searchPlaceholder: 'Buscar categorías...',
    });

    return `
      <div class="bg-body-secondary min-vh-100">
        ${pageHeader}
        <div class="container-fluid p-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div id="${toolbarId}" class="p-3 border-bottom">
                ${toolbar}
              </div>
              <div id="${tableId}">
                ${typedRenderDataTable({ columns: columnas, rows: [], loading: true })}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

/** Story de estado vacío — sin resultados de búsqueda */
export const SinDatos: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/categorias', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
        ),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100 p-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-5 text-center">
          <i class="bi bi-tag text-muted fs-1 mb-3 d-block"></i>
          <h5>Sin categorías registradas</h5>
          <p class="text-muted">Aún no hay categorías en el catálogo. Creá la primera.</p>
          <button class="btn btn-primary">Nueva categoría</button>
        </div>
      </div>
    </div>
  `,
};

/** Story de detalle — categoría con productos asociados (muestra badge de impacto) */
export const Detalle: Story = {
  name: 'Detalle de categoría',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/categorias/cat-001', () => HttpResponse.json(categoriasEjemplo[0])),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Categorías</a></li>
            <li class="breadcrumb-item active">Periféricos</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <!-- Barra superior: botón volver + acciones -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Categorías
          </button>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm">Editar</button>
            <button class="btn btn-outline-danger btn-sm">Eliminar</button>
          </div>
        </div>

        <!-- Encabezado con nombre y badge de estado -->
        <div class="d-flex align-items-center gap-3 mb-1">
          <h1 class="h3 mb-0">Periféricos</h1>
          <span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle">Activo</span>
          <span class="badge rounded-pill bg-info-subtle text-info border border-info-subtle">12 productos asociados</span>
        </div>
        <p class="text-muted mb-3">Código: PER</p>

        <!-- Alerta de impacto — visible cuando hay productos asociados -->
        <div class="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert" id="impact-warning">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>Esta categoría tiene 12 productos asociados. Eliminarla afectará el catálogo.</span>
        </div>

        <!-- Tarjeta de información -->
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-tag me-2" aria-hidden="true"></i>
                Información
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-5 text-muted fw-normal">Código</dt>
                  <dd class="col-sm-7 fw-semibold mb-2">PER</dd>
                  <dt class="col-sm-5 text-muted fw-normal">Nombre</dt>
                  <dd class="col-sm-7 fw-semibold mb-2">Periféricos</dd>
                  <dt class="col-sm-5 text-muted fw-normal">Descripción</dt>
                  <dd class="col-sm-7 fw-semibold mb-2">Teclados, mouse, auriculares y accesorios de computación.</dd>
                  <dt class="col-sm-5 text-muted fw-normal">Estado</dt>
                  <dd class="col-sm-7 fw-semibold mb-2">Activo</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story de formulario — nueva categoría (formulario vacío) */
export const FormularioNueva: Story = {
  name: 'Formulario — nueva categoría',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Categorías</a></li>
            <li class="breadcrumb-item active">Nueva categoría</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nueva categoría</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre de la categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre" placeholder="Ej. Periféricos">
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" name="descripcion" rows="3"
                  placeholder="Descripción opcional de la categoría..."></textarea>
                <div class="invalid-feedback"></div>
              </div>
              <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Guardar categoría</button>
                <a href="#" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story de formulario — editar categoría (campos pre-completados) */
export const FormularioEditar: Story = {
  name: 'Formulario — editar categoría',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/categorias/cat-001', () => HttpResponse.json(categoriasEjemplo[0])),
        http.put('/api/categorias/cat-001', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...categoriasEjemplo[0], ...body });
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
            <li class="breadcrumb-item"><a href="#">Categorías</a></li>
            <li class="breadcrumb-item active">Editar categoría</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Editar categoría</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre de la categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre" value="Periféricos">
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" name="descripcion" rows="3">Teclados, mouse, auriculares y accesorios de computación.</textarea>
                <div class="invalid-feedback"></div>
              </div>
              <div class="d-flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary">Guardar categoría</button>
                <a href="#" class="btn btn-outline-secondary">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
};
