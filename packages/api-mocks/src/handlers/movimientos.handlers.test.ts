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

// Tests de integración para el handler POST crear movimiento
describe('POST /api/movimientos', () => {
  it('debe crear un movimiento en estado borrador y retornar 201', async () => {
    const response = await fetch('http://localhost/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'entrada',
        estado: 'borrador',
        items: [],
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as { estado: string; tipo: string };
    expect(body.estado).toBe('borrador');
    expect(body.tipo).toBe('entrada');
  });

  it('debe retornar 422 cuando el escenario es stock-insuficiente', async () => {
    const response = await fetch('http://localhost/api/movimientos?_scenario=stock-insuficiente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        estado: 'borrador',
        items: [],
      }),
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(422);
    expect(body.type).toBe('/errors/stock-insuficiente');
  });
});

// Tests de integración para el handler PATCH de transiciones de estado
describe('PATCH /api/movimientos/:id/estado', () => {
  it('debe transicionar de borrador a pendiente y retornar 200 con el movimiento actualizado', async () => {
    // mov-007 está en estado borrador
    const response = await fetch('http://localhost/api/movimientos/mov-007/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pendiente' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; estado: string };
    expect(body.id).toBe('mov-007');
    expect(body.estado).toBe('pendiente');
  });

  it('debe retornar 409 cuando la transición es inválida (ejecutado → borrador)', async () => {
    // mov-001 está en estado ejecutado (después del fix de fixtures)
    const response = await fetch('http://localhost/api/movimientos/mov-001/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'borrador' }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as {
      type: string;
      status: number;
      title: string;
    };
    expect(body.status).toBe(409);
    expect(body.type).toBe('/errors/conflict');
    expect(body.title).toBe('Transición de estado no válida');
  });

  it('debe retornar 409 cuando la transición es inválida (anulado → pendiente)', async () => {
    // mov-008 está en estado anulado
    const response = await fetch('http://localhost/api/movimientos/mov-008/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pendiente' }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(409);
    expect(body.type).toBe('/errors/conflict');
  });

  it('debe retornar 422 cuando el escenario es stock-insuficiente', async () => {
    const response = await fetch(
      'http://localhost/api/movimientos/mov-003/estado?_scenario=stock-insuficiente',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'ejecutado' }),
      }
    );

    expect(response.status).toBe(422);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(422);
    expect(body.type).toBe('/errors/stock-insuficiente');
  });

  it('debe retornar 404 cuando el movimiento no existe', async () => {
    const response = await fetch('http://localhost/api/movimientos/inexistente-999/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pendiente' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// Tests de integración para el handler GET lista de movimientos
describe('GET /api/movimientos', () => {
  it('debe filtrar por tipo=entrada y retornar solo movimientos de tipo entrada', async () => {
    const response = await fetch('http://localhost/api/movimientos?tipo=entrada&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { tipo: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const m of body.data) {
      expect(m.tipo).toBe('entrada');
    }
  });

  it('debe filtrar por estado=ejecutado y retornar solo movimientos ejecutados', async () => {
    const response = await fetch('http://localhost/api/movimientos?estado=ejecutado&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { estado: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const m of body.data) {
      expect(m.estado).toBe('ejecutado');
    }
  });

  it('debe filtrar por fechaDesde y excluir movimientos anteriores a esa fecha', async () => {
    const response = await fetch(
      'http://localhost/api/movimientos?fechaDesde=2025-02-15&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { createdAt: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const m of body.data) {
      expect(m.createdAt >= '2025-02-15').toBe(true);
    }
  });
});

// Verificación de que ningún fixture usa 'completado' como estado
describe('movimientoFixtures — corrección de estado', () => {
  it('ningún fixture debe tener estado completado', async () => {
    const response = await fetch('http://localhost/api/movimientos?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { estado: string }[] };
    const conCompletado = body.data.filter((m) => m.estado === 'completado');
    expect(conCompletado).toHaveLength(0);
  });

  it('los fixtures previamente completados deben tener estado ejecutado', async () => {
    const ids = ['mov-001', 'mov-002', 'mov-004', 'mov-006'];

    for (const id of ids) {
      const response = await fetch(`http://localhost/api/movimientos/${id}`);
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string; estado: string };
      expect(body.estado).toBe('ejecutado');
    }
  });
});
