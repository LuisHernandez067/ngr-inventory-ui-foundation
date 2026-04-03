import { render as renderPageHeader } from '@ngr-inventory/ui-core/components/page-header';
import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';

const meta = {
  title: 'Mockups/Productos/Detalle de producto',
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.get('/api/productos/1', () =>
          HttpResponse.json({
            id: '1',
            codigo: 'TKL-001',
            nombre: 'Teclado Mecánico TKL',
            descripcion:
              'Teclado mecánico tenkeyless con switches Cherry MX Brown. Ideal para oficina y gaming moderado.',
            categoriaId: '1',
            categoriaNombre: 'Periféricos',
            proveedorId: '1',
            proveedorNombre: 'TechDistrib Argentina S.A.',
            unidadMedida: 'unidad',
            precioUnitario: 8500,
            stockMinimo: 5,
            stockMaximo: 50,
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-06-20T14:30:00Z',
          })
        ),
      ],
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const pageHeader = renderPageHeader({
  title: 'Teclado Mecánico TKL',
  breadcrumb:
    '<ol class="breadcrumb mb-0 small"><li class="breadcrumb-item"><a href="#">Inicio</a></li><li class="breadcrumb-item"><a href="#">Productos</a></li><li class="breadcrumb-item active">Teclado Mecánico TKL</li></ol>',
});

const detailHtml = `
<div class="bg-body-secondary min-vh-100">
  ${pageHeader}
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h4 class="fw-bold mb-1">Teclado Mecánico TKL</h4>
        <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
        <span class="badge bg-secondary-subtle text-secondary border ms-1">TKL-001</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm">Historial</button>
        <button class="btn btn-primary btn-sm">Editar</button>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-transparent"><h6 class="mb-0 fw-semibold">Información general</h6></div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label small text-muted">Código</label>
                <div class="fw-medium">TKL-001</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label small text-muted">Categoría</label>
                <div class="fw-medium">Periféricos</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label small text-muted">Proveedor</label>
                <div class="fw-medium">TechDistrib Argentina S.A.</div>
              </div>
              <div class="col-sm-6">
                <label class="form-label small text-muted">Unidad de medida</label>
                <div class="fw-medium">Unidad</div>
              </div>
              <div class="col-12">
                <label class="form-label small text-muted">Descripción</label>
                <div>Teclado mecánico tenkeyless con switches Cherry MX Brown. Ideal para oficina y gaming moderado.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-header bg-transparent"><h6 class="mb-0 fw-semibold">Stock y precios</h6></div>
          <div class="card-body">
            <div class="mb-3">
              <div class="text-muted small">Precio unitario</div>
              <div class="h5 fw-bold text-primary">$8.500</div>
            </div>
            <div class="row g-2">
              <div class="col-6">
                <div class="text-muted small">Stock mínimo</div>
                <div class="fw-medium">5 unidades</div>
              </div>
              <div class="col-6">
                <div class="text-muted small">Stock máximo</div>
                <div class="fw-medium">50 unidades</div>
              </div>
            </div>
          </div>
        </div>
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent"><h6 class="mb-0 fw-semibold">Auditoría</h6></div>
          <div class="card-body">
            <div class="mb-2">
              <div class="text-muted small">Creado</div>
              <div class="small">15/01/2024 10:00</div>
            </div>
            <div>
              <div class="text-muted small">Última modificación</div>
              <div class="small">20/06/2024 14:30</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

export const Predeterminado: Story = { render: () => detailHtml };

export const Editando: Story = {
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
      <div class="container-fluid p-4" style="max-width: 800px">
        <h4 class="fw-bold mb-4">Editar producto</h4>
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label">Código <span class="text-danger">*</span></label>
                <input type="text" class="form-control" value="TKL-001">
              </div>
              <div class="col-sm-6">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input type="text" class="form-control" value="Teclado Mecánico TKL">
              </div>
              <div class="col-sm-6">
                <label class="form-label">Categoría <span class="text-danger">*</span></label>
                <select class="form-select">
                  <option selected>Periféricos</option>
                  <option>Monitores</option>
                  <option>Almacenamiento</option>
                </select>
              </div>
              <div class="col-sm-6">
                <label class="form-label">Unidad de medida <span class="text-danger">*</span></label>
                <select class="form-select">
                  <option selected>unidad</option>
                  <option>kg</option>
                  <option>litro</option>
                </select>
              </div>
              <div class="col-sm-4">
                <label class="form-label">Precio unitario</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" value="8500">
                </div>
              </div>
              <div class="col-sm-4">
                <label class="form-label">Stock mínimo</label>
                <input type="number" class="form-control" value="5">
              </div>
              <div class="col-sm-4">
                <label class="form-label">Stock máximo</label>
                <input type="number" class="form-control" value="50">
              </div>
              <div class="col-12">
                <label class="form-label">Descripción</label>
                <textarea class="form-control" rows="3">Teclado mecánico tenkeyless con switches Cherry MX Brown.</textarea>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-end gap-2">
            <button class="btn btn-outline-secondary">Cancelar</button>
            <button class="btn btn-primary">Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  `,
};
