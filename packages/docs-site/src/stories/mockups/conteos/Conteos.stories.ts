import type { EstadoConteo } from '@ngr-inventory/api-contracts';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

/** Tipo para un ítem de conteo físico */
interface ConteoItemEjemplo {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  cantidadSistema: number;
  cantidadContada?: number;
  diferencia?: number;
  ajustado: boolean;
}

/** Tipo para un conteo físico de inventario */
interface ConteoEjemplo {
  id: string;
  numero: string;
  descripcion: string;
  almacenId: string;
  almacenNombre: string;
  estado: EstadoConteo;
  items: ConteoItemEjemplo[];
  fechaInicio?: string;
  fechaFin?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/** Tipo para un almacén simplificado */
interface AlmacenSimple {
  id: string;
  nombre: string;
}

/** Tipo para un producto simplificado */
interface ProductoSimple {
  id: string;
  codigo: string;
  nombre: string;
}

// cnt-001: completado con discrepancias ya ajustadas
const conteoCnt001: ConteoEjemplo = {
  id: 'cnt-001',
  numero: 'CNT-2025-0001',
  descripcion: 'Conteo anual zona periféricos y accesorios',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'completado',
  items: [
    {
      id: 'cnt-001-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidadSistema: 12,
      cantidadContada: 10,
      diferencia: -2,
      ajustado: true,
    },
    {
      id: 'cnt-001-2',
      productoId: 'prod-004',
      productoCodigo: 'MOU-INL-001',
      productoNombre: 'Mouse Inalámbrico',
      cantidadSistema: 18,
      cantidadContada: 18,
      diferencia: 0,
      ajustado: false,
    },
    {
      id: 'cnt-001-3',
      productoId: 'prod-007',
      productoCodigo: 'AUR-MIC-001',
      productoNombre: 'Auriculares con Micrófono',
      cantidadSistema: 5,
      cantidadContada: 3,
      diferencia: -2,
      ajustado: true,
    },
  ],
  fechaInicio: '2025-02-10T08:00:00.000Z',
  fechaFin: '2025-02-10T16:00:00.000Z',
  createdAt: '2025-02-08T10:00:00.000Z',
  updatedAt: '2025-02-10T16:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

// cnt-002: en_curso — ítems parcialmente contados
const conteoCnt002: ConteoEjemplo = {
  id: 'cnt-002',
  numero: 'CNT-2025-0002',
  descripcion: 'Conteo trimestral almacén norte — componentes',
  almacenId: 'alm-002',
  almacenNombre: 'Almacén Norte',
  estado: 'en_curso',
  items: [
    {
      id: 'cnt-002-1',
      productoId: 'prod-009',
      productoCodigo: 'SSD-500-001',
      productoNombre: 'Disco SSD 500GB',
      cantidadSistema: 8,
      cantidadContada: 8,
      diferencia: 0,
      ajustado: false,
    },
    {
      id: 'cnt-002-2',
      productoId: 'prod-010',
      productoCodigo: 'RAM-16G-001',
      productoNombre: 'Memoria RAM 16GB DDR4',
      cantidadSistema: 6,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-03-15T08:00:00.000Z',
  createdAt: '2025-03-12T09:00:00.000Z',
  updatedAt: '2025-03-15T10:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

// cnt-003: planificado — sin cantidades contadas aún
const conteoCnt003: ConteoEjemplo = {
  id: 'cnt-003',
  numero: 'CNT-2025-0003',
  descripcion: 'Conteo sorpresa monitores y mobiliario',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'planificado',
  items: [
    {
      id: 'cnt-003-1',
      productoId: 'prod-002',
      productoCodigo: 'MON-IPS-001',
      productoNombre: 'Monitor 27 pulgadas IPS',
      cantidadSistema: 4,
      ajustado: false,
    },
    {
      id: 'cnt-003-2',
      productoId: 'prod-003',
      productoCodigo: 'SIL-ERG-001',
      productoNombre: 'Silla Ergonómica Gamer',
      cantidadSistema: 1,
      ajustado: false,
    },
  ],
  createdAt: '2025-03-20T10:00:00.000Z',
  updatedAt: '2025-03-20T10:00:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'supervisor@ngr.com',
};

// cnt-004: anulado
const conteoCnt004: ConteoEjemplo = {
  id: 'cnt-004',
  numero: 'CNT-2025-0004',
  descripcion: 'Conteo general almacén sur — todos los productos',
  almacenId: 'alm-003',
  almacenNombre: 'Almacén Sur',
  estado: 'anulado',
  items: [
    {
      id: 'cnt-004-1',
      productoId: 'prod-005',
      productoCodigo: 'CAB-HDMI-001',
      productoNombre: 'Cable HDMI 2.0 2m',
      cantidadSistema: 30,
      ajustado: false,
    },
  ],
  createdAt: '2025-03-01T08:00:00.000Z',
  updatedAt: '2025-03-05T14:00:00.000Z',
  createdBy: 'admin@ngr.com',
  updatedBy: 'admin@ngr.com',
};

// cnt-005: pausado — ítems parcialmente contados
const conteoCnt005: ConteoEjemplo = {
  id: 'cnt-005',
  numero: 'CNT-2025-0005',
  descripcion: 'Conteo parcial almacén norte — cables y adaptadores',
  almacenId: 'alm-002',
  almacenNombre: 'Almacén Norte',
  estado: 'pausado',
  items: [
    {
      id: 'cnt-005-1',
      productoId: 'prod-005',
      productoCodigo: 'CAB-HDMI-001',
      productoNombre: 'Cable HDMI 2.0 2m',
      cantidadSistema: 15,
      cantidadContada: 14,
      diferencia: -1,
      ajustado: false,
    },
    {
      id: 'cnt-005-2',
      productoId: 'prod-006',
      productoCodigo: 'CAB-USB-001',
      productoNombre: 'Cable USB-C 1m',
      cantidadSistema: 22,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-04-01T08:00:00.000Z',
  createdAt: '2025-03-28T09:00:00.000Z',
  updatedAt: '2025-04-01T11:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

// cnt-006: completado con discrepancias (positivas y negativas), sin ajuste aún
const conteoCnt006: ConteoEjemplo = {
  id: 'cnt-006',
  numero: 'CNT-2025-0006',
  descripcion: 'Conteo semestral depósito central — zona electrónica',
  almacenId: 'alm-001',
  almacenNombre: 'Depósito Central',
  estado: 'completado',
  items: [
    {
      id: 'cnt-006-1',
      productoId: 'prod-001',
      productoCodigo: 'TEC-MEC-001',
      productoNombre: 'Teclado Mecánico TKL',
      cantidadSistema: 10,
      cantidadContada: 7,
      diferencia: -3,
      ajustado: false,
    },
    {
      id: 'cnt-006-2',
      productoId: 'prod-004',
      productoCodigo: 'MOU-INL-001',
      productoNombre: 'Mouse Inalámbrico',
      cantidadSistema: 5,
      cantidadContada: 7,
      diferencia: 2,
      ajustado: false,
    },
    {
      id: 'cnt-006-3',
      productoId: 'prod-009',
      productoCodigo: 'SSD-500-001',
      productoNombre: 'Disco SSD 500GB',
      cantidadSistema: 8,
      cantidadContada: 8,
      diferencia: 0,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-04-05T08:00:00.000Z',
  fechaFin: '2025-04-05T17:00:00.000Z',
  createdAt: '2025-04-02T10:00:00.000Z',
  updatedAt: '2025-04-05T17:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

// cnt-007: completado sin discrepancias — todos los ítems con diferencia = 0
const conteoCnt007: ConteoEjemplo = {
  id: 'cnt-007',
  numero: 'CNT-2025-0007',
  descripcion: 'Conteo de verificación zona accesorios — sin diferencias',
  almacenId: 'alm-003',
  almacenNombre: 'Almacén Sur',
  estado: 'completado',
  items: [
    {
      id: 'cnt-007-1',
      productoId: 'prod-005',
      productoCodigo: 'CAB-HDMI-001',
      productoNombre: 'Cable HDMI 2.0 2m',
      cantidadSistema: 20,
      cantidadContada: 20,
      diferencia: 0,
      ajustado: false,
    },
    {
      id: 'cnt-007-2',
      productoId: 'prod-006',
      productoCodigo: 'CAB-USB-001',
      productoNombre: 'Cable USB-C 1m',
      cantidadSistema: 15,
      cantidadContada: 15,
      diferencia: 0,
      ajustado: false,
    },
    {
      id: 'cnt-007-3',
      productoId: 'prod-007',
      productoCodigo: 'AUR-MIC-001',
      productoNombre: 'Auriculares con Micrófono',
      cantidadSistema: 8,
      cantidadContada: 8,
      diferencia: 0,
      ajustado: false,
    },
  ],
  fechaInicio: '2025-04-08T08:00:00.000Z',
  fechaFin: '2025-04-08T12:00:00.000Z',
  createdAt: '2025-04-07T09:00:00.000Z',
  updatedAt: '2025-04-08T12:30:00.000Z',
  createdBy: 'supervisor@ngr.com',
  updatedBy: 'operario@ngr.com',
};

// Lista completa de conteos con mezcla de estados
const conteosLista: ConteoEjemplo[] = [conteoCnt001, conteoCnt002, conteoCnt003, conteoCnt004];

// Lista de conteos filtrados por en_curso
const conteosEnCurso: ConteoEjemplo[] = [conteoCnt002];

// Almacenes disponibles para el formulario de nuevo conteo
const almacenesDisponibles: AlmacenSimple[] = [
  { id: 'alm-001', nombre: 'Depósito Central' },
  { id: 'alm-002', nombre: 'Almacén Norte' },
  { id: 'alm-003', nombre: 'Almacén Sur' },
];

// Productos disponibles para el formulario de nuevo conteo
const productosDisponibles: ProductoSimple[] = [
  { id: 'prod-001', codigo: 'TEC-MEC-001', nombre: 'Teclado Mecánico TKL' },
  { id: 'prod-002', codigo: 'MON-IPS-001', nombre: 'Monitor 27 pulgadas IPS' },
  { id: 'prod-003', codigo: 'SIL-ERG-001', nombre: 'Silla Ergonómica Gamer' },
  { id: 'prod-004', codigo: 'MOU-INL-001', nombre: 'Mouse Inalámbrico' },
  { id: 'prod-005', codigo: 'CAB-HDMI-001', nombre: 'Cable HDMI 2.0 2m' },
  { id: 'prod-006', codigo: 'CAB-USB-001', nombre: 'Cable USB-C 1m' },
  { id: 'prod-007', codigo: 'AUR-MIC-001', nombre: 'Auriculares con Micrófono' },
];

/** Devuelve el badge HTML según el estado de un conteo */
function estadoBadge(estado: EstadoConteo): string {
  const config: Record<EstadoConteo, { cls: string; label: string }> = {
    planificado: { cls: 'bg-secondary', label: 'Planificado' },
    en_curso: { cls: 'bg-primary', label: 'En Curso' },
    pausado: { cls: 'bg-warning text-dark', label: 'Pausado' },
    completado: { cls: 'bg-success', label: 'Completado' },
    anulado: { cls: 'bg-danger', label: 'Anulado' },
  };
  const { cls, label } = config[estado];
  return `<span class="badge ${cls}">${label}</span>`;
}

/** Devuelve el badge HTML de diferencia según el valor */
function diferenciaBadge(diferencia: number): string {
  if (diferencia === 0)
    return `<span class="badge bg-success-subtle text-success border border-success-subtle">0</span>`;
  if (diferencia > 0)
    return `<span class="badge bg-info-subtle text-info border border-info-subtle">+${String(diferencia)}</span>`;
  return `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">${String(diferencia)}</span>`;
}

/** Formatea una fecha ISO a formato legible en español */
function formatFecha(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Genera las filas de la tabla de ítems del conteo (vista detalle) */
function buildItemsDetalleHtml(items: ConteoItemEjemplo[]): string {
  if (items.length === 0) {
    return `<tr><td colspan="5" class="text-center text-muted py-3">Sin ítems registrados</td></tr>`;
  }
  return items
    .map(
      (item) => `
      <tr>
        <td><span class="text-muted small">${item.productoCodigo}</span><br>${item.productoNombre}</td>
        <td class="text-end">${String(item.cantidadSistema)}</td>
        <td class="text-end">${item.cantidadContada !== undefined ? String(item.cantidadContada) : '<span class="text-muted">—</span>'}</td>
        <td class="text-end">${item.diferencia !== undefined ? diferenciaBadge(item.diferencia) : '<span class="text-muted">—</span>'}</td>
        <td class="text-center">${item.ajustado ? '<i class="bi bi-check-circle-fill text-success" aria-label="Ajustado"></i>' : '<span class="text-muted">—</span>'}</td>
      </tr>`
    )
    .join('');
}

/** Genera las filas de la tabla de ítems del conteo (vista carga) */
function buildItemsCargaHtml(items: ConteoItemEjemplo[]): string {
  return items
    .map(
      (item) => `
      <tr>
        <td>
          <span class="text-muted small">${item.productoCodigo}</span><br>
          <span class="fw-semibold">${item.productoNombre}</span>
        </td>
        <td class="text-end">${String(item.cantidadSistema)}</td>
        <td style="width:140px;">
          <input
            type="number"
            class="form-control form-control-sm text-end"
            value="${item.cantidadContada !== undefined ? String(item.cantidadContada) : ''}"
            min="0"
            placeholder="0"
          >
        </td>
        <td class="text-end">${item.diferencia !== undefined ? diferenciaBadge(item.diferencia) : '<span class="text-muted small">—</span>'}</td>
      </tr>`
    )
    .join('');
}

/** Genera los botones de acción según el estado del conteo */
function buildAccionBotonesHtml(conteo: ConteoEjemplo): string {
  const { estado, id } = conteo;

  if (estado === 'planificado') {
    return `
      <button class="btn btn-primary btn-sm">
        <i class="bi bi-play-circle me-1" aria-hidden="true"></i>
        Iniciar Conteo
      </button>
      <button class="btn btn-outline-danger btn-sm">
        <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
        Anular
      </button>
    `;
  }
  if (estado === 'en_curso') {
    return `
      <a href="#/conteos/${id}/carga" class="btn btn-primary btn-sm">
        <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>
        Cargar Cantidades
      </a>
      <button class="btn btn-outline-warning btn-sm">
        <i class="bi bi-pause-circle me-1" aria-hidden="true"></i>
        Pausar
      </button>
    `;
  }
  if (estado === 'pausado') {
    return `
      <a href="#/conteos/${id}/carga" class="btn btn-primary btn-sm">
        <i class="bi bi-pencil-square me-1" aria-hidden="true"></i>
        Cargar Cantidades
      </a>
      <button class="btn btn-outline-success btn-sm">
        <i class="bi bi-play-circle me-1" aria-hidden="true"></i>
        Reanudar
      </button>
    `;
  }
  if (estado === 'completado') {
    return `
      <a href="#/conteos/${id}/cierre" class="btn btn-success btn-sm">
        <i class="bi bi-clipboard-check me-1" aria-hidden="true"></i>
        Cerrar y Conciliar
      </a>
    `;
  }
  // anulado no tiene acciones disponibles
  return '';
}

/** Genera la vista de detalle completa de un conteo */
function buildDetalleHtml(conteo: ConteoEjemplo): string {
  const botonesAccion = buildAccionBotonesHtml(conteo);

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Conteos</a></li>
            <li class="breadcrumb-item active">${conteo.numero}</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <!-- Barra superior: volver + acciones -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver a Conteos
          </button>
          <div class="d-flex gap-2">
            ${botonesAccion}
          </div>
        </div>

        <!-- Encabezado con número y estado -->
        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0" id="conteo-numero">${conteo.numero}</h1>
          ${estadoBadge(conteo.estado)}
        </div>
        <p class="text-muted mb-1 small">${conteo.descripcion}</p>
        <p class="text-muted mb-4 small">Creado el ${formatFecha(conteo.createdAt)} por ${conteo.createdBy}</p>

        <div class="row g-3 mb-4">
          <!-- Información general -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                Información general
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-5 text-muted fw-normal">Almacén</dt>
                  <dd class="col-sm-7 fw-semibold mb-2">${conteo.almacenNombre}</dd>
                  ${
                    conteo.fechaInicio
                      ? `
                    <dt class="col-sm-5 text-muted fw-normal">Fecha inicio</dt>
                    <dd class="col-sm-7 fw-semibold mb-2">${formatFecha(conteo.fechaInicio)}</dd>
                  `
                      : ''
                  }
                  ${
                    conteo.fechaFin
                      ? `
                    <dt class="col-sm-5 text-muted fw-normal">Fecha fin</dt>
                    <dd class="col-sm-7 fw-semibold mb-2">${formatFecha(conteo.fechaFin)}</dd>
                  `
                      : ''
                  }
                </dl>
              </div>
            </div>
          </div>

          <!-- Resumen de ítems -->
          <div class="col-12 col-md-6">
            <div class="card h-100">
              <div class="card-header fw-semibold">
                <i class="bi bi-bar-chart me-2" aria-hidden="true"></i>
                Resumen
              </div>
              <div class="card-body">
                <dl class="row mb-0">
                  <dt class="col-sm-7 text-muted fw-normal">Total de ítems</dt>
                  <dd class="col-sm-5 fw-semibold mb-2">${String(conteo.items.length)}</dd>
                  <dt class="col-sm-7 text-muted fw-normal">Ítems contados</dt>
                  <dd class="col-sm-5 fw-semibold mb-2">${String(conteo.items.filter((i) => i.cantidadContada !== undefined).length)}</dd>
                  <dt class="col-sm-7 text-muted fw-normal">Con discrepancias</dt>
                  <dd class="col-sm-5 fw-semibold mb-2">${String(conteo.items.filter((i) => i.diferencia !== undefined && i.diferencia !== 0).length)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de ítems -->
        <div class="card">
          <div class="card-header fw-semibold">
            <i class="bi bi-list-check me-2" aria-hidden="true"></i>
            Ítems del conteo
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:110px;" class="text-end">Cant. sistema</th>
                    <th style="width:110px;" class="text-end">Cant. contada</th>
                    <th style="width:100px;" class="text-end">Diferencia</th>
                    <th style="width:80px;" class="text-center">Ajustado</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsDetalleHtml(conteo.items)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Genera la vista de carga de cantidades de un conteo */
function buildCargaHtml(conteo: ConteoEjemplo): string {
  const contados = conteo.items.filter((i) => i.cantidadContada !== undefined).length;
  const total = conteo.items.length;

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Conteos</a></li>
            <li class="breadcrumb-item"><a href="#">${conteo.numero}</a></li>
            <li class="breadcrumb-item active">Cargar Cantidades</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver al Detalle
          </button>
          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm">
              <i class="bi bi-floppy me-1" aria-hidden="true"></i>
              Guardar Cantidades
            </button>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0">Cargar Cantidades</h1>
          ${estadoBadge(conteo.estado)}
        </div>
        <p class="text-muted mb-4 small">${conteo.numero} — ${conteo.almacenNombre}</p>

        <!-- Progreso -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-1 small">
              <span class="fw-semibold">Progreso del conteo</span>
              <span class="text-muted">${String(contados)} / ${String(total)} ítems</span>
            </div>
            <div class="progress" style="height:8px;" role="progressbar">
              <div class="progress-bar" style="width:${total > 0 ? String(Math.round((contados / total) * 100)) : '0'}%;"></div>
            </div>
          </div>
        </div>

        <!-- Tabla de entrada de cantidades -->
        <div class="card">
          <div class="card-header fw-semibold">
            <i class="bi bi-pencil-square me-2" aria-hidden="true"></i>
            Ingresá las cantidades contadas
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:110px;" class="text-end">Cant. sistema</th>
                    <th style="width:140px;">Cant. contada</th>
                    <th style="width:100px;" class="text-end">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsCargaHtml(conteo.items)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Genera la vista de cierre y conciliación de un conteo */
function buildCierreHtml(conteo: ConteoEjemplo): string {
  const conDiscrepancias = conteo.items.filter(
    (i) => i.diferencia !== undefined && i.diferencia !== 0
  );
  const sinDiscrepancias = conteo.items.filter((i) => i.diferencia === 0);
  const hayDiscrepancias = conDiscrepancias.length > 0;

  return `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item"><a href="#">Conteos</a></li>
            <li class="breadcrumb-item"><a href="#">${conteo.numero}</a></li>
            <li class="breadcrumb-item active">Cierre y Conciliación</li>
          </ol>
        </nav>
      </div>

      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <button type="button" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1" aria-hidden="true"></i>
            Volver al Detalle
          </button>
        </div>

        <div class="d-flex align-items-center gap-3 mb-1 flex-wrap">
          <h1 class="h3 mb-0">Cierre y Conciliación</h1>
          ${estadoBadge(conteo.estado)}
        </div>
        <p class="text-muted mb-4 small">${conteo.numero} — ${conteo.almacenNombre}</p>

        <!-- Tarjetas de resumen -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card text-center">
              <div class="card-body py-3">
                <div class="fs-3 fw-bold">${String(conteo.items.length)}</div>
                <div class="text-muted small">Total ítems</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center border-success">
              <div class="card-body py-3">
                <div class="fs-3 fw-bold text-success">${String(sinDiscrepancias.length)}</div>
                <div class="text-muted small">Sin diferencias</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center ${hayDiscrepancias ? 'border-danger' : ''}">
              <div class="card-body py-3">
                <div class="fs-3 fw-bold ${hayDiscrepancias ? 'text-danger' : 'text-muted'}">${String(conDiscrepancias.length)}</div>
                <div class="text-muted small">Con diferencias</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center">
              <div class="card-body py-3">
                <div class="fs-3 fw-bold text-info">${String(conteo.items.filter((i) => i.ajustado).length)}</div>
                <div class="text-muted small">Ya ajustados</div>
              </div>
            </div>
          </div>
        </div>

        ${
          hayDiscrepancias
            ? `
          <div class="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <div>
              Se encontraron <strong>${String(conDiscrepancias.length)} ítem(s) con diferencias</strong>.
              Al confirmar el cierre se generará un movimiento de ajuste automático.
            </div>
          </div>
        `
            : `
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
            <i class="bi bi-check-circle-fill" aria-hidden="true"></i>
            <div>
              <strong>¡Todo coincide!</strong> No se encontraron diferencias entre el sistema y el conteo físico.
            </div>
          </div>
        `
        }

        <!-- Tabla de ítems con diferencias -->
        <div class="card mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-list-check me-2" aria-hidden="true"></i>
            Ítems del conteo
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:110px;" class="text-end">Cant. sistema</th>
                    <th style="width:110px;" class="text-end">Cant. contada</th>
                    <th style="width:100px;" class="text-end">Diferencia</th>
                    <th style="width:80px;" class="text-center">Ajustado</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildItemsDetalleHtml(conteo.items)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Formulario de confirmación -->
        <div class="card border-0 shadow-sm">
          <div class="card-header fw-semibold">
            <i class="bi bi-clipboard-check me-2" aria-hidden="true"></i>
            Confirmar cierre
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="observacion-cierre" class="form-label">Observación (opcional)</label>
              <textarea
                id="observacion-cierre"
                class="form-control"
                rows="3"
                placeholder="Ingresá observaciones sobre este cierre de conteo..."
              ></textarea>
            </div>
            ${
              hayDiscrepancias
                ? `
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="confirmar-ajuste">
                <label class="form-check-label" for="confirmar-ajuste">
                  Confirmo la generación del movimiento de ajuste para corregir las diferencias encontradas
                </label>
              </div>
            `
                : ''
            }
            <div class="d-flex gap-2">
              <button class="btn btn-success">
                <i class="bi bi-check-circle me-1" aria-hidden="true"></i>
                Cerrar Conteo
              </button>
              <button class="btn btn-outline-secondary">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Handlers comunes para la lista de conteos
const handlersLista = [
  http.get('/api/conteos', () =>
    HttpResponse.json({
      data: conteosLista,
      total: conteosLista.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })
  ),
];

const meta = {
  title: 'Mockups/Conteos/Conteos',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: handlersLista,
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Story principal — lista de conteos físicos con mezcla de estados */
export const ConteosList: Story = {
  name: 'Lista de conteos',
  render: () => `
    <div class="bg-body-secondary min-vh-100">
      <div class="bg-body border-bottom px-4 py-3">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="#">Inicio</a></li>
            <li class="breadcrumb-item active">Conteos</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Conteos físicos de inventario</h1>
          <button class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Nuevo conteo
          </button>
        </div>

        <!-- Barra de filtros -->
        <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <div>
            <label for="estado-filter" class="form-label small mb-1">Estado</label>
            <select id="estado-filter" class="form-select form-select-sm" style="min-width:160px;">
              <option value="">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_curso">En Curso</option>
              <option value="pausado">Pausado</option>
              <option value="completado">Completado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          <div>
            <label for="almacen-filter" class="form-label small mb-1">Almacén</label>
            <select id="almacen-filter" class="form-select form-select-sm" style="min-width:180px;">
              <option value="">Todos los almacenes</option>
              ${almacenesDisponibles.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style="width:160px;">Número</th>
                    <th>Descripción</th>
                    <th style="width:160px;">Almacén</th>
                    <th style="width:120px;">Estado</th>
                    <th style="width:80px;" class="text-end">Ítems</th>
                    <th style="width:130px;">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  ${conteosLista
                    .map(
                      (c) => `
                    <tr style="cursor:pointer;">
                      <td class="fw-semibold">${c.numero}</td>
                      <td class="text-muted">${c.descripcion}</td>
                      <td>${c.almacenNombre}</td>
                      <td>${estadoBadge(c.estado)}</td>
                      <td class="text-end">${String(c.items.length)}</td>
                      <td class="text-muted small">${formatFecha(c.createdAt)}</td>
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

/** Story — lista vacía: sin conteos registrados */
export const ConteosListVacio: Story = {
  name: 'Lista — estado vacío',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos', () =>
          HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 })
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
            <li class="breadcrumb-item active">Conteos</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Conteos físicos de inventario</h1>
          <button class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Nuevo conteo
          </button>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-clipboard-x fs-1 text-muted d-block mb-3" aria-hidden="true"></i>
            <h5 class="text-muted">Sin conteos registrados</h5>
            <p class="text-muted small mb-3">No hay conteos físicos para mostrar. Creá uno nuevo para comenzar.</p>
            <button class="btn btn-primary btn-sm">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Nuevo conteo
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};

/** Story — lista filtrada mostrando solo conteos en_curso */
export const ConteosListFiltradoPorEstado: Story = {
  name: 'Lista — filtrado por estado En Curso',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos', () =>
          HttpResponse.json({
            data: conteosEnCurso,
            total: conteosEnCurso.length,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          })
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
            <li class="breadcrumb-item active">Conteos</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <h1 class="h3 mb-0">Conteos físicos de inventario</h1>
          <button class="btn btn-primary">
            <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
            Nuevo conteo
          </button>
        </div>

        <!-- Barra de filtros con en_curso seleccionado -->
        <div class="d-flex flex-wrap gap-3 mb-3 align-items-end">
          <div>
            <label for="estado-filter-enc" class="form-label small mb-1">Estado</label>
            <select id="estado-filter-enc" class="form-select form-select-sm" style="min-width:160px;">
              <option value="">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_curso" selected>En Curso</option>
              <option value="pausado">Pausado</option>
              <option value="completado">Completado</option>
              <option value="anulado">Anulado</option>
            </select>
          </div>
          <div>
            <label for="almacen-filter-enc" class="form-label small mb-1">Almacén</label>
            <select id="almacen-filter-enc" class="form-select form-select-sm" style="min-width:180px;">
              <option value="">Todos los almacenes</option>
              ${almacenesDisponibles.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th style="width:160px;">Número</th>
                    <th>Descripción</th>
                    <th style="width:160px;">Almacén</th>
                    <th style="width:120px;">Estado</th>
                    <th style="width:80px;" class="text-end">Ítems</th>
                    <th style="width:130px;">Creado</th>
                  </tr>
                </thead>
                <tbody>
                  ${conteosEnCurso
                    .map(
                      (c) => `
                    <tr style="cursor:pointer;">
                      <td class="fw-semibold">${c.numero}</td>
                      <td class="text-muted">${c.descripcion}</td>
                      <td>${c.almacenNombre}</td>
                      <td>${estadoBadge(c.estado)}</td>
                      <td class="text-end">${String(c.items.length)}</td>
                      <td class="text-muted small">${formatFecha(c.createdAt)}</td>
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

/** Story — detalle de conteo en estado planificado: botones "Iniciar Conteo" y "Anular" */
export const ConteoDetailPlanificado: Story = {
  name: 'Detalle — estado Planificado',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-003', () => HttpResponse.json(conteoCnt003)),
        http.patch('/api/conteos/cnt-003/estado', async ({ request }) => {
          const body = (await request.json()) as { estado: EstadoConteo };
          return HttpResponse.json({ ...conteoCnt003, estado: body.estado });
        }),
      ],
    },
  },
  render: () => buildDetalleHtml(conteoCnt003),
};

/** Story — detalle de conteo en estado en_curso: muestra botón "Cargar Cantidades" */
export const ConteoDetailEnCurso: Story = {
  name: 'Detalle — estado En Curso',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-002', () => HttpResponse.json(conteoCnt002)),
        http.patch('/api/conteos/cnt-002/estado', async ({ request }) => {
          const body = (await request.json()) as { estado: EstadoConteo };
          return HttpResponse.json({ ...conteoCnt002, estado: body.estado });
        }),
      ],
    },
  },
  render: () => buildDetalleHtml(conteoCnt002),
};

/** Story — detalle de conteo en estado pausado: botones "Cargar Cantidades" y "Reanudar" */
export const ConteoDetailPausado: Story = {
  name: 'Detalle — estado Pausado',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-005', () => HttpResponse.json(conteoCnt005)),
        http.patch('/api/conteos/cnt-005/estado', async ({ request }) => {
          const body = (await request.json()) as { estado: EstadoConteo };
          return HttpResponse.json({ ...conteoCnt005, estado: body.estado });
        }),
      ],
    },
  },
  render: () => buildDetalleHtml(conteoCnt005),
};

/** Story — detalle de conteo completado con discrepancias: botón "Cerrar y Conciliar" */
export const ConteoDetailCompletado: Story = {
  name: 'Detalle — estado Completado (con discrepancias)',
  parameters: {
    msw: {
      handlers: [http.get('/api/conteos/cnt-006', () => HttpResponse.json(conteoCnt006))],
    },
  },
  render: () => buildDetalleHtml(conteoCnt006),
};

/** Story — formulario de creación de nuevo conteo con almacenes y productos cargados */
export const ConteoNuevo: Story = {
  name: 'Formulario — nuevo conteo',
  parameters: {
    msw: {
      handlers: [
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
        http.get('/api/productos', () =>
          HttpResponse.json({
            data: productosDisponibles.map((p) => ({
              ...p,
              descripcion: p.nombre,
              categoriaId: 'cat-001',
              categoriaNombre: 'Tecnología',
              status: 'active',
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-01T00:00:00Z',
              createdBy: 'admin@ngr.com',
              updatedBy: 'admin@ngr.com',
            })),
            total: productosDisponibles.length,
            page: 1,
            pageSize: 100,
            totalPages: 1,
          })
        ),
        http.post('/api/conteos', async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            {
              id: 'cnt-new',
              numero: 'CNT-2025-0099',
              estado: 'planificado',
              ...body,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'mock-user@ngr.com',
              updatedBy: 'mock-user@ngr.com',
            },
            { status: 201 }
          );
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
            <li class="breadcrumb-item"><a href="#">Conteos</a></li>
            <li class="breadcrumb-item active">Nuevo conteo</li>
          </ol>
        </nav>
      </div>
      <div class="container-fluid p-4" style="max-width:800px;">
        <div class="d-flex align-items-center gap-3 mb-4">
          <a href="#" class="text-decoration-none text-secondary">← Volver</a>
          <h1 class="h3 mb-0">Nuevo conteo físico</h1>
        </div>

        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold">
            <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
            Información general
          </div>
          <div class="card-body">
            <form id="conteo-form" novalidate>
              <!-- Almacén -->
              <div class="mb-3">
                <label for="almacenId" class="form-label fw-semibold">
                  Almacén <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <select id="almacenId" name="almacenId" class="form-select">
                  <option value="">— Seleccioná un almacén —</option>
                  ${almacenesDisponibles.map((a) => `<option value="${a.id}">${a.nombre}</option>`).join('')}
                </select>
                <div class="invalid-feedback"></div>
              </div>

              <!-- Descripción -->
              <div class="mb-3">
                <label for="descripcion" class="form-label fw-semibold">
                  Descripción <span class="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  class="form-control"
                  placeholder="Ej: Conteo trimestral zona electrónica..."
                >
                <div class="invalid-feedback"></div>
              </div>

              <!-- Fecha planificada -->
              <div class="mb-3">
                <label for="fechaInicio" class="form-label">Fecha planificada</label>
                <input id="fechaInicio" name="fechaInicio" type="date" class="form-control">
              </div>
            </form>
          </div>
        </div>

        <!-- Selector de productos para el conteo -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header fw-semibold d-flex align-items-center justify-content-between">
            <span>
              <i class="bi bi-box-seam me-2" aria-hidden="true"></i>
              Productos a contar
            </span>
            <button class="btn btn-outline-primary btn-sm">
              <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
              Agregar producto
            </button>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="width:110px;" class="text-end">Cant. sistema</th>
                    <th style="width:40px;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${productosDisponibles
                    .slice(0, 3)
                    .map(
                      (p) => `
                    <tr>
                      <td>
                        <span class="text-muted small">${p.codigo}</span><br>
                        ${p.nombre}
                      </td>
                      <td class="text-end text-muted">—</td>
                      <td>
                        <button class="btn btn-outline-danger btn-sm btn-icon">
                          <i class="bi bi-trash" aria-label="Quitar producto"></i>
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

        <!-- Botones de acción -->
        <div class="d-flex gap-2">
          <button type="submit" form="conteo-form" class="btn btn-primary">
            <i class="bi bi-floppy me-1" aria-hidden="true"></i>
            Crear conteo
          </button>
          <a href="#" class="btn btn-outline-secondary">Cancelar</a>
        </div>
      </div>
    </div>
  `,
};

/** Story — página de carga de cantidades con ítems parcialmente contados (en_curso) */
export const ConteoCarga: Story = {
  name: 'Carga de cantidades — en_curso parcial',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-002', () => HttpResponse.json(conteoCnt002)),
        http.patch('/api/conteos/cnt-002/items', async ({ request }) => {
          const body = (await request.json()) as unknown[];
          return HttpResponse.json({ updated: body.length });
        }),
      ],
    },
  },
  render: () => buildCargaHtml(conteoCnt002),
};

/** Story — página de cierre con discrepancias (positivas y negativas) */
export const ConteoCierreConDiscrepancias: Story = {
  name: 'Cierre — con discrepancias',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-006', () => HttpResponse.json(conteoCnt006)),
        http.post('/api/conteos/cnt-006/cierre', async ({ request }) => {
          const body = (await request.json()) as { confirmarAjuste: boolean };
          return HttpResponse.json({
            conteo: { ...conteoCnt006, estado: 'completado' as EstadoConteo },
            movimientoAjusteId: body.confirmarAjuste ? 'mov-adj-001' : undefined,
            movimientoAjusteNumero: body.confirmarAjuste ? 'MOV-2025-ADJ-001' : undefined,
          });
        }),
      ],
    },
  },
  render: () => buildCierreHtml(conteoCnt006),
};

/** Story — página de cierre sin discrepancias (todos los ítems con diferencia = 0) */
export const ConteoCierreSinDiscrepancias: Story = {
  name: 'Cierre — sin discrepancias',
  parameters: {
    msw: {
      handlers: [
        http.get('/api/conteos/cnt-007', () => HttpResponse.json(conteoCnt007)),
        http.post('/api/conteos/cnt-007/cierre', () =>
          HttpResponse.json({
            conteo: { ...conteoCnt007, estado: 'completado' as EstadoConteo },
          })
        ),
      ],
    },
  },
  render: () => buildCierreHtml(conteoCnt007),
};
