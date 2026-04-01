import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Mockups/Dashboard',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/dashboard', () =>
          HttpResponse.json({
            kpis: [
              {
                label: 'Productos activos',
                value: 248,
                unit: undefined,
                trend: 'up',
                trendPercent: 5,
              },
              {
                label: 'Movimientos hoy',
                value: 34,
                unit: undefined,
                trend: 'stable',
                trendPercent: 0,
              },
              {
                label: 'Alertas de stock',
                value: 7,
                unit: undefined,
                trend: 'down',
                trendPercent: 2,
              },
              {
                label: 'Valor inventario',
                value: 1420580,
                unit: 'ARS',
                trend: 'up',
                trendPercent: 12,
              },
            ],
            alertasBajoStock: [
              {
                productoId: '1',
                productoCodigo: 'TKL-001',
                productoNombre: 'Teclado Mecánico TKL',
                stockActual: 2,
                stockMinimo: 5,
                almacenId: '1',
                almacenNombre: 'Depósito Central',
              },
              {
                productoId: '3',
                productoCodigo: 'MOU-003',
                productoNombre: 'Mouse Inalámbrico',
                stockActual: 1,
                stockMinimo: 10,
                almacenId: '1',
                almacenNombre: 'Depósito Central',
              },
            ],
            updatedAt: new Date().toISOString(),
          })
        ),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const kpiCard = (label: string, value: string, trend: string, icon: string) => `
  <div class="col-sm-6 col-lg-3">
    <div class="card h-100 border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex align-items-start justify-content-between mb-2">
          <span class="text-muted small">${label}</span>
          <i class="bi ${icon} text-primary opacity-75 fs-5"></i>
        </div>
        <div class="h3 fw-bold mb-1">${value}</div>
        <small class="text-success">${trend}</small>
      </div>
    </div>
  </div>
`;

const dashboardHtml = `
<div class="bg-body-secondary min-vh-100 p-4">
  <div class="mb-4">
    <h4 class="fw-bold mb-1">Panel principal</h4>
    <p class="text-muted small mb-0">Resumen operativo del inventario</p>
  </div>
  <div class="row g-3 mb-4">
    ${kpiCard('Productos activos', '248', '↑ 5% vs. mes anterior', 'bi-box-seam')}
    ${kpiCard('Movimientos hoy', '34', '→ Sin cambios', 'bi-arrow-left-right')}
    ${kpiCard('Alertas de stock', '7', '↓ 2 resueltas hoy', 'bi-exclamation-triangle')}
    ${kpiCard('Valor inventario', '$1.420.580', '↑ 12% vs. mes anterior', 'bi-currency-dollar')}
  </div>
  <div class="row g-3">
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-transparent border-bottom">
          <h6 class="mb-0 fw-semibold">Movimientos recientes</h6>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>N°</th><th>Tipo</th><th>Almacén</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              <tr><td>#0034</td><td>Entrada</td><td>Depósito Central</td><td><span class="badge bg-success-subtle text-success">Ejecutado</span></td><td>Hoy 10:24</td></tr>
              <tr><td>#0033</td><td>Salida</td><td>Almacén Norte</td><td><span class="badge bg-success-subtle text-success">Ejecutado</span></td><td>Hoy 09:15</td></tr>
              <tr><td>#0032</td><td>Transferencia</td><td>Almacén Sur</td><td><span class="badge bg-warning-subtle text-warning">Pendiente</span></td><td>Ayer 17:40</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-transparent border-bottom">
          <h6 class="mb-0 fw-semibold text-danger">Alertas de bajo stock</h6>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-start gap-2 mb-3 pb-3 border-bottom">
            <i class="bi bi-exclamation-circle-fill text-danger mt-1"></i>
            <div>
              <div class="fw-medium small">Teclado Mecánico TKL</div>
              <div class="text-muted" style="font-size: 0.75rem">Stock: 2 / Mínimo: 5 — Depósito Central</div>
            </div>
          </div>
          <div class="d-flex align-items-start gap-2">
            <i class="bi bi-exclamation-circle-fill text-danger mt-1"></i>
            <div>
              <div class="fw-medium small">Mouse Inalámbrico</div>
              <div class="text-muted" style="font-size: 0.75rem">Stock: 1 / Mínimo: 10 — Depósito Central</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

export const Predeterminado: Story = { render: () => dashboardHtml };

export const SinAlertas: Story = {
  render: () =>
    dashboardHtml.replace(
      /<div class="col-lg-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
      `<div class="col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-header bg-transparent border-bottom">
          <h6 class="mb-0 fw-semibold">Alertas de stock</h6>
        </div>
        <div class="card-body d-flex align-items-center justify-content-center text-center p-4">
          <div>
            <i class="bi bi-check-circle text-success fs-1 mb-2 d-block"></i>
            <p class="text-muted small mb-0">Sin alertas de stock. Todo está en orden.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`
    ),
};
