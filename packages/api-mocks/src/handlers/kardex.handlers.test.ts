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

// ── GET /api/kardex ───────────────────────────────────────────────────────────

describe('GET /api/kardex', () => {
  it('debe retornar movimientos del kardex para un productoId válido', async () => {
    const response = await fetch('http://localhost/api/kardex?productoId=prod-001&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: { productoId: string }[];
      total: number;
    };
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
    // Todos los registros deben corresponder al productoId solicitado
    for (const entry of body.data) {
      expect(entry.productoId).toBe('prod-001');
    }
  });

  it('debe retornar una respuesta paginada con estructura correcta', async () => {
    const response = await fetch(
      'http://localhost/api/kardex?productoId=prod-001&page=1&pageSize=5'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: unknown[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    expect(body.data.length).toBeLessThanOrEqual(5);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(5);
    expect(typeof body.totalPages).toBe('number');
  });

  it('debe retornar lista vacía cuando no se provee productoId', async () => {
    const response = await fetch('http://localhost/api/kardex?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  it('debe retornar lista vacía cuando el productoId no tiene movimientos registrados', async () => {
    const response = await fetch(
      'http://localhost/api/kardex?productoId=prod-inexistente-999&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  it('debe incluir los campos de kardex requeridos en cada entrada', async () => {
    const response = await fetch('http://localhost/api/kardex?productoId=prod-001&pageSize=5');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: {
        id: string;
        fecha: string;
        productoId: string;
        almacenId: string;
        tipo: string;
        cantidadEntrada: number;
        cantidadSalida: number;
        saldoActual: number;
      }[];
    };
    expect(body.data.length).toBeGreaterThan(0);

    const entry = body.data.at(0);
    expect(entry).toBeDefined();
    if (entry) {
      expect(entry.id).toBeTruthy();
      expect(entry.fecha).toBeTruthy();
      expect(entry.productoId).toBe('prod-001');
      expect(entry.almacenId).toBeTruthy();
      expect(entry.tipo).toBeTruthy();
      expect(typeof entry.cantidadEntrada).toBe('number');
      expect(typeof entry.cantidadSalida).toBe('number');
      expect(typeof entry.saldoActual).toBe('number');
    }
  });

  it('debe soportar paginación retornando diferentes páginas de resultados', async () => {
    // Primera página con pageSize=3
    const page1Response = await fetch(
      'http://localhost/api/kardex?productoId=prod-001&page=1&pageSize=3'
    );
    expect(page1Response.status).toBe(200);
    const page1Body = (await page1Response.json()) as { data: { id: string }[] };
    expect(page1Body.data).toHaveLength(3);

    // Segunda página con pageSize=3
    const page2Response = await fetch(
      'http://localhost/api/kardex?productoId=prod-001&page=2&pageSize=3'
    );
    expect(page2Response.status).toBe(200);
    const page2Body = (await page2Response.json()) as { data: { id: string }[] };
    expect(page2Body.data.length).toBeGreaterThan(0);

    // Los IDs de ambas páginas no deben repetirse
    const ids1 = page1Body.data.map((e) => e.id);
    const ids2 = page2Body.data.map((e) => e.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});
