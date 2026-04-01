import { FormField } from '@ngr-inventory/ui-patterns';
import type { Meta, StoryObj } from '@storybook/html';

const render = FormField.render;

// Story del patrón FormField — campo de formulario accesible
const meta: Meta = {
  title: 'UI Patterns/FormField',
  parameters: {
    docs: {
      description: {
        component:
          'Campo de formulario accesible con soporte de helper text, estado de error y aria-describedby. ' +
          'Sin comportamiento interactivo — la accesibilidad se maneja en el HTML.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Historia básica
export const Default: Story = {
  name: 'Por defecto',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({ label: 'Nombre del producto', name: 'nombre' })}
    </div>
  `,
};

// Historia con helper text
export const ConHelperText: Story = {
  name: 'Con texto de ayuda',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({
        label: 'Precio unitario',
        name: 'precio',
        type: 'number',
        helperText: 'Ingresá el precio en pesos argentinos (sin decimales)',
      })}
    </div>
  `,
};

// Historia con estado de error
export const ConError: Story = {
  name: 'Estado de error',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({
        label: 'Código SKU',
        name: 'sku',
        value: 'SKU--INVALIDO',
        error: 'El código SKU solo puede contener letras, números y guiones simples.',
      })}
    </div>
  `,
};

// Historia con campo requerido
export const Requerido: Story = {
  name: 'Campo requerido',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({
        label: 'Descripción',
        name: 'descripcion',
        required: true,
        placeholder: 'Descripción detallada del producto...',
        helperText: 'Mínimo 20 caracteres.',
      })}
    </div>
  `,
};

// Historia con campo deshabilitado
export const Deshabilitado: Story = {
  name: 'Campo deshabilitado',
  render: () => `
    <div class="p-3" style="max-width:400px">
      ${render({
        label: 'Código de barras',
        name: 'barcode',
        value: '7891234567890',
        disabled: true,
        helperText: 'Este campo se asigna automáticamente.',
      })}
    </div>
  `,
};

// Historia con formulario completo de producto
export const FormularioProducto: Story = {
  name: 'Formulario completo — producto',
  render: () => `
    <form class="p-3" style="max-width:500px">
      ${render({ label: 'Nombre', name: 'nombre', required: true, placeholder: 'Ej: Laptop HP EliteBook 840' })}
      ${render({ label: 'Código SKU', name: 'sku', required: true, placeholder: 'Ej: HP-840-G9' })}
      ${render({ label: 'Precio (COP)', name: 'precio', type: 'number', helperText: 'Precio sin IVA' })}
      ${render({ label: 'Stock inicial', name: 'stock', type: 'number', value: '0' })}
      ${render({ label: 'Descripción', name: 'descripcion', helperText: 'Opcional' })}
    </form>
  `,
};
