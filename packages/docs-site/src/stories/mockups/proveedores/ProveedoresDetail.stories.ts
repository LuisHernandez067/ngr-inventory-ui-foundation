import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

// Datos de ejemplo para un proveedor completo
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

const proveedorInactivo = {
  id: 'prov-002',
  codigo: 'IMP-SUR',
  razonSocial: 'Importadora del Sur S.R.L.',
  ruc: '33-45678901-9',
  email: 'ventas@impsurmails.com.ar',
  telefono: '+54 351 890-1234',
  direccion: 'Ruta 9 Km 14, Córdoba',
  status: 'inactive' as const,
  createdAt: '2023-06-01T08:00:00Z',
  updatedAt: '2024-03-10T09:00:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

const proveedorSuspendido = {
  id: 'prov-003',
  codigo: 'SUSP-001',
  razonSocial: 'Distribuidora Suspendida S.A.',
  ruc: '30-99887766-5',
  email: 'info@suspendida.com',
  telefono: '+54 11 1111-2222',
  direccion: 'Calle Falsa 123, Buenos Aires',
  status: 'suspended' as const,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

const meta = {
  title: 'Mockups/Proveedores/Detalle de proveedor',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/proveedores/prov-001', () => HttpResponse.json(proveedorEjemplo)),
        http.delete('/api/proveedores/prov-001', () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Genera el HTML de un par definición/valor para la lista de detalles */
function dtRow(label: string, value: string | undefined): string {
  const display = value ?? '—';
  return `
    <dt class="col-sm-5 text-muted fw-normal">${label}</dt>
    <dd class="col-sm-7 fw-semibold mb-2">${display}</dd>
  `;
}

/** HTML del detalle completo de un proveedor */
function buildDetailHtml(proveedor: {
  id: string;
  codigo: string;
  razonSocial: string;
  ruc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}): string {
  const statusMap = {
    active: { label: 'Activo', css: 'bg-success-subtle text-success border-success-subtle' },
    inactive: {
      label: 'Inactivo',
      css: 'bg-secondary-subtle text-secondary border-secondary-subtle',
    },
    suspended: { label: 'Suspendido', css: 'bg-warning-subtle text-warning border-warning-subtle' },
  };
  const statusInfo = statusMap[proveedor.status];

  // Formatear fechas para mostrar
  const createdDate = new Date(proveedor.createdAt).toLocaleDateString('es-AR');
  const updatedDate = new Date(proveedor.updatedAt).toLocaleDateString('es-AR');

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">${proveedor.razonSocial}</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <!-- Barra superior: botón volver + acciones -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Proveedores
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

        <!-- Encabezado con razón social y badge de estado -->
        <div class="d-flex align-items-center gap-3 mb-1">
          <h1 class="h3 mb-0">${proveedor.razonSocial}</h1>
          <span class="badge rounded-pill border ${statusInfo.css}">${statusInfo.label}</span>
        </div>
        <p class="text-muted mb-4">Código: ${proveedor.codigo}</p>

        <!-- Tarjetas de detalle -->
        <div class="row g-3">
          <!-- Tarjeta 1: Datos Fiscales -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-building me-2" aria-hidden="true"></i>
                Datos Fiscales
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${dtRow('RUC / CUIT', proveedor.ruc)}
                  ${dtRow('Razón Social', proveedor.razonSocial)}
                  ${dtRow('Dirección', proveedor.direccion)}
                </dl>
              </div>
            </div>
          </div>

          <!-- Tarjeta 2: Contacto -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-telephone me-2" aria-hidden="true"></i>
                Contacto
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${dtRow('Email', proveedor.email)}
                  ${dtRow('Teléfono', proveedor.telefono)}
                </dl>
              </div>
            </div>
          </div>

          <!-- Tarjeta 3: Auditoría -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-clock-history me-2" aria-hidden="true"></i>
                Auditoría
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${dtRow('Creado', createdDate)}
                  ${dtRow('Última modificación', updatedDate)}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Story principal — proveedor activo con todos los campos completos */
export const Predeterminado: Story = {
  render: () => buildDetailHtml(proveedorEjemplo),
};

/** Story — proveedor inactivo */
export const ProveedorInactivo: Story = {
  name: 'Proveedor inactivo',
  parameters: {
    msw: {
      handlers: [http.get('/api/proveedores/prov-002', () => HttpResponse.json(proveedorInactivo))],
    },
  },
  render: () => buildDetailHtml(proveedorInactivo),
};

/** Story — proveedor suspendido */
export const ProveedorSuspendido: Story = {
  name: 'Proveedor suspendido',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/proveedores/prov-003', () => HttpResponse.json(proveedorSuspendido)),
      ],
    },
  },
  render: () => buildDetailHtml(proveedorSuspendido),
};

/** Story — rol consulta (sin botones de editar/eliminar) */
export const RolConsulta: Story = {
  name: 'Vista solo lectura (rol consulta)',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Proveedores</a></li>
            <li class="breadcrumb-item active">TechDistrib Argentina S.A.</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <!-- Sin botones de acción para rol consulta -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Proveedores
          </button>
        </div>
        <div class="d-flex align-items-center gap-3 mb-1">
          <h1 class="h3 mb-0">TechDistrib Argentina S.A.</h1>
          <span class="badge rounded-pill border bg-success-subtle text-success border-success-subtle">Activo</span>
        </div>
        <p class="text-muted mb-4">Código: TD-ARG</p>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-building me-2"></i> Datos Fiscales
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${dtRow('RUC / CUIT', '30-71234567-8')}
                  ${dtRow('Razón Social', 'TechDistrib Argentina S.A.')}
                  ${dtRow('Dirección', 'Av. Corrientes 1234, Piso 5, Buenos Aires')}
                </dl>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-telephone me-2"></i> Contacto
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${dtRow('Email', 'contacto@techdistrib.com.ar')}
                  ${dtRow('Teléfono', '+54 11 4567-8900')}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
