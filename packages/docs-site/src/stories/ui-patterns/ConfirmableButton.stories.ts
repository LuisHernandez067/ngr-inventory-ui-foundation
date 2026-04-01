import type { Meta, StoryObj } from '@storybook/html';
import { http, HttpResponse } from 'msw';
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

// Historia con el diálogo ya abierto — muestra el modal de confirmación visible
export const Confirmando: Story = {
  name: 'Confirmando — diálogo abierto',
  render: () => {
    const rootId = 'story-confirmable-open';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Eliminar producto',
        icon: 'trash',
        variant: 'danger',
        confirmTitle: '¿Eliminar producto?',
        confirmMessage:
          'Esta acción no se puede deshacer. <br>El producto <strong>Teclado Mecánico TKL</strong> será eliminado permanentemente.',
        confirmVariant: 'danger',
        onConfirmed: async () => {
          await new Promise((res) => setTimeout(res, 1500));
        },
      });
      // Disparar clic automático para abrir el diálogo
      setTimeout(() => {
        const btn = root.querySelector('button') as HTMLButtonElement | null;
        if (btn) btn.click();
      }, 300);
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">El diálogo se abre automáticamente para mostrar el estado de confirmación.</p>
        <div id="${rootId}"></div>
      </div>
    `;
  },
};

// Historia con el botón en estado de carga tras confirmar — usa MSW para DELETE
export const CargandoAccion: Story = {
  name: 'Cargando acción (MSW)',
  parameters: {
    msw: {
      handlers: [http.delete('/api/productos/1', () => new Promise(() => {}))],
    },
  },
  render: () => {
    const rootId = 'story-confirmable-loading-action';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Eliminar producto',
        icon: 'trash',
        variant: 'danger',
        confirmTitle: '¿Eliminar producto?',
        confirmMessage:
          'El producto <strong>Teclado Mecánico TKL</strong> será eliminado permanentemente.',
        confirmVariant: 'danger',
        onConfirmed: async () => {
          // La promesa nunca resuelve — el botón queda en estado de carga
          await fetch('/api/productos/1', { method: 'DELETE' });
        },
      });
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          Confirmá la acción — el handler nunca resuelve, el botón queda en estado de carga.
        </p>
        <div id="${rootId}"></div>
      </div>
    `;
  },
};

// Historia con acción fallida — la API devuelve 500 tras confirmar
export const AccionFallida: Story = {
  name: 'Acción fallida (MSW)',
  parameters: {
    msw: {
      handlers: [
        http.delete('/api/productos/1', () =>
          HttpResponse.json(
            { type: 'about:blank', title: 'Error del servidor', status: 500 },
            { status: 500 }
          )
        ),
      ],
    },
  },
  render: () => {
    const rootId = 'story-confirmable-failed';

    setTimeout(() => {
      const root = document.getElementById(rootId);
      if (!root) return;
      mount(root, {
        label: 'Eliminar producto',
        icon: 'trash',
        variant: 'danger',
        confirmTitle: '¿Eliminar producto?',
        confirmMessage:
          'El producto <strong>Teclado Mecánico TKL</strong> será eliminado permanentemente.',
        confirmVariant: 'danger',
        onConfirmed: async () => {
          const response = await fetch('/api/productos/1', { method: 'DELETE' });
          if (!response.ok) {
            const errorMsg = document.getElementById('story-confirmable-error-msg');
            if (errorMsg) {
              errorMsg.className = 'alert alert-danger small py-2 mt-2';
              errorMsg.textContent = `Error ${response.status.toString()}: No se pudo eliminar el producto.`;
            }
          }
        },
      });
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">
          La API devuelve 500 tras confirmar — se muestra el mensaje de error.
        </p>
        <div id="${rootId}"></div>
        <div id="story-confirmable-error-msg" class="mt-2" style="display:none"></div>
      </div>
    `;
  },
};
