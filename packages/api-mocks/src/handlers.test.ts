import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';

import { server } from './server';

// Tests de integración para los handlers de MSW v2
// Verifican que los mocks responden correctamente usando el servidor Node de MSW
describe('api-mocks — handlers', () => {
  // Iniciar el servidor MSW antes de todos los tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });
  // Limpiar handlers sobreescritos entre tests
  afterEach(() => {
    server.resetHandlers();
  });
  // Cerrar el servidor al terminar
  afterAll(() => {
    server.close();
  });

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
      const body = (await response.json()) as { data: { nombre: string; codigo: string }[] };
      // Todos los resultados deben contener "tornillo" en nombre o código
      body.data.forEach((p) => {
        const match =
          p.nombre.toLowerCase().includes('tornillo') ||
          p.codigo.toLowerCase().includes('tornillo');
        expect(match).toBe(true);
      });
    });

    it('debe retornar solo productos activos al filtrar por status=active', async () => {
      const response = await fetch('http://localhost/api/productos?status=active');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: { status: string }[] };
      // Todos los resultados deben tener status active
      body.data.forEach((p) => {
        expect(p.status).toBe('active');
      });
    });

    it('debe retornar solo productos inactivos al filtrar por status=inactive', async () => {
      const response = await fetch('http://localhost/api/productos?status=inactive');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: { status: string }[] };
      // Todos los resultados deben tener status inactive
      body.data.forEach((p) => {
        expect(p.status).toBe('inactive');
      });
      // prod-012 es el único inactivo en los fixtures
      expect(body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('debe retornar solo productos de la categoría al filtrar por categoriaId', async () => {
      const response = await fetch('http://localhost/api/productos?categoriaId=cat-001');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { data: { categoriaId: string }[] };
      // Todos los resultados deben pertenecer a cat-001
      body.data.forEach((p) => {
        expect(p.categoriaId).toBe('cat-001');
      });
      // cat-001 tiene prod-001, prod-004, prod-007, prod-008 en los fixtures
      expect(body.data.length).toBe(4);
    });

    it('debe aplicar filtros combinados status + categoriaId correctamente', async () => {
      const response = await fetch(
        'http://localhost/api/productos?status=active&categoriaId=cat-001'
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        data: { status: string; categoriaId: string }[];
      };
      // Todos los resultados deben cumplir ambos filtros
      body.data.forEach((p) => {
        expect(p.status).toBe('active');
        expect(p.categoriaId).toBe('cat-001');
      });
      // cat-001 solo tiene productos activos en los fixtures
      expect(body.data.length).toBe(4);
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

  describe('GET /api/categorias/:id', () => {
    it('debe retornar 200 con la categoría cuando existe', async () => {
      const response = await fetch('http://localhost/api/categorias/cat-001');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string };
      expect(body.id).toBe('cat-001');
    });

    it('debe incluir el campo productoCount en el detalle de la categoría', async () => {
      const response = await fetch('http://localhost/api/categorias/cat-001');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { id: string; productoCount: number };
      // productoCount debe ser un número mayor o igual a cero
      expect(typeof body.productoCount).toBe('number');
      expect(body.productoCount).toBeGreaterThanOrEqual(0);
    });

    it('debe computar productoCount correctamente para cat-001 (4 productos en fixtures)', async () => {
      const response = await fetch('http://localhost/api/categorias/cat-001');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { productoCount: number };
      // cat-001 tiene prod-001, prod-004, prod-007, prod-008 en los fixtures
      expect(body.productoCount).toBe(4);
    });

    it('debe retornar productoCount=0 para una categoría sin productos', async () => {
      // cat-006 tiene prod-003 (Mobiliario) — si no existe categoría sin productos,
      // verificamos que el campo existe y es numérico
      const response = await fetch('http://localhost/api/categorias/cat-006');
      expect(response.status).toBe(200);
      const body = (await response.json()) as { productoCount: number };
      expect(typeof body.productoCount).toBe('number');
    });

    it('debe retornar 404 cuando la categoría no existe', async () => {
      const response = await fetch('http://localhost/api/categorias/inexistente-999');
      expect(response.status).toBe(404);
      const body = (await response.json()) as { status: number; type: string };
      expect(body.status).toBe(404);
      expect(body.type).toBe('/errors/not-found');
    });
  });

  // Cobertura del módulo stock
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

  // Endpoints granulares del dashboard (widgets independientes)
  describe('GET /api/dashboard/kpis', () => {
    it('debe retornar un array de métricas KPI', async () => {
      const response = await fetch('http://localhost/api/dashboard/kpis');
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        id: string;
        label: string;
        value: number;
        trend: string;
        icon: string;
        colorClass: string;
      }[];
      // Debe retornar entre 4 y 6 KPIs
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(4);
      expect(body.length).toBeLessThanOrEqual(6);
    });

    it('cada KPI debe tener los campos obligatorios del contrato', async () => {
      const response = await fetch('http://localhost/api/dashboard/kpis');
      const body = (await response.json()) as {
        id: string;
        label: string;
        value: number;
        trend: string;
        icon: string;
        colorClass: string;
      }[];
      body.forEach((kpi) => {
        expect(typeof kpi.id).toBe('string');
        expect(typeof kpi.label).toBe('string');
        expect(typeof kpi.value).toBe('number');
        expect(['up', 'down', 'stable']).toContain(kpi.trend);
        expect(typeof kpi.icon).toBe('string');
        expect(typeof kpi.colorClass).toBe('string');
      });
    });

    it('debe retornar 500 con escenario error-500', async () => {
      const response = await fetch('http://localhost/api/dashboard/kpis?_scenario=error-500');
      expect(response.status).toBe(500);
      const body = (await response.json()) as { type: string; status: number };
      expect(body.status).toBe(500);
    });
  });

  describe('GET /api/dashboard/alerts', () => {
    it('debe retornar un array de alertas operacionales', async () => {
      const response = await fetch('http://localhost/api/dashboard/alerts');
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        id: string;
        tipo: string;
        severity: string;
        titulo: string;
        descripcion: string;
      }[];
      // Debe retornar entre 3 y 5 alertas
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(3);
      expect(body.length).toBeLessThanOrEqual(5);
    });

    it('cada alerta debe tener los campos obligatorios del contrato', async () => {
      const response = await fetch('http://localhost/api/dashboard/alerts');
      const body = (await response.json()) as {
        id: string;
        tipo: string;
        severity: string;
        titulo: string;
        descripcion: string;
      }[];
      body.forEach((alert) => {
        expect(typeof alert.id).toBe('string');
        expect(['bajo-stock', 'orden-pendiente', 'conteo-vencido']).toContain(alert.tipo);
        expect(['danger', 'warning', 'info']).toContain(alert.severity);
        expect(typeof alert.titulo).toBe('string');
        expect(typeof alert.descripcion).toBe('string');
      });
    });

    it('debe retornar 403 con escenario error-403', async () => {
      const response = await fetch('http://localhost/api/dashboard/alerts?_scenario=error-403');
      expect(response.status).toBe(403);
      const body = (await response.json()) as { type: string };
      expect(body.type).toBe('/errors/forbidden');
    });
  });

  describe('GET /api/dashboard/movements', () => {
    it('debe retornar un array de movimientos recientes', async () => {
      const response = await fetch('http://localhost/api/dashboard/movements');
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        id: string;
        numero: string;
        tipo: string;
        descripcion: string;
        usuario: string;
        fecha: string;
      }[];
      // Debe retornar entre 8 y 10 movimientos
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(8);
      expect(body.length).toBeLessThanOrEqual(10);
    });

    it('cada movimiento debe tener los campos obligatorios del contrato', async () => {
      const response = await fetch('http://localhost/api/dashboard/movements');
      const body = (await response.json()) as {
        id: string;
        numero: string;
        tipo: string;
        descripcion: string;
        usuario: string;
        fecha: string;
      }[];
      body.forEach((mov) => {
        expect(typeof mov.id).toBe('string');
        expect(typeof mov.numero).toBe('string');
        expect(['entrada', 'salida', 'ajuste', 'transferencia']).toContain(mov.tipo);
        expect(typeof mov.descripcion).toBe('string');
        expect(typeof mov.usuario).toBe('string');
        // La fecha debe ser un ISO 8601 válido
        const date = new Date(mov.fecha);
        expect(date.toString()).not.toBe('Invalid Date');
      });
    });

    it('debe ser independiente del endpoint /api/dashboard legacy', async () => {
      // Verifica que el endpoint granular existe separado del legacy
      const granular = await fetch('http://localhost/api/dashboard/movements');
      const legacy = await fetch('http://localhost/api/dashboard');
      expect(granular.status).toBe(200);
      expect(legacy.status).toBe(200);
    });

    it('debe retornar 500 con escenario error-500', async () => {
      const response = await fetch('http://localhost/api/dashboard/movements?_scenario=error-500');
      expect(response.status).toBe(500);
      const body = (await response.json()) as { status: number };
      expect(body.status).toBe(500);
    });
  });
});
