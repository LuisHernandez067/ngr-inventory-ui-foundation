import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

// Datos de ejemplo para categorías disponibles en el select
const categoriasEjemplo = [
  { id: 'cat-001', nombre: 'Periféricos' },
  { id: 'cat-002', nombre: 'Monitores' },
  { id: 'cat-003', nombre: 'Almacenamiento' },
  { id: 'cat-004', nombre: 'Redes' },
];

// Datos de un producto existente para el modo editar
const productoEjemplo = {
  id: '1',
  codigo: 'TKL-001',
  nombre: 'Teclado Mecánico TKL',
  descripcion: 'Teclado mecánico tenkeyless con switches Cherry MX Brown.',
  categoriaId: 'cat-001',
  categoriaNombre: 'Periféricos',
  proveedorId: 'prov-001',
  unidadMedida: 'unidad',
  precioUnitario: 8500,
  stockMinimo: 5,
  stockMaximo: 50,
  status: 'active' as const,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-20T14:30:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// Opciones del select de categorías generadas dinámicamente
function categoriaOptions(selectedId?: string): string {
  const defaultOption = '<option value="">Seleccioná una categoría...</option>';
  const options = categoriasEjemplo
    .map((c) => {
      const selected = c.id === selectedId ? ' selected' : '';
      return `<option value="${c.id}"${selected}>${c.nombre}</option>`;
    })
    .join('');
  return defaultOption + options;
}

// Opciones del select de estado
function statusOptions(selectedStatus = 'active'): string {
  return [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'discontinued', label: 'Descontinuado' },
  ]
    .map(
      (opt) =>
        `<option value="${opt.value}"${opt.value === selectedStatus ? ' selected' : ''}>${opt.label}</option>`
    )
    .join('');
}

const meta = {
  title: 'Mockups/Productos/Formulario de producto',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/categorias', () =>
          HttpResponse.json({
            data: categoriasEjemplo,
            total: categoriasEjemplo.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
        http.get('/api/productos/1', () => HttpResponse.json(productoEjemplo)),
        http.post('/api/productos', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { ...productoEjemplo, id: 'prod-new', ...body },
            { status: 201 }
          );
        }),
        http.put('/api/productos/1', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...productoEjemplo, ...body });
        }),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story — formulario vacío para crear nuevo producto */
export const NuevoProducto: Story = {
  name: 'Formulario — nuevo producto',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Productos</a></li>
            <li class="breadcrumb-item active">Nuevo producto</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo producto</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="productos-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del producto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  placeholder="Ej. Teclado Mecánico TKL">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Código SKU <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="sku"
                  placeholder="Ej. TEC-MEC-001">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Precio (COP) <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="number" class="form-control" name="precio" placeholder="0">
                <div class="form-text">Precio sin IVA</div>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Select de categoría con todas las opciones cargadas -->
              <div class="mb-3">
                <label for="categoriaId" class="form-label fw-semibold">
                  Categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="categoriaId" name="categoriaId" class="form-select" required>
                  ${categoriaOptions()}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3"
                  placeholder="Descripción opcional del producto..."></textarea>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="status" class="form-label fw-semibold">Estado</label>
                <select id="status" name="status" class="form-select">
                  ${statusOptions()}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar producto
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

/** Story — formulario pre-completado para editar producto existente */
export const EditarProducto: Story = {
  name: 'Formulario — editar producto',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Productos</a></li>
            <li class="breadcrumb-item active">Editar producto</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Editar producto</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="productos-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del producto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="${productoEjemplo.nombre}">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Código SKU <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="sku"
                  value="${productoEjemplo.codigo}">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Precio (COP) <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="number" class="form-control" name="precio"
                  value="${String(productoEjemplo.precioUnitario)}">
                <div class="form-text">Precio sin IVA</div>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Select de categoría con la categoría del producto preseleccionada -->
              <div class="mb-3">
                <label for="categoriaId" class="form-label fw-semibold">
                  Categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="categoriaId" name="categoriaId" class="form-select" required>
                  ${categoriaOptions(productoEjemplo.categoriaId)}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control" rows="3">${productoEjemplo.descripcion}</textarea>
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="status" class="form-label fw-semibold">Estado</label>
                <select id="status" name="status" class="form-select">
                  ${statusOptions(productoEjemplo.status)}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar producto
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

/** Story — formulario con errores de validación 422 inline por campo */
export const Error422: Story = {
  name: 'Formulario — error 422 (campos inválidos)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/categorias', () =>
          HttpResponse.json({
            data: categoriasEjemplo,
            total: categoriasEjemplo.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
        http.post('/api/productos', () =>
          HttpResponse.json(
            {
              type: '/errors/validation',
              title: 'Error de validación',
              status: 422,
              fields: {
                nombre: 'El nombre del producto es requerido.',
                sku: 'El código SKU debe tener entre 3 y 20 caracteres.',
                categoriaId: 'Seleccioná una categoría válida.',
              },
            },
            { status: 422 }
          )
        ),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Productos</a></li>
            <li class="breadcrumb-item active">Nuevo producto</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo producto</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="productos-form" novalidate>
              <!-- Campo nombre con error de validación -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del producto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control is-invalid" name="nombre" value="">
                <div class="invalid-feedback">El nombre del producto es requerido.</div>
              </div>

              <!-- Campo SKU con error de validación -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Código SKU <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control is-invalid" name="sku" value="AB">
                <div class="invalid-feedback">El código SKU debe tener entre 3 y 20 caracteres.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Precio (COP)</label>
                <input type="number" class="form-control" name="precio" value="8500">
                <div class="invalid-feedback"></div>
              </div>

              <!-- Select de categoría con error -->
              <div class="mb-3">
                <label for="categoriaId" class="form-label fw-semibold">
                  Categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="categoriaId" name="categoriaId" class="form-select is-invalid">
                  ${categoriaOptions()}
                </select>
                <div class="invalid-feedback">Seleccioná una categoría válida.</div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar producto
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

/** Story — formulario con error 409 (SKU duplicado) — alerta global arriba del formulario */
export const ErrorSkuDuplicado: Story = {
  name: 'Formulario — SKU duplicado (409)',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/categorias', () =>
          HttpResponse.json({
            data: categoriasEjemplo,
            total: categoriasEjemplo.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
        ),
        http.post('/api/productos', () =>
          HttpResponse.json(
            {
              type: '/errors/conflict',
              title: 'Conflicto de SKU',
              status: 409,
              detail: 'Ya existe un producto con el código SKU "TKL-001".',
            },
            { status: 409 }
          )
        ),
      ],
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Productos</a></li>
            <li class="breadcrumb-item active">Nuevo producto</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo producto</h1>
        </div>

        <!-- Alerta global de SKU duplicado — se muestra encima del formulario -->
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-3 alert-global" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>Ya existe un producto con este SKU</span>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="productos-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del producto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="Teclado Mecánico Cherry">
                <div class="invalid-feedback"></div>
              </div>

              <!-- El SKU ya existe en el sistema -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Código SKU <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="sku" value="TKL-001">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Precio (COP)</label>
                <input type="number" class="form-control" name="precio" value="9200">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="categoriaId" class="form-label fw-semibold">
                  Categoría <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="categoriaId" name="categoriaId" class="form-select">
                  ${categoriaOptions('cat-001')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar producto
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
