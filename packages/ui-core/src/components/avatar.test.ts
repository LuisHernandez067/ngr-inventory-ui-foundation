import { describe, it, expect } from 'vitest';
import { render, init } from './avatar';

// Tests del componente Avatar
describe('Avatar — render()', () => {
  it('debe mostrar las iniciales del nombre completo', () => {
    const html = render({ name: 'John Doe' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.ngr-avatar')?.textContent).toBe('JD');
  });

  it('debe mostrar solo la primera inicial cuando hay un solo nombre', () => {
    const html = render({ name: 'Admin' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.ngr-avatar')?.textContent).toBe('A');
  });

  it('debe incluir aria-label con el nombre completo', () => {
    const html = render({ name: 'John Doe' });
    expect(html).toContain('aria-label="John Doe"');
  });

  it('debe aplicar la clase ngr-avatar-{size} según el tamaño', () => {
    const html = render({ name: 'Test User', size: 'lg' });
    expect(html).toContain('ngr-avatar-lg');
  });

  it('debe usar ngr-avatar-md por defecto', () => {
    const html = render({ name: 'Test User' });
    expect(html).toContain('ngr-avatar-md');
  });

  it('debe usar un color determinístico con CSS var --ngr-avatar-{n}', () => {
    const html = render({ name: 'John Doe' });
    expect(html).toContain('--ngr-avatar-');
  });

  it('debe usar el mismo color para el mismo nombre (determinístico)', () => {
    const html1 = render({ name: 'Maria Garcia' });
    const html2 = render({ name: 'Maria Garcia' });
    // Extraer el estilo de color de ambos renders
    const colorMatch1 = html1.match(/--ngr-avatar-\d+/);
    const colorMatch2 = html2.match(/--ngr-avatar-\d+/);
    expect(colorMatch1?.[0]).toBe(colorMatch2?.[0]);
  });

  it('debe renderizar una imagen cuando se proporciona src', () => {
    const html = render({ name: 'Test User', src: 'https://example.com/avatar.jpg' });
    const el = document.createElement('div');
    el.innerHTML = html;
    const img = el.querySelector('img.ngr-avatar-img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('debe usar iniciales en mayúsculas', () => {
    const html = render({ name: 'carlos perez' });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('.ngr-avatar')?.textContent).toBe('CP');
  });
});

describe('Avatar — init()', () => {
  it('debe ejecutarse sin errores en un elemento raíz', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ name: 'Test User' });
    expect(() => init(root)).not.toThrow();
  });
});
