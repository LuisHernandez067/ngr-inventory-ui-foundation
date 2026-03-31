import type { Meta, StoryObj } from '@storybook/html';
import { show, hide } from '@ngr-inventory/ui-patterns/patterns/loading-overlay';
import { render as renderButton } from '@ngr-inventory/ui-core/components/button';

// Story del patrón LoadingOverlay — overlay imperativo de carga
const meta: Meta = {
  title: 'UI Patterns/LoadingOverlay',
  parameters: {
    docs: {
      description: {
        component:
          'Overlay de carga imperativo que cubre un elemento raíz. ' +
          'API: show(root, message?) / hide(root). ' +
          'Agrega aria-busy al root cuando está visible.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia del ciclo show/hide
export const CicloShowHide: Story = {
  name: 'Ciclo show / hide',
  render: () => {
    const targetId = 'story-overlay-target';

    setTimeout(() => {
      const target = document.getElementById(targetId);
      const showBtn = document.getElementById('story-show-btn');
      const hideBtn = document.getElementById('story-hide-btn');
      if (!target || !showBtn || !hideBtn) return;

      showBtn.addEventListener('click', () => show(target, 'Cargando inventario...'));
      hideBtn.addEventListener('click', () => hide(target));
    }, 0);

    return `
      <div class="p-3">
        <div class="mb-3 d-flex gap-2">
          ${renderButton({ variant: 'primary', label: 'Mostrar overlay', id: 'story-show-btn' })}
          ${renderButton({ variant: 'secondary', label: 'Ocultar overlay', id: 'story-hide-btn' })}
        </div>
        <div id="${targetId}" class="border rounded p-4" style="min-height:150px">
          <p class="text-muted mb-0">Contenido de la tabla de productos...</p>
          <p class="text-muted">Laptop HP | Monitor Dell | Teclado Logitech</p>
        </div>
      </div>
    `;
  },
};

// Historia con mensaje personalizado
export const ConMensajePersonalizado: Story = {
  name: 'Con mensaje personalizado',
  render: () => {
    const targetId = 'story-overlay-msg';

    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      show(target, 'Guardando cambios...');
    }, 0);

    return `
      <div class="p-3">
        <div id="${targetId}" class="border rounded p-4" style="min-height:150px">
          <p class="text-muted mb-0">Contenido debajo del overlay</p>
        </div>
      </div>
    `;
  },
};

// Historia automática — muestra y oculta con delay
export const CicloAutomatico: Story = {
  name: 'Ciclo automático (3 segundos)',
  render: () => {
    const targetId = 'story-overlay-auto';

    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      show(target, 'Actualizando stock...');
      setTimeout(() => hide(target), 3000);
    }, 500);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic">El overlay aparece automáticamente y desaparece en 3 segundos.</p>
        <div id="${targetId}" class="border rounded p-4" style="min-height:120px">
          <p class="mb-0">Inventario actualizado correctamente.</p>
        </div>
      </div>
    `;
  },
};
