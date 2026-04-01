import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './server';

// Tests de integración para los handlers de MSW v2
// Verifican que los mocks responden correctamente usando el servidor Node de MSW
describe('api-mocks — handlers', () => {
  // Iniciar el servidor MSW antes de todos los tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  // Limpiar handlers sobreescritos entre tests
  afterEach(() => server.resetHandlers());
  // Cerrar el servidor al terminar
  afterAll(() => server.close());

  describe('GET /api/health', () => {
    it('debe retornar 200 con status "ok"', async () => {
      const response = await fetch('http://localhost/api/health');

      expect(response.status).toBe(200);

      const body = (await response.json()) as {
        status: string;
        version: string;
        timestamp: string;
      };
      expect(body.status).toBe('ok');
    });

    it('debe retornar el campo version', async () => {
      const response = await fetch('http://localhost/api/health');
      const body = (await response.json()) as {
        status: string;
        version: string;
        timestamp: string;
      };

      expect(body.version).toBeDefined();
      expect(typeof body.version).toBe('string');
    });

    it('debe retornar el campo timestamp como ISO string válido', async () => {
      const response = await fetch('http://localhost/api/health');
      const body = (await response.json()) as {
        status: string;
        version: string;
        timestamp: string;
      };

      expect(body.timestamp).toBeDefined();
      // Verificar que es un ISO date string válido
      const date = new Date(body.timestamp);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('debe retornar Content-Type application/json', async () => {
      const response = await fetch('http://localhost/api/health');
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  // Cobertura representativa de CRUD sobre el módulo productos
  describe('GET /api/productos', () => {
    it('debe retornar lista paginada con data y meta de paginación', async () => {
      const response = await fetch('http://localhost/api/productos?page=1&pageSize=5');
      expect(response.status).toBe(200);

      const body = (await response.json()) as {
        data: unknown[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
      };
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeLessThanOrEqual(5);
      expect(typeof body.total).toBe('number');
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(5);
      expect(typeof body.totalPages).toBe('number');
    });

    it('debe filtrar por búsqueda cuando se envía el param search', async () => {
      const response = await fetch('http://localhost/api/productos?search=tornillo');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: Array<{ nombre: string; codigo: string }> };
      // Todos los resultados deben contener "tornillo" en nombre o código
      body.data.forEach((p) => {
        const match =
          p.nombre.toLowerCase().includes('tornillo') ||
          p.codigo.toLowerCase().includes('tornillo');
        expect(match).toBe(true);
      });
    });

    it('debe retornar 404 cuando el escenario es error-404', async () => {
      const response = await fetch('http://localhost/api/productos?_scenario=error-404');
      expect(response.status).toBe(404);
      const body = (await response.json()) as { type: string; status: number };
      expect(body.status).toBe(404);
      expect(body.type).toBe('/errors/not-found');
    });

    it('debe retornar 500 cuando el escenario es error-500', async () => {
      const response = await fetch('http://localhost/api/productos?_scenario=error-500');
      expect(response.status).toBe(500);
      const body = (await response.json()) as { type: string; status: number };
      expect(body.status).toBe(500);
    });
  });

  describe('GET /api/productos/:id', () => {
    it('debe retornar 200 con el producto cuando existe', async () => {
      const response = await fetch('http://localhost/api/productos/prod-001');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string };
      expect(body.id).toBe('prod-001');
    });

    it('debe retornar 404 cuando el producto no existe', async () => {
      const response = await fetch('http://localhost/api/productos/inexistente-999');
      expect(response.status).toBe(404);
      const body = (await response.json()) as { status: number; type: string };
      expect(body.status).toBe(404);
      expect(body.type).toBe('/errors/not-found');
    });
  });

  describe('POST /api/productos', () => {
    it('debe crear un producto y retornar 201', async () => {
      const response = await fetch('http://localhost/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: 'TEST-001',
          nombre: 'Producto de prueba',
          categoriaId: 'cat-001',
          categoriaNombre: 'Ferretería',
          unidadMedida: 'unidad',
          precioUnitario: 100,
          stockMinimo: 5,
        }),
      });
      expect(response.status).toBe(201);
      const body = (await response.json()) as { id: string; nombre: string };
      expect(body.nombre).toBe('Producto de prueba');
      expect(body.id).toBeDefined();
    });

    it('debe retornar 422 cuando el escenario es error-422', async () => {
      const response = await fetch('http://localhost/api/productos?_scenario=error-422', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(422);
      const body = (await response.json()) as { type: string };
      expect(body.type).toBe('/errors/validation');
    });
  });

  describe('PUT /api/productos/:id', () => {
    it('debe actualizar el producto y retornar 200', async () => {
      const response = await fetch('http://localhost/api/productos/prod-001', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Nombre actualizado' }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string; nombre: string };
      expect(body.id).toBe('prod-001');
      expect(body.nombre).toBe('Nombre actualizado');
    });

    it('debe retornar 404 al actualizar un producto inexistente', async () => {
      const response = await fetch('http://localhost/api/productos/inexistente-999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'X' }),
      });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/productos/:id', () => {
    it('debe eliminar el producto y retornar 204', async () => {
      const response = await fetch('http://localhost/api/productos/prod-002', {
        method: 'DELETE',
      });
      expect(response.status).toBe(204);
    });

    it('debe retornar 404 al eliminar un producto inexistente', async () => {
      const response = await fetch('http://localhost/api/productos/inexistente-999', {
        method: 'DELETE',
      });
      expect(response.status).toBe(404);
    });
  });

  // Cobertura representativa del módulo auth
  describe('POST /api/auth/login', () => {
    it('debe retornar 200 con token para credenciales válidas', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@ngr.com', password: 'secret' }),
      });
      expect(response.status).toBe(200);
      const body = (await response.json()) as { token: string; user: unknown };
      expect(typeof body.token).toBe('string');
      expect(body.user).toBeDefined();
    });

    it('debe retornar 401 cuando el email contiene "invalid"', async () => {
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid@test.com', password: 'wrong' }),
      });
      expect(response.status).toBe(401);
      const body = (await response.json()) as { status: number; type: string };
      expect(body.status).toBe(401);
      expect(body.type).toBe('/errors/unauthorized');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe retornar el usuario autenticado mock', async () => {
      const response = await fetch('http://localhost/api/auth/me');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string; email: string; roles: string[] };
      expect(body.id).toBeDefined();
      expect(body.email).toBeDefined();
      expect(Array.isArray(body.roles)).toBe(true);
    });

    it('debe retornar 401 con escenario error-401', async () => {
      const response = await fetch('http://localhost/api/auth/me?_scenario=error-401');
      expect(response.status).toBe(401);
    });
  });

  // Cobertura representativa del módulo categorías (CRUD simplificado)
  describe('GET /api/categorias', () => {
    it('debe retornar lista paginada de categorías', async () => {
      const response = await fetch('http://localhost/api/categorias');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: unknown[]; total: number };
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.total).toBe('number');
    });
  });

  // Cobertura representativa del módulo stock
  describe('GET /api/stock', () => {
    it('debe retornar lista paginada de stock', async () => {
      const response = await fetch('http://localhost/api/stock');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: unknown[]; total: number };
      expect(Array.isArray(body.data)).toBe(true);
      expect(typeof body.total).toBe('number');
    });

    it('debe retornar 403 con escenario error-403', async () => {
      const response = await fetch('http://localhost/api/stock?_scenario=error-403');
      expect(response.status).toBe(403);
      const body = (await response.json()) as { type: string };
      expect(body.type).toBe('/errors/forbidden');
    });
  });
});
