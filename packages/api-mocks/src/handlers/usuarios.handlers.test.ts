import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { server } from '../server';

// Tests de integración para los handlers CRUD de usuarios
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// ── GET /api/usuarios ─────────────────────────────────────────────────────────

describe('GET /api/usuarios', () => {
  it('debe retornar todos los usuarios en una respuesta paginada', async () => {
    const response = await fetch('http://localhost/api/usuarios?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
  });

  it('debe filtrar por rolId=rol-001 y retornar solo usuarios de ese rol', async () => {
    const response = await fetch('http://localhost/api/usuarios?rolId=rol-001&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { rolId: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const u of body.data) {
      expect(u.rolId).toBe('rol-001');
    }
  });

  it('debe filtrar por activo=true y retornar solo usuarios activos', async () => {
    const response = await fetch('http://localhost/api/usuarios?activo=true&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { activo: boolean }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const u of body.data) {
      expect(u.activo).toBe(true);
    }
  });

  it('debe filtrar por activo=false y retornar solo usuarios inactivos', async () => {
    const response = await fetch('http://localhost/api/usuarios?activo=false&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { activo: boolean }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const u of body.data) {
      expect(u.activo).toBe(false);
    }
  });

  it('debe retornar data vacía cuando no hay coincidencias para los filtros', async () => {
    const response = await fetch(
      'http://localhost/api/usuarios?rolId=rol-inexistente-999&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/usuarios/:id ─────────────────────────────────────────────────────

describe('GET /api/usuarios/:id', () => {
  it('debe retornar el usuario completo cuando existe', async () => {
    const response = await fetch('http://localhost/api/usuarios/usr-001');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      id: string;
      email: string;
      nombre: string;
    };
    expect(body.id).toBe('usr-001');
    expect(body.email).toBe('admin@ngr.com');
    expect(body.nombre).toBe('Roberto');
  });

  it('debe retornar 404 cuando el usuario no existe', async () => {
    const response = await fetch('http://localhost/api/usuarios/usr-inexistente-999');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── POST /api/usuarios ────────────────────────────────────────────────────────

describe('POST /api/usuarios', () => {
  it('debe crear un nuevo usuario y retornar 201 con activo=true', async () => {
    const response = await fetch('http://localhost/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Nuevo',
        apellido: 'Empleado',
        email: 'nuevo.empleado@ngr.com',
        rolId: 'rol-003',
        rolNombre: 'Operario',
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      activo: boolean;
      nombre: string;
      email: string;
    };
    expect(body.activo).toBe(true);
    expect(body.nombre).toBe('Nuevo');
    expect(body.email).toBe('nuevo.empleado@ngr.com');
    expect(body.id).toBeTruthy();
  });

  it('debe aparecer en el GET de lista tras ser creado', async () => {
    const createResponse = await fetch('http://localhost/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Persistencia',
        apellido: 'Test',
        email: 'persistencia.test@ngr.com',
        rolId: 'rol-003',
        rolNombre: 'Operario',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const listResponse = await fetch('http://localhost/api/usuarios?pageSize=100');
    const listBody = (await listResponse.json()) as { data: { id: string }[] };
    const ids = listBody.data.map((u) => u.id);
    expect(ids).toContain(created.id);
  });
});

// ── PUT /api/usuarios/:id ─────────────────────────────────────────────────────

describe('PUT /api/usuarios/:id', () => {
  it('debe actualizar el usuario existente y retornar el registro actualizado', async () => {
    const response = await fetch('http://localhost/api/usuarios/usr-004', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Martín Editado' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; nombre: string };
    expect(body.id).toBe('usr-004');
    expect(body.nombre).toBe('Martín Editado');
  });

  it('debe retornar 404 cuando el usuario no existe', async () => {
    const response = await fetch('http://localhost/api/usuarios/usr-inexistente-999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'No importa' }),
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── PATCH /api/usuarios/:id/toggle-activo ─────────────────────────────────────

describe('PATCH /api/usuarios/:id/toggle-activo', () => {
  it('debe alternar activo de true a false para un usuario activo', async () => {
    // usr-001 está activo=true
    const response = await fetch('http://localhost/api/usuarios/usr-001/toggle-activo', {
      method: 'PATCH',
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; activo: boolean };
    expect(body.id).toBe('usr-001');
    expect(body.activo).toBe(false);
  });

  it('debe alternar activo de false a true para un usuario inactivo', async () => {
    // usr-006 está activo=false
    const response = await fetch('http://localhost/api/usuarios/usr-006/toggle-activo', {
      method: 'PATCH',
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; activo: boolean };
    expect(body.id).toBe('usr-006');
    expect(body.activo).toBe(true);
  });

  it('debe retornar 404 cuando el usuario no existe', async () => {
    const response = await fetch(
      'http://localhost/api/usuarios/usr-inexistente-999/toggle-activo',
      { method: 'PATCH' }
    );

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── DELETE /api/usuarios/:id ──────────────────────────────────────────────────

describe('DELETE /api/usuarios/:id', () => {
  it('debe eliminar el usuario existente y retornar 204', async () => {
    // Primero creamos un usuario para no afectar otros tests
    const createResponse = await fetch('http://localhost/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Para',
        apellido: 'Eliminar',
        email: 'para.eliminar@ngr.com',
        rolId: 'rol-003',
        rolNombre: 'Operario',
      }),
    });
    const created = (await createResponse.json()) as { id: string };

    const deleteResponse = await fetch(`http://localhost/api/usuarios/${created.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);
  });

  it('debe retornar 404 cuando el usuario no existe', async () => {
    const response = await fetch('http://localhost/api/usuarios/usr-inexistente-999', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});
