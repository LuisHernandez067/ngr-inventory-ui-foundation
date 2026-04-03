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

// ── GET /api/roles ─────────────────────────────────────────────────────────────

describe('GET /api/roles', () => {
  it('debe retornar todos los roles en una respuesta paginada', async () => {
    const response = await fetch('http://localhost/api/roles?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[]; total: number };
    expect(body.data.length).toBeGreaterThan(0);
    expect(typeof body.total).toBe('number');
  });

  it('debe incluir al menos los roles base del sistema', async () => {
    const response = await fetch('http://localhost/api/roles?pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { nombre: string }[] };
    const nombres = body.data.map((r) => r.nombre);
    expect(nombres).toContain('Administrador');
  });

  it('debe filtrar por búsqueda de nombre', async () => {
    const response = await fetch('http://localhost/api/roles?search=admin&pageSize=100');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: { nombre: string }[] };
    expect(body.data.length).toBeGreaterThan(0);
    for (const rol of body.data) {
      expect(rol.nombre.toLowerCase()).toContain('admin');
    }
  });

  it('debe retornar data vacía cuando la búsqueda no tiene coincidencias', async () => {
    const response = await fetch(
      'http://localhost/api/roles?search=nombre-que-no-existe-jxyz&pageSize=100'
    );
    expect(response.status).toBe(200);

    const body = (await response.json()) as { data: unknown[] };
    expect(body.data).toHaveLength(0);
  });
});

// ── GET /api/roles/:id ────────────────────────────────────────────────────────

describe('GET /api/roles/:id', () => {
  it('debe retornar el rol completo con sus permisos cuando existe', async () => {
    const response = await fetch('http://localhost/api/roles/rol-001');
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      id: string;
      nombre: string;
      esAdmin: boolean;
      permisos: { id: string; clave: string }[];
    };
    expect(body.id).toBe('rol-001');
    expect(body.nombre).toBe('Administrador');
    expect(body.esAdmin).toBe(true);
    expect(Array.isArray(body.permisos)).toBe(true);
    expect(body.permisos.length).toBeGreaterThan(0);
  });

  it('debe retornar 404 cuando el rol no existe', async () => {
    const response = await fetch('http://localhost/api/roles/rol-inexistente-999');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── POST /api/roles ───────────────────────────────────────────────────────────

describe('POST /api/roles', () => {
  it('debe crear un nuevo rol y retornar 201', async () => {
    const response = await fetch('http://localhost/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Auditor',
        descripcion: 'Acceso de solo lectura con permisos de auditoría',
        permisos: [],
        esAdmin: false,
      }),
    });

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      id: string;
      nombre: string;
      esAdmin: boolean;
      permisos: unknown[];
    };
    expect(body.id).toBeTruthy();
    expect(body.nombre).toBe('Auditor');
    expect(body.esAdmin).toBe(false);
    expect(Array.isArray(body.permisos)).toBe(true);
  });

  it('debe aparecer en el GET de lista tras ser creado', async () => {
    const createResponse = await fetch('http://localhost/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Rol Persistencia Test',
        permisos: [],
        esAdmin: false,
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const listResponse = await fetch('http://localhost/api/roles?pageSize=100');
    const listBody = (await listResponse.json()) as { data: { id: string }[] };
    const ids = listBody.data.map((r) => r.id);
    expect(ids).toContain(created.id);
  });
});

// ── PUT /api/roles/:id ────────────────────────────────────────────────────────

describe('PUT /api/roles/:id', () => {
  it('debe actualizar el nombre del rol y retornar 200', async () => {
    const response = await fetch('http://localhost/api/roles/rol-003', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Operario Actualizado' }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { id: string; nombre: string };
    expect(body.id).toBe('rol-003');
    expect(body.nombre).toBe('Operario Actualizado');
  });

  it('debe retornar 404 cuando el rol no existe', async () => {
    const response = await fetch('http://localhost/api/roles/rol-inexistente-999', {
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

// ── DELETE /api/roles/:id ─────────────────────────────────────────────────────

describe('DELETE /api/roles/:id', () => {
  it('debe eliminar un rol creado previamente y retornar 204', async () => {
    // Crear un rol temporal para eliminar sin afectar los fixtures base
    const createResponse = await fetch('http://localhost/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Rol Para Eliminar',
        permisos: [],
        esAdmin: false,
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()) as { id: string };

    const deleteResponse = await fetch(`http://localhost/api/roles/${created.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(204);
  });

  it('debe retornar 404 cuando el rol no existe', async () => {
    const response = await fetch('http://localhost/api/roles/rol-inexistente-999', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});

// ── GET /api/permisos ─────────────────────────────────────────────────────────

describe('GET /api/permisos', () => {
  it('debe retornar el catálogo completo de permisos del sistema', async () => {
    const response = await fetch('http://localhost/api/permisos');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { id: string; clave: string; modulo: string }[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const first = body.at(0);
    expect(first).toBeDefined();
    if (first) {
      expect(first.id).toBeTruthy();
      expect(first.clave).toBeTruthy();
      expect(first.modulo).toBeTruthy();
    }
  });
});

// ── GET /api/roles/:id/permisos ───────────────────────────────────────────────

describe('GET /api/roles/:id/permisos', () => {
  it('debe retornar los permisos efectivos del rol administrador', async () => {
    const response = await fetch('http://localhost/api/roles/rol-001/permisos');
    expect(response.status).toBe(200);

    const body = (await response.json()) as { userId: string; permisos: string[] };
    expect(body.userId).toBe('rol-001');
    expect(Array.isArray(body.permisos)).toBe(true);
    expect(body.permisos.length).toBeGreaterThan(0);
    // El administrador debe tener el permiso de exportar reportes
    expect(body.permisos).toContain('reportes.exportar');
  });

  it('debe retornar 404 cuando el rol no existe', async () => {
    const response = await fetch('http://localhost/api/roles/rol-inexistente-999/permisos');
    expect(response.status).toBe(404);

    const body = (await response.json()) as { type: string; status: number };
    expect(body.status).toBe(404);
    expect(body.type).toBe('/errors/not-found');
  });
});
