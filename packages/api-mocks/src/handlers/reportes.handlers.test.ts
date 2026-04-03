import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '../server';

// Ciclo de vida del servidor MSW compartido entre todos los describe de este archivo
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// ── GET /api/reportes ─────────────────────────────────────────────────────────

describe('GET /api/reportes', () => {
  it('should return the list of available report definitions', async () => {
    const response = await fetch('http://localhost/api/reportes?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: { id: string; tipo: string }[];
      total: number;
    };
    expect(body.data.length).toBeGreaterThanOrEqual(4);
    expect(typeof body.total).toBe('number');
  });

  it('should include at least the reports: stock_actual, kardex, movimientos, bajo_stock', async () => {
    const response = await fetch('http://localhost/api/reportes?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { tipo: string }[] };
    const tipos = body.data.map((r) => r.tipo);
    expect(tipos).toContain('stock_actual');
    expect(tipos).toContain('kardex');
    expect(tipos).toContain('movimientos');
    expect(tipos).toContain('bajo_stock');
  });

  it('should return a paginated response with correct structure', async () => {
    const response = await fetch('http://localhost/api/reportes?page=1&pageSize=3');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: unknown[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    expect(body.data).toHaveLength(3);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(3);
    expect(typeof body.totalPages).toBe('number');
  });
});

// ── GET /api/reportes/:id/datos ───────────────────────────────────────────────

describe('GET /api/reportes/:id/datos', () => {
  it('should return stock_actual report data (rep-001) with status 200', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-001/datos');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      reporteId: string;
      tipo: string;
      data: unknown[];
      total: number;
    };
    expect(body.reporteId).toBe('rep-001');
    expect(body.tipo).toBe('stock_actual');
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('should return movimientos report data (rep-003) filtered by tipoMovimiento', async () => {
    const response = await fetch(
      'http://localhost/api/reportes/rep-003/datos?tipoMovimiento=entrada'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      reporteId: string;
      tipo: string;
      data: { tipo: string }[];
      total: number;
    };
    expect(body.reporteId).toBe('rep-003');
    expect(body.tipo).toBe('movimientos');
    expect(body.data.length).toBeGreaterThan(0);
    for (const m of body.data) {
      expect(m.tipo).toBe('entrada');
    }
  });

  it('should return 400 when requesting kardex report without productoId', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-002/datos');
    expect(response.status).toBe(400);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(400);
    expect(body.type).toBe('/errors/bad-request');
  });

  it('should return kardex report data (rep-002) with a valid productoId', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-002/datos?productoId=prod-001');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      reporteId: string;
      tipo: string;
      data: unknown[];
      total: number;
    };
    expect(body.reporteId).toBe('rep-002');
    expect(body.tipo).toBe('kardex');
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('should return 404 when the report does not exist', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-inexistente-999/datos');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── POST /api/reportes/:id/exportar ───────────────────────────────────────────

describe('POST /api/reportes/:id/exportar', () => {
  it('should enqueue an export job and return 202 with jobId', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-001/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formato: 'pdf' }),
    });

    expect(response.status).toBe(202);
    const body = (await response.json()) as {
      id: string;
      reporteId: string;
      formato: string;
      estado: string;
    };
    expect(body.id).toBeTruthy();
    expect(body.reporteId).toBe('rep-001');
    expect(body.formato).toBe('pdf');
    expect(body.estado).toBe('pendiente');
  });

  it('should use pdf as default format when no format is specified', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-001/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(202);
    const body = (await response.json()) as { formato: string };
    expect(body.formato).toBe('pdf');
  });

  it('should return 404 when the report does not exist', async () => {
    const response = await fetch('http://localhost/api/reportes/rep-inexistente-999/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formato: 'pdf' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── GET /api/reportes/exportaciones/:jobId ────────────────────────────────────

describe('GET /api/reportes/exportaciones/:jobId', () => {
  it('should return the job status after creating it', async () => {
    // Crear el job primero
    const exportResponse = await fetch('http://localhost/api/reportes/rep-003/exportar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formato: 'xlsx' }),
    });
    expect(exportResponse.status).toBe(202);
    const job = (await exportResponse.json()) as { id: string };

    // Consultar el estado del job
    const statusResponse = await fetch(`http://localhost/api/reportes/exportaciones/${job.id}`);
    expect(statusResponse.status).toBe(200);

    const statusBody = (await statusResponse.json()) as {
      id: string;
      reporteId: string;
      estado: string;
    };
    expect(statusBody.id).toBe(job.id);
    expect(statusBody.reporteId).toBe('rep-003');
    expect(['pendiente', 'listo']).toContain(statusBody.estado);
  });

  it('should return 404 when the jobId does not exist', async () => {
    const response = await fetch('http://localhost/api/reportes/exportaciones/job-inexistente-999');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});
