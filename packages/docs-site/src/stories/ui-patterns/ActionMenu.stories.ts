import type { ActionMenuItem } from '@ngr-inventory/ui-patterns';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/action-menu';
import type { Meta, StoryObj } from '@storybook/html';

// Story del patrón ActionMenu — menú desplegable de acciones con Bootstrap Dropdown
const meta: Meta = {
  title: 'UI Patterns/ActionMenu',
  parameters: {
    docs: {
      description: {
        component:
          'Menú desplegable de acciones que usa Bootstrap Dropdown. ' +
          'Emite ngr:action con { id } al seleccionar un ítem activo.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Ítems de acciones para productos del inventario
const itemsProducto: ActionMenuItem[] = [
  { id: 'editar', label: 'Editar', icon: 'pencil' },
  { id: 'duplicar', label: 'Duplicar', icon: 'copy' },
  { id: 'ajustar-stock', label: 'Ajustar stock', icon: 'boxes' },
  { id: 'eliminar', label: 'Eliminar', icon: 'trash', variant: 'danger' },
];

// Historia básica del menú de acciones
export const Default: Story = {
  name: 'Por defecto',
  render: () => {
    const rootId = 'story-action-menu';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    return `
      <div class="p-3 d-flex justify-content-center">
        <div id="${rootId}">
          ${render({ items: itemsProducto })}
        </div>
      </div>
    `;
  },
};

// Historia con ítem deshabilitado
export const ConItemDeshabilitado: Story = {
  name: 'Con ítem deshabilitado',
  render: () => {
    const rootId = 'story-action-disabled';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    const items: ActionMenuItem[] = [
      { id: 'editar', label: 'Editar', icon: 'pencil' },
      { id: 'publicar', label: 'Publicar', icon: 'send', disabled: true },
      { id: 'archivar', label: 'Archivar', icon: 'archive', disabled: true },
      { id: 'eliminar', label: 'Eliminar', icon: 'trash', variant: 'danger' },
    ];

    return `
      <div class="p-3 d-flex justify-content-center">
        <div id="${rootId}">
          ${render({ items })}
        </div>
      </div>
    `;
  },
};

// Historia de tamaño pequeño
export const TamanioSmall: Story = {
  name: 'Tamaño pequeño (sm)',
  render: () => {
    const rootId = 'story-action-sm';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
    }, 0);

    return `
      <div class="p-3 d-flex justify-content-center">
        <div id="${rootId}">
          ${render({ items: itemsProducto, size: 'sm' })}
        </div>
      </div>
    `;
  },
};

// Historia interactiva con evento
export const Interactivo: Story = {
  name: 'Interactivo — emite ngr:action',
  render: () => {
    const rootId = 'story-action-interactive';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
      root.addEventListener('ngr:action', (event: Event) => {
        const ce = event as CustomEvent<{ id: string }>;
        const output = document.getElementById('story-action-output');
        if (output) output.textContent = `Acción seleccionada: "${ce.detail.id}"`;
        // Evento de acción registrado — ver panel Actions de Storybook
      });
    }, 0);

    return `
      <div class="p-3">
        <div class="d-flex justify-content-center">
          <div id="${rootId}">
            ${render({ items: itemsProducto })}
          </div>
        </div>
        <p id="story-action-output" class="mt-3 text-center text-muted fst-italic">
          Abrí el menú y seleccioná una acción...
        </p>
      </div>
    `;
  },
};

// Historia que simula el estado de carga del contenedor padre — menú deshabilitado
export const Cargando: Story = {
  name: 'Cargando — contenedor en carga',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-3">
        Cuando el contenedor padre está cargando, el ActionMenu se muestra deshabilitado.
      </p>
      <div class="position-relative" style="opacity:0.5; pointer-events:none">
        ${render({ items: itemsProducto })}
      </div>
      <div class="mt-3 d-flex align-items-center gap-2 text-muted small">
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Cargando datos del producto...
      </div>
    </div>
  `,
};

// Historia que simula que no hay datos — menú oculto cuando no hay registros
export const SinDatos: Story = {
  name: 'Sin datos — menú oculto',
  render: () => `
    <div class="p-3">
      <p class="text-muted fst-italic mb-3">
        Sin registros disponibles, no se renderiza el ActionMenu.
      </p>
      <div class="card border-0 bg-body-secondary rounded-3 p-5 text-center">
        <i class="bi bi-inbox fs-1 text-muted mb-2 d-block"></i>
        <p class="text-muted mb-0">Sin productos. No hay acciones disponibles.</p>
      </div>
    </div>
  `,
};

// Historia que simula error en la operación — ítem de reintento visible
export const ConError: Story = {
  name: 'Con error — acción fallida',
  render: () => {
    const rootId = 'story-action-error';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      init(root);
      root.addEventListener('ngr:action', (event: Event) => {
        const ce = event as CustomEvent<{ id: string }>;
        if (ce.detail.id === 'reintentar') {
          const msg = document.getElementById('story-action-error-msg');
          if (msg) {
            msg.className = 'alert alert-info small py-2 mt-2';
            msg.textContent = 'Reintentando operación...';
          }
        }
      });
    }, 0);

    const itemsConError: ActionMenuItem[] = [
      { id: 'reintentar', label: 'Reintentar', icon: 'arrow-clockwise' },
      { id: 'cancelar', label: 'Cancelar acción', icon: 'x-circle', variant: 'danger' },
    ];

    return `
      <div class="p-3">
        <div class="alert alert-danger small py-2 mb-3" role="alert">
          <i class="bi bi-exclamation-circle me-1"></i>
          No se pudo completar la operación. Intentá nuevamente.
        </div>
        <div id="${rootId}">
          ${render({ items: itemsConError })}
        </div>
        <div id="story-action-error-msg" style="display:none"></div>
      </div>
    `;
  },
};

// Historia en contexto de tabla
export const EnTabla: Story = {
  name: 'En contexto de tabla',
  render: () => {
    setTimeout(() => {
      document.querySelectorAll('.action-menu-row').forEach((root) => {
        init(root as HTMLElement);
        root.addEventListener('ngr:action', () => {
          // Evento de acción en fila registrado — ver panel Actions de Storybook
        });
      });
    }, 0);

    const rows = [
      { nombre: 'Laptop HP EliteBook', stock: 12, estado: 'activo' },
      { nombre: 'Monitor Dell 27"', stock: 5, estado: 'pendiente' },
      { nombre: 'Teclado Logitech MX', stock: 0, estado: 'inactivo' },
    ];

    return `
      <table class="table p-3">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row, i) => `
            <tr>
              <td>${row.nombre}</td>
              <td>${row.stock}</td>
              <td>${row.estado}</td>
              <td>
                <div class="action-menu-row">
                  ${render({ items: itemsProducto, size: 'sm', id: `action-${i}` })}
                </div>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  },
};
