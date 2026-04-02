import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para un ítem de movimiento */
interface MovimientoItemEjemplo {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

/** Tipo para un movimiento de inventario completo */
interface MovimientoEjemplo {
  id: string;
  numero: string;
  tipo: 'entrada' | 'salida' | 'transferencia' | 'ajuste' | 'devolucion';
  estado: 'borrador' | 'pendiente' | 'aprobado' | 'ejecutado' | 'anulado';
  almacenOrigenId?: string;
  almacenOrigenNombre?: string;
  almacenDestinoId?: string;
  almacenDestinoNombre?: string;
  proveedorId?: string;
  proveedorNombre?: string;
  items: MovimientoItemEjemplo[];
  observacion?: string;
  fechaEjecucion?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/** Tipo para un proveedor simplificado */
interface ProveedorSimple {
  id: string;
  razonSocial: string;
}

/** Tipo para un almacén simplificado */
interface AlmacenSimple {
  id: string;
  nombre: string;
}

// Movimiento en estado borrador — permite "Enviar a Pendiente" y "Anular"
const movimientoBorrador: MovimientoEjemplo = {
  id: 'mov-007',
  numero: 'MOV-2025-0007',
  tipo: 'salida',
  estado: 'borrador',
  almacenOrigenId: 'alm-002',
  almacenOrigenNombre: 'Almacén Norte',
  items: [
    {
      id: 'movi-007-1',
      productoId: 'prod-011',
      productoCodigo: 'SOP-LAP-001',
      productoNombre: 'Soporte para Laptop',
      cantidad: 3,
      precioUnitario: 9500,
    },
  ],
  createdAt: '2025-03-01T09:00:00.000Z',
  updatedAt: '2025-03-01T09:00:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'operario@ngr.com',
};

// Movimiento en estado pendiente — permite "Aprobar" y "Devolver a Borrador"
const movimientoPendiente: MovimientoEjemplo = {
  id: 'mov-005',
  numero: 'MOV-2025-0005',
  tipo: 'entrada',
  estado: 'pendiente',
  almacenDestinoId: 'alm-001',
  almacenDestinoNombre: 'Depósito Central',
  proveedorId: 'prov-002',
  proveedorNombre: 'Informática del Norte S.R.L.',
  items: [
    {
      id: 'movi-005-1',
      productoId: 'prod-009',
      productoCodigo: 'SSD-500-001',
      productoNombre: 'Disco SSD 500GB',
      cantidad: 15,
      precioUnitario: 48000,
    },
    {
      id: 'movi-005-2',
      productoId: 'prod-010',
      productoCodigo: 'RAM-16G-001',
      productoNombre: 'Memoria RAM 16GB DDR4',
      cantidad: 10,
      precioUnitario: 52000,
    },
  ],
  observacion: 'Pendiente de recepción — proveedor confirmó envío',
  createdAt: '2025-02-15T09:00:00.000Z',
  updatedAt: '2025-02-15T09:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// Movimiento en estado ejecutado — sin botones de transición disponibles
const movimientoEjecutado: MovimientoEjemplo = {
  id: 'mov-001',
  numero: 'MOV-2025-0001',
  tipo: 'entrada',
  estado: 'ejecutado',
  almacenDestinoId: 'alm-001',
  almacenDestinoNombre: 'Depósito Central',
  proveedorId: 'prov-001',
  proveedorNombre: 'Tecno Distribuciones S.A.',
  items: [
    {
      id: 'movi-001-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidad: 10,
      precioUnitario: 28500,
    },
    {
      id: 'movi-001-2',
      productoId: 'prod-004',
      productoCodigo: 'MOU-INL-001',
      productoNombre: 'Mouse Inalámbrico',
      cantidad: 20,
      precioUnitario: 8900,
    },
  ],
  observacion: 'Recepción de mercadería según orden de compra OC-2025-001',
  fechaEjecucion: '2025-01-20T10:00:00.000Z',
  createdAt: '2025-01-20T09:00:00.000Z',
  updatedAt: '2025-01-20T10:30:00.000Z',
  createdBy: 'operario@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

// Lista completa de movimientos con mezcla de tipos y estados
const movimientosLista: MovimientoEjemplo[] = [
  movimientoEjecutado,
  {
    id: 'mov-002',
    numero: 'MOV-2025-0002',
    tipo: 'salida',
    estado: 'ejecutado',
    almacenOrigenId: 'alm-001',
    almacenOrigenNombre: 'Depósito Central',
    items: [
      {
        id: 'movi-002-1',
        productoId: 'prod-002',
        productoCodigo: 'MON-IPS-001',
        productoNombre: 'Monitor 27 pulgadas IPS',
        cantidad: 2,
        precioUnitario: 185000,
      },
    ],
    observacion: 'Entrega a cliente — pedido PED-2025-0045',
    fechaEjecucion: '2025-01-25T14:00:00.000Z',
    createdAt: '2025-01-25T13:30:00.000Z',
    updatedAt: '2025-01-25T14:15:00.000Z',
    createdBy: 'operario@ngr.com',
    updatedBy: 'operario@ngr.com',
  },
  {
    id: 'mov-003',
    numero: 'MOV-2025-0003',
    tipo: 'transferencia',
    estado: 'aprobado',
    almacenOrigenId: 'alm-001',
    almacenOrigenNombre: 'Depósito Central',
    almacenDestinoId: 'alm-002',
    almacenDestinoNombre: 'Almacén Norte',
    items: [
      {
        id: 'movi-003-1',
        productoId: 'prod-005',
        productoCodigo: 'CAB-HDMI-001',
        productoNombre: 'Cable HDMI 2.0 2m',
        cantidad: 30,
        precioUnitario: 2200,
      },
    ],
    observacion: 'Reposición planificada zona norte Q1 2025',
    createdAt: '2025-02-01T08:00:00.000Z',
    updatedAt: '2025-02-01T11:00:00.000Z',
    createdBy: 'supervisor@ngr.com',
    updatedBy: 'supervisor@ngr.com',
  },
  movimientoPendiente,
  {
    id: 'mov-006',
    numero: 'MOV-2025-0006',
    tipo: 'devolucion',
    estado: 'ejecutado',
    almacenDestinoId: 'alm-001',
    almacenDestinoNombre: 'Depósito Central',
    proveedorId: 'prov-001',
    proveedorNombre: 'Tecno Distribuciones S.A.',
    items: [
      {
        id: 'movi-006-1',
        productoId: 'prod-008',
        productoCodigo: 'CAM-FHD-001',
        productoNombre: 'Cámara Web Full HD',
        cantidad: 1,
        precioUnitario: 22000,
      },
    ],
    observacion: 'Devolución por defecto de fábrica — unidad con autofoco fallido',
    fechaEjecucion: '2025-02-20T11:00:00.000Z',
    createdAt: '2025-02-18T10:00:00.000Z',
    updatedAt: '2025-02-20T11:30:00.000Z',
    createdBy: 'operario@ngr.com',
    updatedBy: 'supervisor@ngr.com',
  },
  movimientoBorrador,
  {
    id: 'mov-008',
    numero: 'MOV-2025-0008',
    tipo: 'entrada',
    estado: 'anulado',
    almacenDestinoId: 'alm-003',
    almacenDestinoNombre: 'Almacén Sur',
    proveedorId: 'prov-005',
    proveedorNombre: 'OfiTec Mobiliario y Tecnología S.A.',
    items: [
      {
        id: 'movi-008-1',
        productoId: 'prod-003',
        productoCodigo: 'SIL-ERG-001',
        productoNombre: 'Silla Ergonómica Gamer',
        cantidad: 5,
        precioUnitario: 142000,
      },
    ],
    observacion: 'Anulado — proveedor suspendido antes de despacho',
    createdAt: '2025-02-10T08:00:00.000Z',
    updatedAt: '2025-02-15T16:00:00.000Z',
    createdBy: 'admin@ngr.com',
    updatedBy: 'admin@ngr.com',
  },
];

// Proveedores disponibles para el formulario
const proveedoresDisponibles: ProveedorSimple[] = [
  { id: 'prov-001', razonSocial: 'Tecno Distribuciones S.A.' },
  { id: 'prov-002', razonSocial: 'Informática del Norte S.R.L.' },
  { id: 'prov-003', razonSocial: 'Mega IT Soluciones S.A.' },
];

// Almacenes disponibles para el formulario
const almacenesDisponibles: AlmacenSimple[] = [
  { id: 'alm-001', nombre: 'Depósito Central' },
  { id: 'alm-002', nombre: 'Almacén Norte' },
  { id: 'alm-003', nombre: 'Almacén Sur' },
];

/** Devuelve el badge HTML según el estado de un movimiento */
function estadoBadge(estado: MovimientoEjemplo['estado']): string {
  const config: Record<string, { cls: string; label: string }> = {
    borrador: { cls: 'bg-secondary', label: 'Borrador' },
    pendiente: { cls: 'bg-warning text-dark', label: 'Pendiente' },
    aprobado: { cls: 'bg-info text-dark', label: 'Aprobado' },
    ejecutado: { cls: 'bg-success', label: 'Ejecutado' },
    anulado: { cls: 'bg-danger', label: 'Anulado' },
  };
  const { cls, label } = config[estado] ?? { cls: 'bg-secondary', label: estado };
  return `<span class="badge ${cls}">${label}</span>`;
}

/** Devuelve el badge HTML según el tipo de un movimiento */
function tipoBadge(tipo: MovimientoEjemplo['tipo']): string {
  const config: Record<string, { cls: string; label: string }> = {
    entrada: {
      cls: 'bg-success-subtle text-success border border-success-subtle',
      label: 'Entrada',
    },
    salida: { cls: 'bg-danger-subtle text-danger border border-danger-subtle', label: 'Salida' },
    transferencia: {
      cls: 'bg-primary-subtle text-primary border border-primary-subtle',
      label: 'Transferencia',
    },
    ajuste: { cls: 'bg-warning-subtle text-warning border border-warning-subtle', label: 'Ajuste' },
    devolucion: { cls: 'bg-info-subtle text-info border border-info-subtle', label: 'Devolución' },
  };
  const { cls, label } = config[tipo] ?? { cls: 'bg-secondary', label: tipo };
  return `<span class="badge rounded-pill ${cls}">${label}</span>`;
}

/** Formatea una fecha ISO a formato legible en español */
function formatFecha(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Formatea un monto en pesos colombianos (COP) */
function formatPrecio(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);
}

/** Calcula el total de un movimiento sumando cantidad × precio */
function calcularTotal(items: MovimientoItemEjemplo[]): number {
  return items.reduce((acc, item) => acc + item.cantidad * item.precioUnitario, 0);
}

/** Genera las filas de la tabla de ítems de un movimiento */
function buildItemsTableHtml(items: MovimientoItemEjemplo[]): string {
  if (items.length === 0) {
    return `<tr><td colspan="4" class="text-center text-muted py-3">Sin ítems registrados</td></tr>`;
  }
  return items
    .map(
      (item) => `
      <tr>
        <td><span class="text-muted small">${item.productoCodigo}</span><br>${item.productoNombre}</td>
        <td class="text-end">${String(item.cantidad)}</td>
        <td class="text-end">${formatPrecio(item.precioUnitario)}</td>
        <td class="text-end fw-semibold">${formatPrecio(item.cantidad * item.precioUnitario)}</td>
      </tr>`
    )
    .join('');
}

/** Genera el bloque de información de origen/destino/proveedor según el tipo */
function buildLogisticaHtml(mov: MovimientoEjemplo): string {
  const filas: string[] = [];

  if (mov.almacenOrigenNombre) {
    filas.push(`
      <dt class="col-sm-5 text-muted fw-normal">Almacén origen</dt>
      <dd class="col-sm-7 fw-semibold mb-2">${mov.almacenOrigenNombre}</dd>
    `);
  }
  if (mov.almacenDestinoNombre) {
    filas.push(`
      <dt class="col-sm-5 text-muted fw-normal">Almacén destino</dt>
      <dd class="col-sm-7 fw-semibold mb-2">${mov.almacenDestinoNombre}</dd>
    `);
  }
  if (mov.proveedorNombre) {
    filas.push(`
      <dt class="col-sm-5 text-muted fw-normal">Proveedor</dt>
      <dd class="col-sm-7 fw-semibold mb-2">${mov.proveedorNombre}</dd>
    `);
  }
  if (mov.fechaEjecucion) {
    filas.push(`
      <dt class="col-sm-5 text-muted fw-normal">Fecha ejecución</dt>
      <dd class="col-sm-7 fw-semibold mb-2">${formatFecha(mov.fechaEjecucion)}</dd>
    `);
  }

  return filas.join('');
}

/** Genera los botones de transición de estado disponibles según el estado actual */
function buildTransicionBotonesHtml(estado: MovimientoEjemplo['estado']): string {
  if (estado === 'borrador') {
    return `
      <button class="btn btn-primary btn-sm">
        <i class="bi bi-arrow-up-circle me-1" aria-hidden="true"></i>
        Enviar a Pendiente
      </button>
      <button class="btn btn-outline-danger btn-sm">
        <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
        Anular
      </button>
    `;
  }
  if (estado === 'pendiente') {
    return `
      <button class="btn btn-success btn-sm">
        <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
        Aprobar
      </button>
      <button class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-down-circle me-1" aria-hidden="true"></i>
        Devolver a Borrador
      </button>
    `;
  }
  if (estado === 'aprobado') {
    return `
      <button class="btn btn-primary btn-sm">
        <i class="bi bi-play-circle me-1" aria-hidden="true"></i>
        Ejecutar
      </button>
      <button class="btn btn-outline-danger btn-sm">
        <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
        Anular
      </button>
    `;
  }
  // ejecutado y anulado no tienen transiciones disponibles
  return '';
}

/** Genera la vista de detalle completa de un movimiento */
function buildDetalleHtml(mov: MovimientoEjemplo): string {
  const botonesTransicion = buildTransicionBotonesHtml(mov.estado);
  const total = calcularTotal(mov.items);

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Movimientos</a></li>
            <li class="breadcrumb-item active">${mov.numero}</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <!-- Barra superior: volver + acciones de transición -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Movimientos
          </button>
          <div class="d-flex gap-2">
            ${botonesTransicion}
          </div>
        </div>

        <!-- Encabezado con número, tipo y estado -->
        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0">${mov.numero}</h1>
          ${tipoBadge(mov.tipo)}
          ${estadoBadge(mov.estado)}
        </div>
        <p class="text-muted mb-4 small">Creado el ${formatFecha(mov.createdAt)} por ${mov.createdBy}</p>

        <div class="row g-3 mb-4">
          <!-- Información logística -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-truck me-2" aria-hidden="true"></i>
                Logística
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  ${buildLogisticaHtml(mov)}
                  ${
                    mov.observacion
                      ? `
                    <dt class="col-sm-5 text-muted fw-normal">Observación</dt>
                    <dd class="col-sm-7 mb-2">${mov.observacion}</dd>
                  `
                      : ''
                  }
                </dl>
              </div>
            </div>
          </div>

          <!-- Resumen financiero -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-calculator me-2" aria-hidden="true"></i>
                Resumen
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-6 text-muted fw-normal">Cantidad de ítems</dt>
                  <dd class="col-sm-6 fw-semibold mb-2">${String(mov.items.length)}</dd>
                  <dt class="col-sm-6 text-muted fw-normal">Total</dt>
                  <dd class="col-sm-6 fw-semibold mb-2 fs-5">${formatPrecio(total)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card">
          <div class="card-header fw-semibold">
            <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
            Ítems del movimiento
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:90px;" class="text-end">Cantidad</th>
                    <th style="width:130px;" class="text-end">Precio unit.</th>
                    <th style="width:140px;" class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsTableHtml(mov.items)}
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="3" class="text-end fw-semibold">Total</td>
                    <td class="text-end fw-bold">${formatPrecio(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handlers comunes para la lista de movimientos
const handlersLista = [
  http.get('/api/movimientos', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    return HttpResponse.json({
      data: movimientosLista,
      total: movimientosLista.length,
      page,
      pageSize: 20,
      totalPages: 1,
    });
  }),
  http.delete('/api/movimientos/:id', () => new HttpResponse(null, { status: 204 })),
  http.patch('/api/movimientos/:id/estado', async ({ request }) => {
    const body = (await request.json()) as { estado: string };
    return HttpResponse.json({ estado: body.estado });
  }),
];

// Handlers comunes de selects para el formulario
const handlersFormulario = [
  http.get('/api/proveedores', () =>
    HttpResponse.json({
      data: proveedoresDisponibles.map((p) => ({
        ...p,
        codigo: p.id.toUpperCase(),
        ruc: '30-00000000-0',
        email: 'contacto@ejemplo.com',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin@ngr.com',
        updatedBy: 'admin@ngr.com',
      })),
      total: proveedoresDisponibles.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    })
  ),
  http.get('/api/almacenes', () =>
    HttpResponse.json({
      data: almacenesDisponibles.map((a) => ({
        ...a,
        codigo: a.id.toUpperCase(),
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        createdBy: 'admin@ngr.com',
        updatedBy: 'admin@ngr.com',
      })),
      total: almacenesDisponibles.length,
      page: 1,
      pageSize: 100,
      totalPages: 1,
    })
  ),
  http.post('/api/movimientos', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 'mov-new',
        numero: 'MOV-2025-0099',
        estado: 'borrador',
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'mock-user@ngr.com',
        updatedBy: 'mock-user@ngr.com',
      },
      { status: 201 }
    );
  }),
];

const meta = {
  title: 'Mockups/Movimientos/Movimientos',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: handlersLista,
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story principal — lista de movimientos con mezcla de tipos y estados */
export const MovimientosList: Story = {
  name: 'Lista de movimientos',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Movimientos</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Movimientos de inventario</h1>
          <button class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Nuevo movimiento
          </button>
        </div>

        <!-- Barra de filtros -->
        <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <div>
            <label for="tipo-filter" class="form-label small mb-1">Tipo</label>
            <select id="tipo-filter" class="form-select form-select-sm" style="min-width:160px;">
              <option value="">Todos los tipos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="transferencia">Transferencia</option>
              <option value="ajuste">Ajuste</option>
              <option value="devolucion">Devolución</option>
            </select>
          </div>
          <div>
            <label for="estado-filter" class="form-label small mb-1">Estado</label>
            <select id="estado-filter" class="form-select form-select-sm" style="min-width:160px;">
              <option value="">Todos los estados</option>
              <option value="borrador">Borrador</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="ejecutado">Ejecutado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          <div>
            <label for="buscar-mov" class="form-label small mb-1">Buscar</label>
            <input id="buscar-mov" type="search" class="form-control form-control-sm"
              placeholder="Número de movimiento..." style="min-width:220px;">
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style="width:160px;">Número</th>
                    <th style="width:130px;">Tipo</th>
                    <th style="width:120px;">Estado</th>
                    <th>Origen / Destino</th>
                    <th style="width:130px;">Fecha</th>
                    <th style="width:80px;" class="text-end">Ítems</th>
                  </tr>
                </thead>
                <tbody>
                  ${movimientosLista
                    .map(
                      (m) => `
                    <tr style="cursor:pointer;">
                      <td class="fw-semibold">${m.numero}</td>
                      <td>${tipoBadge(m.tipo)}</td>
                      <td>${estadoBadge(m.estado)}</td>
                      <td>
                        ${m.almacenOrigenNombre ? `<span class="text-muted small">Origen:</span> ${m.almacenOrigenNombre}` : ''}
                        ${m.almacenOrigenNombre && m.almacenDestinoNombre ? ' <i class="bi bi-arrow-right text-muted small"></i> ' : ''}
                        ${m.almacenDestinoNombre ? `<span class="text-muted small">Destino:</span> ${m.almacenDestinoNombre}` : ''}
                        ${m.proveedorNombre ? `<span class="text-muted small">Proveedor:</span> ${m.proveedorNombre}` : ''}
                      </td>
                      <td class="text-muted small">${formatFecha(m.createdAt)}</td>
                      <td class="text-end">${String(m.items.length)}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — detalle de movimiento en estado borrador: botones "Enviar a Pendiente" y "Anular" */
export const MovimientosDetailBorrador: Story = {
  name: 'Detalle — estado Borrador',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/movimientos/mov-007', () => HttpResponse.json(movimientoBorrador)),
        http.patch('/api/movimientos/mov-007/estado', async ({ request }) => {
          const body = (await request.json()) as { estado: string };
          return HttpResponse.json({ ...movimientoBorrador, estado: body.estado });
        }),
      ],
    },
  },
  render: () => buildDetalleHtml(movimientoBorrador),
};

/** Story — detalle de movimiento en estado pendiente: botones "Aprobar" y "Devolver a Borrador" */
export const MovimientosDetailPendiente: Story = {
  name: 'Detalle — estado Pendiente',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/movimientos/mov-005', () => HttpResponse.json(movimientoPendiente)),
        http.patch('/api/movimientos/mov-005/estado', async ({ request }) => {
          const body = (await request.json()) as { estado: string };
          return HttpResponse.json({ ...movimientoPendiente, estado: body.estado });
        }),
      ],
    },
  },
  render: () => buildDetalleHtml(movimientoPendiente),
};

/** Story — detalle de movimiento en estado ejecutado: sin botones de transición */
export const MovimientosDetailEjecutado: Story = {
  name: 'Detalle — estado Ejecutado',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/movimientos/mov-001', () => HttpResponse.json(movimientoEjecutado)),
      ],
    },
  },
  render: () => buildDetalleHtml(movimientoEjecutado),
};

/** Story — formulario de creación con tipo entrada pre-seleccionado: proveedor + almacén destino */
export const MovimientosFormEntrada: Story = {
  name: 'Formulario — nueva Entrada',
  parameters: {
    msw: {
      handlers: handlersFormulario,
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Movimientos</a></li>
            <li class="breadcrumb-item active">Nuevo movimiento</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 800px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo movimiento</h1>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información general
          </div>
          <div class="card-body">
            <form id="mov-form" novalidate>
              <!-- Tipo de movimiento -->
              <div class="mb-3">
                <label for="tipo" class="form-label fw-semibold">
                  Tipo de movimiento <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="tipo" name="tipo" class="form-select">
                  <option value="">— Seleccioná un tipo —</option>
                  <option value="entrada" selected>Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="devolucion">Devolución</option>
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Proveedor (visible para entrada y devolución) -->
              <div class="mb-3" id="campo-proveedor">
                <label for="proveedorId" class="form-label fw-semibold">
                  Proveedor <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="proveedorId" name="proveedorId" class="form-select">
                  <option value="">— Seleccioná un proveedor —</option>
                  ${proveedoresDisponibles
                    .map((p) => `<option value="${p.id}">${p.razonSocial}</option>`)
                    .join('')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Almacén destino (visible para entrada, transferencia, devolución) -->
              <div class="mb-3" id="campo-almacen-destino">
                <label for="almacenDestinoId" class="form-label fw-semibold">
                  Almacén destino <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="almacenDestinoId" name="almacenDestinoId" class="form-select">
                  <option value="">— Seleccioná el almacén destino —</option>
                  ${almacenesDisponibles
                    .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
                    .join('')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Observación -->
              <div class="mb-3">
                <label for="observacion" class="form-label">Observación</label>
                <textarea id="observacion" name="observacion" class="form-control" rows="3"
                  placeholder="Observaciones adicionales sobre este movimiento..."></textarea>
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
            <span>
              <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
              Ítems del movimiento
            </span>
            <button class="btn btn-outline-primary btn-sm">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Agregar ítem
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:120px;" class="text-end">Cantidad</th>
                    <th style="width:140px;" class="text-end">Precio unit.</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                      <i class="bi bi-inbox fs-4 d-block mb-2" aria-hidden="true"></i>
                      Sin ítems agregados. Hacé clic en "Agregar ítem" para comenzar.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button type="submit" form="mov-form" class="btn btn-primary">
            <i class="bi bi-floppy me-1" aria-hidden="true"></i>
            Guardar borrador
          </button>
          <a href="#" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </div>
    </div>
  `,
};

/** Story — formulario de creación con tipo transferencia pre-seleccionado: almacén origen + almacén destino */
export const MovimientosFormTransferencia: Story = {
  name: 'Formulario — nueva Transferencia',
  parameters: {
    msw: {
      handlers: handlersFormulario,
    },
  },
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Movimientos</a></li>
            <li class="breadcrumb-item active">Nuevo movimiento</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width: 800px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo movimiento</h1>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información general
          </div>
          <div class="card-body">
            <form id="mov-form-transf" novalidate>
              <!-- Tipo de movimiento -->
              <div class="mb-3">
                <label for="tipo-transf" class="form-label fw-semibold">
                  Tipo de movimiento <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="tipo-transf" name="tipo" class="form-select">
                  <option value="">— Seleccioná un tipo —</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="transferencia" selected>Transferencia</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="devolucion">Devolución</option>
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Almacén origen (visible para salida, transferencia, ajuste) -->
              <div class="mb-3" id="campo-almacen-origen">
                <label for="almacenOrigenId" class="form-label fw-semibold">
                  Almacén origen <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="almacenOrigenId" name="almacenOrigenId" class="form-select">
                  <option value="">— Seleccioná el almacén origen —</option>
                  ${almacenesDisponibles
                    .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
                    .join('')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Almacén destino (visible para entrada, transferencia, devolución) -->
              <div class="mb-3" id="campo-almacen-destino-transf">
                <label for="almacenDestinoId-transf" class="form-label fw-semibold">
                  Almacén destino <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="almacenDestinoId-transf" name="almacenDestinoId" class="form-select">
                  <option value="">— Seleccioná el almacén destino —</option>
                  ${almacenesDisponibles
                    .map((a) => `<option value="${a.id}">${a.nombre}</option>`)
                    .join('')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Observación -->
              <div class="mb-3">
                <label for="observacion-transf" class="form-label">Observación</label>
                <textarea id="observacion-transf" name="observacion" class="form-control" rows="3"
                  placeholder="Observaciones adicionales sobre esta transferencia..."></textarea>
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
            <span>
              <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
              Ítems del movimiento
            </span>
            <button class="btn btn-outline-primary btn-sm">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Agregar ítem
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:120px;" class="text-end">Cantidad</th>
                    <th style="width:140px;" class="text-end">Precio unit.</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="4" class="text-center text-muted py-4">
                      <i class="bi bi-inbox fs-4 d-block mb-2" aria-hidden="true"></i>
                      Sin ítems agregados. Hacé clic en "Agregar ítem" para comenzar.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button type="submit" form="mov-form-transf" class="btn btn-primary">
            <i class="bi bi-floppy me-1" aria-hidden="true"></i>
            Guardar borrador
          </button>
          <a href="#" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </div>
    </div>
  `,
};
