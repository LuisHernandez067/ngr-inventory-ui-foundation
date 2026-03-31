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
});
