import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '../server';

// Tests de integración para el handler de auditoría (solo lectura con filtros)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// ── GET /api/auditoria ────────────────────────────────────────────────────────

describe('GET /api/auditoria', () => {
  it('debe retornar las 22 entradas de auditoría sin filtros', async () => {
    const response = await fetch('http://localhost/api/auditoria?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.total).toBe(22);
    expect(body.data).toHaveLength(22);
  });

  it('debe retornar una respuesta paginada con estructura correcta', async () => {
    const response = await fetch('http://localhost/api/auditoria?page=1&pageSize=10');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: unknown[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    expect(body.data).toHaveLength(10);
    expect(body.total).toBe(22);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.totalPages).toBe(3);
  });
});

// ── GET /api/auditoria?accion= ────────────────────────────────────────────────

describe('GET /api/auditoria filtrado por accion', () => {
  it('debe filtrar por accion=crear y retornar solo entradas con esa acción', async () => {
    const response = await fetch('http://localhost/api/auditoria?accion=crear&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: { accion: string }[];
      total: number;
    };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.accion).toBe('crear');
    }
  });

  it('debe filtrar por accion=login y retornar solo entradas de inicio de sesión', async () => {
    const response = await fetch('http://localhost/api/auditoria?accion=login&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { accion: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.accion).toBe('login');
    }
  });

  it('debe retornar data vacía cuando la acción no tiene entradas', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?accion=accion-inexistente&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/auditoria?modulo= ────────────────────────────────────────────────

describe('GET /api/auditoria filtrado por modulo', () => {
  it('debe filtrar por modulo=usuarios y retornar solo entradas de ese módulo', async () => {
    const response = await fetch('http://localhost/api/auditoria?modulo=usuarios&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { modulo: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.modulo).toBe('usuarios');
    }
  });

  it('debe filtrar por modulo=auth y retornar entradas de login/logout', async () => {
    const response = await fetch('http://localhost/api/auditoria?modulo=auth&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { modulo: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.modulo).toBe('auth');
    }
  });
});

// ── GET /api/auditoria?usuarioId= ─────────────────────────────────────────────

describe('GET /api/auditoria filtrado por usuarioId', () => {
  it('debe filtrar por usuarioId=usr-001 y retornar solo entradas de ese usuario', async () => {
    const response = await fetch('http://localhost/api/auditoria?usuarioId=usr-001&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { usuarioId: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.usuarioId).toBe('usr-001');
    }
  });

  it('debe retornar data vacía para un usuarioId inexistente', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?usuarioId=usr-inexistente-999&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/auditoria?fechaDesde= ────────────────────────────────────────────

describe('GET /api/auditoria filtrado por fechaDesde', () => {
  it('debe filtrar por fechaDesde=2025-03-28 y retornar solo entradas desde esa fecha', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?fechaDesde=2025-03-28&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { fecha: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    const desde = new Date('2025-03-28').getTime();
    for (const entry of body.data) {
      expect(new Date(entry.fecha).getTime()).toBeGreaterThanOrEqual(desde);
    }
  });
});

// ── GET /api/auditoria?fechaHasta= ────────────────────────────────────────────

describe('GET /api/auditoria filtrado por fechaHasta', () => {
  it('debe filtrar por fechaHasta=2025-03-20 y retornar solo entradas hasta esa fecha', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?fechaHasta=2025-03-20&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { fecha: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    // fechaHasta incluye todo el día (hasta las 23:59:59.999)
    const hasta = new Date('2025-03-20').getTime() + 24 * 60 * 60 * 1000 - 1;
    for (const entry of body.data) {
      expect(new Date(entry.fecha).getTime()).toBeLessThanOrEqual(hasta);
    }
  });
});

// ── Filtros combinados ────────────────────────────────────────────────────────

describe('GET /api/auditoria con filtros combinados', () => {
  it('debe combinar modulo=usuarios y usuarioId=usr-001 correctamente', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?modulo=usuarios&usuarioId=usr-001&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: { modulo: string; usuarioId: string }[];
    };
    expect(body.data.length).toBeGreaterThan(0);
    for (const entry of body.data) {
      expect(entry.modulo).toBe('usuarios');
      expect(entry.usuarioId).toBe('usr-001');
    }
  });

  it('debe combinar accion=crear y fechaDesde=2025-03-20 correctamente', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?accion=crear&fechaDesde=2025-03-20&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: { accion: string; fecha: string }[];
    };
    expect(body.data.length).toBeGreaterThan(0);
    const desde = new Date('2025-03-20').getTime();
    for (const entry of body.data) {
      expect(entry.accion).toBe('crear');
      expect(new Date(entry.fecha).getTime()).toBeGreaterThanOrEqual(desde);
    }
  });

  it('debe combinar fechaDesde y fechaHasta para un rango de fechas acotado', async () => {
    const response = await fetch(
      'http://localhost/api/auditoria?fechaDesde=2025-03-25&fechaHasta=2025-03-30&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { fecha: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    const desde = new Date('2025-03-25').getTime();
    const hasta = new Date('2025-03-30').getTime() + 24 * 60 * 60 * 1000 - 1;
    for (const entry of body.data) {
      const t = new Date(entry.fecha).getTime();
      expect(t).toBeGreaterThanOrEqual(desde);
      expect(t).toBeLessThanOrEqual(hasta);
    }
  });

  it('debe retornar data vacía cuando los filtros combinados no tienen coincidencias', async () => {
    // accion=exportar en modulo=usuarios — no existen entradas con esa combinación
    const response = await fetch(
      'http://localhost/api/auditoria?accion=exportar&modulo=usuarios&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});
