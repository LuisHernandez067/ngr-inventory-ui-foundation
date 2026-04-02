import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '../server';

// Integration tests for conteos handlers using the shared MSW server.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// ── GET /api/conteos ──────────────────────────────────────────────────────────

describe('GET /api/conteos', () => {
  it('debe retornar todos los conteos en una respuesta paginada', async () => {
    const response = await fetch('http://localhost/api/conteos?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
  });

  it('debe filtrar por estado=planificado y retornar solo conteos planificados', async () => {
    const response = await fetch('http://localhost/api/conteos?estado=planificado&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { estado: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const c of body.data) {
      expect(c.estado).toBe('planificado');
    }
  });

  it('debe filtrar por almacenId=alm-001 y retornar solo conteos de ese almacén', async () => {
    const response = await fetch('http://localhost/api/conteos?almacenId=alm-001&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { almacenId: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const c of body.data) {
      expect(c.almacenId).toBe('alm-001');
    }
  });

  it('debe filtrar por estado y almacenId combinados', async () => {
    const response = await fetch(
      'http://localhost/api/conteos?estado=completado&almacenId=alm-001&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { estado: string; almacenId: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const c of body.data) {
      expect(c.estado).toBe('completado');
      expect(c.almacenId).toBe('alm-001');
    }
  });

  it('debe retornar data vacía cuando no hay coincidencias para los filtros', async () => {
    const response = await fetch(
      'http://localhost/api/conteos?estado=planificado&almacenId=alm-inexistente&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/conteos/:id ──────────────────────────────────────────────────────

describe('GET /api/conteos/:id', () => {
  it('debe retornar el conteo completo con sus ítems cuando existe', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-001');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { id: string; numero: string; items: unknown[] };
    expect(body.id).toBe('cnt-001');
    expect(body.numero).toBe('CNT-2025-0001');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('debe retornar 404 cuando el conteo no existe', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-inexistente-999');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── POST /api/conteos ─────────────────────────────────────────────────────────

describe('POST /api/conteos', () => {
  it('debe crear un nuevo conteo en estado planificado y retornar 201', async () => {
    const response = await fetch('http://localhost/api/conteos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: 'Conteo de prueba',
        almacenId: 'alm-001',
        almacenNombre: 'Depósito Central',
        items: [],
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      estado: string;
      descripcion: string;
      almacenId: string;
    };
    expect(body.estado).toBe('planificado');
    expect(body.descripcion).toBe('Conteo de prueba');
    expect(body.almacenId).toBe('alm-001');
    expect(body.id).toBeTruthy();
  });

  it('debe aparecer en el GET de lista tras ser creado', async () => {
    const createResponse = await fetch('http://localhost/api/conteos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: 'Conteo para verificar persistencia',
        almacenId: 'alm-002',
        almacenNombre: 'Almacén Norte',
        items: [],
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const listResponse = await fetch('http://localhost/api/conteos?pageSize=100');
    const listBody = (await listResponse.json()) as { data: { id: string }[] };
    const ids = listBody.data.map((c) => c.id);
    expect(ids).toContain(created.id);
  });
});

// ── PATCH /api/conteos/:id/estado ────────────────────────────────────────────

describe('PATCH /api/conteos/:id/estado', () => {
  it('debe transicionar cnt-003 (planificado) a en_curso y retornar 200', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-003/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; estado: string };
    expect(body.id).toBe('cnt-003');
    expect(body.estado).toBe('en_curso');
  });

  it('debe transicionar cnt-002 (en_curso) a pausado y retornar 200', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-002/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'pausado' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; estado: string };
    expect(body.id).toBe('cnt-002');
    expect(body.estado).toBe('pausado');
  });

  it('debe transicionar cnt-005 (pausado) de vuelta a en_curso', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-005/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; estado: string };
    expect(body.estado).toBe('en_curso');
  });

  it('debe retornar 409 cuando la transición no está permitida (completado → en_curso)', async () => {
    // cnt-001 está en estado completado
    const response = await fetch('http://localhost/api/conteos/cnt-001/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { type: string; status: number; title: string };
    expect(body.status).toBe(409);
    expect(body.type).toBe('/errors/conflict');
    expect(body.title).toBe('Transición de estado no válida');
  });

  it('debe retornar 409 cuando la transición no está permitida (anulado → en_curso)', async () => {
    // cnt-004 está en estado anulado
    const response = await fetch('http://localhost/api/conteos/cnt-004/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(409);
    expect(body.type).toBe('/errors/conflict');
  });

  it('debe retornar 422 al intentar completar un conteo con ítems sin cantidadContada', async () => {
    // cnt-003 está en planificado, transicionamos a en_curso primero
    await fetch('http://localhost/api/conteos/cnt-003/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    // Ahora intentamos completar con ítems sin cantidadContada
    const response = await fetch('http://localhost/api/conteos/cnt-003/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'completado' }),
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(422);
    expect(body.type).toBe('/errors/validation');
  });

  it('debe retornar 404 cuando el conteo no existe', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-inexistente/estado', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'en_curso' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── PATCH /api/conteos/:id/items ─────────────────────────────────────────────

describe('PATCH /api/conteos/:id/items', () => {
  it('debe actualizar cantidadContada y recalcular diferencia para cnt-002', async () => {
    const itemsDto = [
      { id: 'cnt-002-1', cantidadContada: 8 },
      { id: 'cnt-002-2', cantidadContada: 5 },
    ];

    const response = await fetch('http://localhost/api/conteos/cnt-002/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsDto }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      id: string;
      items: { id: string; cantidadContada: number; diferencia: number }[];
    };
    expect(body.id).toBe('cnt-002');

    const item1 = body.items.find((i) => i.id === 'cnt-002-1');
    const item2 = body.items.find((i) => i.id === 'cnt-002-2');

    expect(item1?.cantidadContada).toBe(8);
    expect(item1?.diferencia).toBe(0); // 8 - 8 = 0

    expect(item2?.cantidadContada).toBe(5);
    expect(item2?.diferencia).toBe(-1); // 5 - 6 = -1
  });

  it('debe retornar 422 cuando alguna cantidadContada es negativa', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-002/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'cnt-002-1', cantidadContada: -5 }],
      }),
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(422);
    expect(body.type).toBe('/errors/validation');
  });

  it('debe retornar 404 cuando el conteo no existe', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-inexistente/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'item-1', cantidadContada: 10 }] }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });

  it('debe conservar la diferencia calculada: sobrante cuando cantidadContada > cantidadSistema', async () => {
    const itemsDto = [{ id: 'cnt-006-1', cantidadContada: 15 }]; // cantidadSistema = 10

    const response = await fetch('http://localhost/api/conteos/cnt-006/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsDto }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { items: { id: string; diferencia: number }[] };
    const item = body.items.find((i) => i.id === 'cnt-006-1');
    expect(item?.diferencia).toBe(5); // 15 - 10 = 5
  });
});

// ── POST /api/conteos/:id/cierre ─────────────────────────────────────────────

describe('POST /api/conteos/:id/cierre', () => {
  it('debe cerrar cnt-006 (completado con discrepancias) y retornar CierreConteoResult con ajuste', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-006/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: true }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      conteo: { id: string };
      movimientoAjusteId?: string;
      movimientoAjusteNumero?: string;
    };
    expect(body.conteo.id).toBe('cnt-006');
    expect(body.movimientoAjusteId).toBeTruthy();
    expect(body.movimientoAjusteNumero).toBeTruthy();
  });

  it('debe marcar los ítems con diferencia como ajustado:true después del cierre', async () => {
    await fetch('http://localhost/api/conteos/cnt-006/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: true }),
    });

    // Verificar que los ítems con diferencia quedaron ajustados
    const detailResponse = await fetch('http://localhost/api/conteos/cnt-006');
    const conteo = (await detailResponse.json()) as {
      items: { id: string; diferencia?: number; ajustado: boolean }[];
    };

    const itemConDiferencia = conteo.items.find((i) => i.id === 'cnt-006-1');
    expect(itemConDiferencia?.ajustado).toBe(true);
  });

  it('debe crear un movimiento de ajuste en el store de movimientos', async () => {
    await fetch('http://localhost/api/conteos/cnt-006/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: true }),
    });

    // Verificar que el movimiento aparece en la lista de movimientos
    const movResponse = await fetch('http://localhost/api/movimientos?tipo=ajuste&pageSize=100');
    const movBody = (await movResponse.json()) as {
      data: { tipo: string; id: string }[];
    };
    const ajustes = movBody.data.filter((m) => m.tipo === 'ajuste');
    expect(ajustes.length).toBeGreaterThan(0);
  });

  it('debe retornar 409 cuando el conteo no está en estado completado', async () => {
    // cnt-002 está en en_curso
    const response = await fetch('http://localhost/api/conteos/cnt-002/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: true }),
    });

    expect(response.status).toBe(409);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(409);
    expect(body.type).toBe('/errors/conflict');
  });

  it('debe retornar 404 cuando el conteo no existe', async () => {
    const response = await fetch('http://localhost/api/conteos/cnt-inexistente/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: true }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });

  it('no debe generar movimiento de ajuste si confirmarAjuste=false', async () => {
    // Contar ajustes antes
    const beforeResponse = await fetch('http://localhost/api/movimientos?tipo=ajuste&pageSize=100');
    const beforeBody = (await beforeResponse.json()) as { data: unknown[] };
    const countBefore = beforeBody.data.length;

    // Cerrar cnt-001 (ya está completado) sin confirmar ajuste
    await fetch('http://localhost/api/conteos/cnt-001/cierre', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmarAjuste: false }),
    });

    const afterResponse = await fetch('http://localhost/api/movimientos?tipo=ajuste&pageSize=100');
    const afterBody = (await afterResponse.json()) as { data: unknown[] };
    expect(afterBody.data.length).toBe(countBefore); // no aumentó
  });
});
