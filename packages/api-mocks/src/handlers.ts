import { http, HttpResponse } from 'msw';

// Interfaz de respuesta del endpoint de salud
interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

// Handlers de MSW v2 para NGR Inventory API
// GET /api/health — verifica que la API está disponible
export const handlers = [
  http.get('/api/health', () => {
    const response: HealthResponse = {
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json(response, { status: 200 });
  }),
];
