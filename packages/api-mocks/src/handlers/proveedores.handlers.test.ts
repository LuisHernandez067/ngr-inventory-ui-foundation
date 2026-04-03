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

// ── GET /api/proveedores ───────────────────────────────────────────────────────

describe('GET /api/proveedores', () => {
  it('debe retornar todos los proveedores en una respuesta paginada', async () => {
    const response = await fetch('http://localhost/api/proveedores?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
  });

  it('debe retornar una respuesta paginada con estructura correcta', async () => {
    const response = await fetch('http://localhost/api/proveedores?page=1&pageSize=2');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      data: unknown[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
    expect(body.data).toHaveLength(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(2);
    expect(typeof body.totalPages).toBe('number');
  });

  it('debe filtrar por búsqueda de razón social', async () => {
    const response = await fetch('http://localhost/api/proveedores?search=tecno&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { razonSocial: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const p of body.data) {
      expect(p.razonSocial.toLowerCase()).toContain('tecno');
    }
  });

  it('debe filtrar por status=active y retornar solo proveedores activos', async () => {
    const response = await fetch('http://localhost/api/proveedores?status=active&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { status: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const p of body.data) {
      expect(p.status).toBe('active');
    }
  });

  it('debe filtrar por status=suspended y retornar solo proveedores suspendidos', async () => {
    const response = await fetch('http://localhost/api/proveedores?status=suspended&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { status: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const p of body.data) {
      expect(p.status).toBe('suspended');
    }
  });

  it('debe retornar data vacía cuando la búsqueda no tiene coincidencias', async () => {
    const response = await fetch(
      'http://localhost/api/proveedores?search=empresa-inexistente-xyzw&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/proveedores/:id ───────────────────────────────────────────────────

describe('GET /api/proveedores/:id', () => {
  it('debe retornar el proveedor completo cuando existe', async () => {
    const response = await fetch('http://localhost/api/proveedores/prov-001');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      id: string;
      codigo: string;
      razonSocial: string;
      ruc: string;
      status: string;
    };
    expect(body.id).toBe('prov-001');
    expect(body.codigo).toBe('TECK-SA');
    expect(body.razonSocial).toBe('Tecno Distribuciones S.A.');
    expect(body.ruc).toBe('30-71234567-8');
    expect(body.status).toBe('active');
  });

  it('debe retornar 404 cuando el proveedor no existe', async () => {
    const response = await fetch('http://localhost/api/proveedores/prov-inexistente-999');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── POST /api/proveedores ──────────────────────────────────────────────────────

describe('POST /api/proveedores', () => {
  it('debe crear un nuevo proveedor y retornar 201', async () => {
    const response = await fetch('http://localhost/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'NUEVO-PROV',
        razonSocial: 'Nuevo Proveedor Test S.A.',
        ruc: '30-12345678-9',
        email: 'contacto@nuevoprov.com.ar',
        status: 'active',
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      codigo: string;
      razonSocial: string;
      ruc: string;
      status: string;
    };
    expect(body.id).toBeTruthy();
    expect(body.codigo).toBe('NUEVO-PROV');
    expect(body.razonSocial).toBe('Nuevo Proveedor Test S.A.');
    expect(body.ruc).toBe('30-12345678-9');
    expect(body.status).toBe('active');
  });

  it('debe aparecer en el GET de lista tras ser creado', async () => {
    const createResponse = await fetch('http://localhost/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'PERSIST-TEST',
        razonSocial: 'Proveedor Persistencia Test',
        ruc: '30-99999999-9',
        status: 'active',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const listResponse = await fetch('http://localhost/api/proveedores?pageSize=100');
    const listBody = (await listResponse.json()) as { data: { id: string }[] };
    const ids = listBody.data.map((p) => p.id);
    expect(ids).toContain(created.id);
  });
});

// ── PUT /api/proveedores/:id ───────────────────────────────────────────────────

describe('PUT /api/proveedores/:id', () => {
  it('debe actualizar el proveedor existente y retornar el registro actualizado', async () => {
    const response = await fetch('http://localhost/api/proveedores/prov-002', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razonSocial: 'Informática del Norte Actualizada S.R.L.' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; razonSocial: string };
    expect(body.id).toBe('prov-002');
    expect(body.razonSocial).toBe('Informática del Norte Actualizada S.R.L.');
  });

  it('debe retornar 404 cuando el proveedor no existe', async () => {
    const response = await fetch('http://localhost/api/proveedores/prov-inexistente-999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razonSocial: 'No importa' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── DELETE /api/proveedores/:id ────────────────────────────────────────────────

describe('DELETE /api/proveedores/:id', () => {
  it('debe eliminar un proveedor creado previamente y retornar 204', async () => {
    // Crear un proveedor temporal para eliminar sin afectar los fixtures base
    const createResponse = await fetch('http://localhost/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: 'PARA-ELIMINAR',
        razonSocial: 'Proveedor Para Eliminar S.A.',
        ruc: '30-11111111-1',
        status: 'active',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const deleteResponse = await fetch(`http://localhost/api/proveedores/${created.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);
  });

  it('debe retornar 404 cuando el proveedor no existe', async () => {
    const response = await fetch('http://localhost/api/proveedores/prov-inexistente-999', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});
