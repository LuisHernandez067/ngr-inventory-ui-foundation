import { describe, it, expect } from 'vitest';

import { render, init } from './alert';

// Tests del componente Alert
describe('Alert — render()', () => {
  it('debe renderizar un div con clase alert y la variante correcta', () => {
    const html = render({ variant: 'success', message: 'Operación exitosa' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const alert = el.querySelector('.alert.alert-success');
    expect(alert).not.toBeNull();
  });

  it('debe incluir role="alert" para accesibilidad', () => {
    const html = render({ variant: 'info', message: 'Información importante' });
    expect(html).toContain('role="alert"');
  });

  it('debe incluir el mensaje como contenido', () => {
    const html = render({ variant: 'warning', message: 'Advertencia del sistema' });
    expect(html).toContain('Advertencia del sistema');
  });

  it('debe agregar clases dismissible y botón de cierre cuando dismissible es true', () => {
    const html = render({ variant: 'danger', message: 'Error crítico', dismissible: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(html).toContain('alert-dismissible');
    expect(el.querySelector('[data-bs-dismiss="alert"]')).not.toBeNull();
  });

  it('debe incluir aria-live="polite" cuando dismissible es true', () => {
    const html = render({ variant: 'info', message: 'Mensaje', dismissible: true });
    expect(html).toContain('aria-live="polite"');
  });

  it('debe incluir el ícono correcto para success cuando showIcon es true', () => {
    const html = render({ variant: 'success', message: 'OK', showIcon: true });
    expect(html).toContain('bi-check-circle-fill');
  });

  it('debe incluir el ícono correcto para danger cuando showIcon es true', () => {
    const html = render({ variant: 'danger', message: 'Error', showIcon: true });
    expect(html).toContain('bi-x-circle-fill');
  });

  it('debe incluir el ícono correcto para warning cuando showIcon es true', () => {
    const html = render({ variant: 'warning', message: 'Cuidado', showIcon: true });
    expect(html).toContain('bi-exclamation-triangle-fill');
  });

  it('debe incluir el ícono correcto para info cuando showIcon es true', () => {
    const html = render({ variant: 'info', message: 'Info', showIcon: true });
    expect(html).toContain('bi-info-circle-fill');
  });

  it('no debe incluir ícono cuando showIcon es false', () => {
    const html = render({ variant: 'success', message: 'Sin ícono', showIcon: false });
    expect(html).not.toContain('bi-check-circle-fill');
  });
});

describe('Alert — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ variant: 'info', message: 'Test' });
    expect(() => {
      init(root);
    }).not.toThrow();
  });
});
