import { render as renderButton } from '@ngr-inventory/ui-core/components/button';
import { show, hide } from '@ngr-inventory/ui-patterns/patterns/loading-overlay';
import type { Meta, StoryObj } from '@storybook/html';

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

// Historia visual — overlay sobre una tabla de datos simulada
export const SobreTabla: Story = {
  name: 'Sobre tabla',
  render: () => {
    const targetId = 'story-overlay-table';

    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      show(target, 'Cargando productos...');
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">Overlay activo sobre una tabla de datos.</p>
        <div id="${targetId}" class="border rounded" style="min-height:200px">
          <table class="table mb-0">
            <thead class="table-light">
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>TKL-001</td><td>Teclado Mecánico</td><td>Periféricos</td><td>12</td></tr>
              <tr><td>MON-002</td><td>Monitor 27" IPS</td><td>Monitores</td><td>5</td></tr>
              <tr><td>MOU-003</td><td>Mouse Inalámbrico</td><td>Periféricos</td><td>8</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
};

// Historia visual — overlay sobre un formulario de edición
export const SobreFormulario: Story = {
  name: 'Sobre formulario',
  render: () => {
    const targetId = 'story-overlay-form';

    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;
      show(target, 'Guardando cambios...');
    }, 0);

    return `
      <div class="p-3">
        <p class="text-muted fst-italic mb-2">Overlay activo sobre un formulario de edición.</p>
        <div id="${targetId}" class="border rounded p-4" style="max-width:480px">
          <div class="mb-3">
            <label class="form-label">Nombre del producto</label>
            <input type="text" class="form-control" value="Teclado Mecánico TKL" disabled>
          </div>
          <div class="mb-3">
            <label class="form-label">Categoría</label>
            <select class="form-select" disabled>
              <option>Periféricos</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Precio unitario</label>
            <input type="number" class="form-control" value="8500" disabled>
          </div>
          <button class="btn btn-primary" disabled>Guardar</button>
        </div>
      </div>
    `;
  },
};
