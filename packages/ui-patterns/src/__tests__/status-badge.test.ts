import { describe, it, expect } from 'vitest';

import { render } from '../patterns/status-badge';

// Tests del patrón StatusBadge
describe('StatusBadge — render()', () => {
  it('debe renderizar badge success para estado "activo"', () => {
    const html = render({ status: 'activo' });
    expect(html).toContain('bg-success');
    expect(html).toContain('Activo');
  });

  it('debe renderizar badge secondary para estado "inactivo"', () => {
    const html = render({ status: 'inactivo' });
    expect(html).toContain('bg-secondary');
    expect(html).toContain('Inactivo');
  });

  it('debe renderizar badge warning para estado "pendiente"', () => {
    const html = render({ status: 'pendiente' });
    expect(html).toContain('bg-warning');
    expect(html).toContain('Pendiente');
  });

  it('debe renderizar badge success para estado "aprobado"', () => {
    const html = render({ status: 'aprobado' });
    expect(html).toContain('bg-success');
    expect(html).toContain('Aprobado');
  });

  it('debe renderizar badge danger para estado "rechazado"', () => {
    const html = render({ status: 'rechazado' });
    expect(html).toContain('bg-danger');
    expect(html).toContain('Rechazado');
  });

  it('debe renderizar badge info para estado "en_transito"', () => {
    const html = render({ status: 'en_transito' });
    expect(html).toContain('bg-info');
    expect(html).toContain('En tránsito');
  });

  it('debe renderizar badge warning para estado "reservado"', () => {
    const html = render({ status: 'reservado' });
    expect(html).toContain('bg-warning');
    expect(html).toContain('Reservado');
  });

  it('debe renderizar badge secondary con el texto crudo para estado desconocido', () => {
    const html = render({ status: 'estado_raro' });
    expect(html).toContain('bg-secondary');
    expect(html).toContain('estado_raro');
  });

  it('debe aplicar rounded-pill cuando pill es true', () => {
    const html = render({ status: 'activo', pill: true });
    expect(html).toContain('rounded-pill');
  });

  it('debe incluir la clase ngr-status-badge', () => {
    const html = render({ status: 'activo' });
    expect(html).toContain('ngr-status-badge');
  });

  it('debe incluir el ícono Bootstrap Icons correspondiente', () => {
    const html = render({ status: 'rechazado' });
    expect(html).toContain('bi-x-circle-fill');
  });
});
