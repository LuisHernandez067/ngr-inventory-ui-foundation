import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

// Datos de ejemplo para el formulario de proveedor
const proveedorEjemplo = {
  id: 'prov-001',
  codigo: 'TD-ARG',
  razonSocial: 'TechDistrib Argentina S.A.',
  ruc: '30-71234567-8',
  email: 'contacto@techdistrib.com.ar',
  telefono: '+54 11 4567-8900',
  direccion: 'Av. Corrientes 1234, Piso 5, Buenos Aires',
  status: 'active' as const,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-09-20T14:30:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

const meta = {
  title: 'Mockups/Proveedores/Formulario de proveedor',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/proveedores/prov-001', () => HttpResponse.json(proveedorEjemplo)),
        http.post('/api/proveedores', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { ...proveedorEjemplo, id: 'prov-new', ...body },
            { status: 201 }
          );
        }),
        http.put('/api/proveedores/prov-001', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ ...proveedorEjemplo, ...body });
        }),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story — formulario vacío para crear nuevo proveedor */
export const NuevoProveedor: Story = {
  name: 'Formulario — nuevo proveedor',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">Nuevo proveedor</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo proveedor</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="proveedores-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del proveedor <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  placeholder="Ej. Distribuciones García S.A.">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Persona de contacto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="contacto"
                  placeholder="Ej. Juan Pérez">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Correo electrónico <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="email" class="form-control" name="email"
                  placeholder="Ej. contacto@proveedor.com">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-control" name="telefono"
                  placeholder="Ej. +54 11 1234-5678">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="status" class="form-label fw-semibold">Estado</label>
                <select id="status" name="status" class="form-select">
                  <option value="active" selected>Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar proveedor
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

/** Story — formulario pre-completado en modo editar */
export const EditarProveedor: Story = {
  name: 'Formulario — editar proveedor',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">Editar proveedor</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Editar proveedor</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="proveedores-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del proveedor <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="TechDistrib Argentina S.A.">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Persona de contacto <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="contacto"
                  value="Carlos Rodríguez">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Correo electrónico <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="email" class="form-control" name="email"
                  value="contacto@techdistrib.com.ar">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-control" name="telefono"
                  value="+54 11 4567-8900">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="status" class="form-label fw-semibold">Estado</label>
                <select id="status" name="status" class="form-select">
                  <option value="active" selected>Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar proveedor
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

/** Story — formulario con errores de validación 422 inline */
export const Error422: Story = {
  name: 'Formulario — error 422 (campos inválidos)',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/proveedores', () =>
          HttpResponse.json(
            {
              type: '/errors/validation',
              title: 'Error de validación',
              status: 422,
              fields: {
                nombre: 'El nombre del proveedor es requerido.',
                email: 'Ingresá un correo electrónico válido.',
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
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">Nuevo proveedor</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo proveedor</h1>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="proveedores-form" novalidate>
              <!-- Campo nombre con error -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del proveedor <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control is-invalid" name="nombre" value="">
                <div class="invalid-feedback">El nombre del proveedor es requerido.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Persona de contacto</label>
                <input type="text" class="form-control" name="contacto" value="María López">
                <div class="invalid-feedback"></div>
              </div>

              <!-- Campo email con error -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Correo electrónico <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="email" class="form-control is-invalid" name="email" value="email-no-valido">
                <div class="invalid-feedback">Ingresá un correo electrónico válido.</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-control" name="telefono" value="">
                <div class="invalid-feedback"></div>
              </div>

              <div class="mb-3">
                <label for="status" class="form-label fw-semibold">Estado</label>
                <select id="status" name="status" class="form-select">
                  <option value="active" selected>Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar proveedor
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

/** Story — formulario con error genérico de servidor (500) */
export const ErrorServidor: Story = {
  name: 'Formulario — error de servidor (500)',
  parameters: {
    msw: {
      handlers: [
        http.post('/api/proveedores', () =>
          HttpResponse.json(
            {
              type: '/errors/internal',
              title: 'Error interno del servidor',
              status: 500,
            },
            { status: 500 }
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
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">Nuevo proveedor</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 720px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo proveedor</h1>
        </div>

        <!-- Alerta de error global -->
        <div class="alert alert-danger d-flex align-items-center gap-2 mb-3 alert-global" role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span>Error al guardar el proveedor. Intente nuevamente.</span>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <form id="proveedores-form" novalidate>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Nombre del proveedor <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="text" class="form-control" name="nombre"
                  value="Nuevo Proveedor Test">
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Correo electrónico <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input type="email" class="form-control" name="email"
                  value="test@proveedor.com">
                <div class="invalid-feedback"></div>
              </div>
              <div class="d-flex gap-2 mt-4">
                <button id="btn-submit" type="submit" class="btn btn-primary">
                  Guardar proveedor
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
