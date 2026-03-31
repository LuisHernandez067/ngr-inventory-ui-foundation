import type { Meta, StoryObj } from '@storybook/html';
import { render, init } from '@ngr-inventory/ui-patterns/patterns/action-menu';
import type { ActionMenuItem } from '@ngr-inventory/ui-patterns';

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
        console.log('ngr:action recibido:', ce.detail);
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

// Historia en contexto de tabla
export const EnTabla: Story = {
  name: 'En contexto de tabla',
  render: () => {
    setTimeout(() => {
      document.querySelectorAll('.action-menu-row').forEach((root) => {
        init(root as HTMLElement);
        root.addEventListener('ngr:action', (event: Event) => {
          const ce = event as CustomEvent<{ id: string }>;
          console.log('Acción en fila:', ce.detail);
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
