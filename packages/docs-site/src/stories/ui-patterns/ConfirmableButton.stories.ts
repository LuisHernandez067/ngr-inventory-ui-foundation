import type { Meta, StoryObj } from '@storybook/html';
import { mount } from '@ngr-inventory/ui-patterns/patterns/confirmable-button';

// Story del patrón ConfirmableButton — botón con confirmación previa y estado de carga
const meta: Meta = {
  title: 'UI Patterns/ConfirmableButton',
  parameters: {
    docs: {
      description: {
        component:
          'Botón de acción que requiere confirmación antes de ejecutar. ' +
          'Muestra el estado de carga durante la operación async y restaura el botón al finalizar.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia de eliminación de producto
export const EliminarProducto: Story = {
  name: 'Eliminar producto',
  render: () => {
    const rootId = 'story-confirmable-delete';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Eliminar producto',
        icon: 'trash',
        variant: 'danger',
        confirmTitle: '¿Eliminar producto?',
        confirmMessage:
          'Esta acción no se puede deshacer. <br>El producto <strong>Laptop HP EliteBook 840</strong> será eliminado permanentemente.',
        confirmVariant: 'danger',
        onConfirmed: async () => {
          // Simular operación async (1.5 segundos)
          await new Promise((res) => setTimeout(res, 1500));
          console.log('Producto eliminado');
        },
      });
    }, 0);

    return `<div id="${rootId}" class="p-3"></div>`;
  },
};

// Historia de confirmación de envío
export const ConfirmarEnvio: Story = {
  name: 'Confirmar envío',
  render: () => {
    const rootId = 'story-confirmable-send';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Confirmar envío',
        icon: 'send',
        variant: 'warning',
        confirmTitle: '¿Confirmar envío?',
        confirmMessage:
          'Se enviará el pedido <strong>#ORD-2024-001</strong> al proveedor. ' +
          'Esta acción no puede ser revertida.',
        confirmVariant: 'warning',
        onConfirmed: async () => {
          await new Promise((res) => setTimeout(res, 2000));
          console.log('Envío confirmado');
        },
      });
    }, 0);

    return `<div id="${rootId}" class="p-3"></div>`;
  },
};

// Historia de cancelación
export const CancelarOrden: Story = {
  name: 'Cancelar orden',
  render: () => {
    const rootId = 'story-confirmable-cancel';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Cancelar orden',
        icon: 'x-circle',
        variant: 'secondary',
        confirmTitle: '¿Cancelar la orden?',
        confirmMessage:
          '¿Estás seguro de que querés cancelar la orden <strong>#ORD-2024-015</strong>?',
        confirmVariant: 'warning',
        onConfirmed: async () => {
          await new Promise((res) => setTimeout(res, 1000));
          console.log('Orden cancelada');
        },
      });
    }, 0);

    return `<div id="${rootId}" class="p-3"></div>`;
  },
};

// Historia con múltiples botones confirmables
export const MultiplesAcciones: Story = {
  name: 'Múltiples acciones confirmables',
  render: () => {
    setTimeout(() => {
      const rootDelete = document.getElementById('story-multi-delete');
      const rootArchive = document.getElementById('story-multi-archive');

      if (rootDelete) {
        mount(rootDelete, {
          label: 'Eliminar',
          icon: 'trash',
          variant: 'danger',
          confirmTitle: '¿Eliminar?',
          confirmMessage: '¿Confirmar eliminación del registro?',
          onConfirmed: async () => {
            await new Promise((res) => setTimeout(res, 1000));
          },
        });
      }

      if (rootArchive) {
        mount(rootArchive, {
          label: 'Archivar',
          icon: 'archive',
          variant: 'secondary',
          confirmTitle: '¿Archivar?',
          confirmMessage: '¿Confirmar archivado del registro?',
          confirmVariant: 'warning',
          onConfirmed: async () => {
            await new Promise((res) => setTimeout(res, 800));
          },
        });
      }
    }, 0);

    return `
      <div class="p-3 d-flex gap-2">
        <div id="story-multi-delete"></div>
        <div id="story-multi-archive"></div>
      </div>
    `;
  },
};
