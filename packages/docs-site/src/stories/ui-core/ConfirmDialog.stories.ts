import { render as renderButton } from '@ngr-inventory/ui-core/components/button';
import { confirm } from '@ngr-inventory/ui-core/components/confirm-dialog';
import type { Meta, StoryObj } from '@storybook/html';

// Story del componente ConfirmDialog — diálogo de confirmación SweetAlert2
const meta: Meta = {
  title: 'UI Core/ConfirmDialog',
  parameters: {
    docs: {
      description: {
        component:
          'Diálogo de confirmación accesible con SweetAlert2. API imperativa asíncrona: ' +
          'confirm(props): Promise<boolean>. Los botones usan clases Bootstrap.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia de confirmación de eliminación (danger)
export const DangerVariant: Story = {
  name: 'Variante Peligro',
  render: () => {
    const btnHtml = renderButton({
      variant: 'danger',
      label: 'Eliminar producto',
      icon: 'trash',
      dataAction: 'delete-confirm',
    });

    setTimeout(() => {
      const root = document.getElementById('story-confirm-danger');
      if (!root) return;

      root.addEventListener('click', async () => {
        const confirmed = await confirm({
          title: '¿Eliminar producto?',
          message:
            'Esta acción <strong>no se puede deshacer</strong>. El producto será eliminado permanentemente.',
          confirmLabel: 'Sí, eliminar',
          cancelLabel: 'Cancelar',
          variant: 'danger',
        });

        if (confirmed) {
          alert('Producto eliminado');
        } else {
          alert('Operación cancelada');
        }
      });
    }, 0);

    return `<div id="story-confirm-danger" class="p-3">${btnHtml}</div>`;
  },
};

// Historia de confirmación de advertencia (warning)
export const WarningVariant: Story = {
  name: 'Variante Advertencia',
  render: () => {
    const btnHtml = renderButton({
      variant: 'warning',
      label: 'Ajustar stock',
      icon: 'exclamation-triangle',
      dataAction: 'adjust-confirm',
    });

    setTimeout(() => {
      const root = document.getElementById('story-confirm-warning');
      if (!root) return;

      root.addEventListener('click', async () => {
        const confirmed = await confirm({
          title: '¿Ajustar el stock?',
          message: 'Estás a punto de modificar el stock del producto. ¿Confirmás el ajuste?',
          confirmLabel: 'Confirmar ajuste',
          cancelLabel: 'Cancelar',
          variant: 'warning',
        });

        if (confirmed) {
          alert('Ajuste confirmado');
        } else {
          alert('Operación cancelada');
        }
      });
    }, 0);

    return `<div id="story-confirm-warning" class="p-3">${btnHtml}</div>`;
  },
};
