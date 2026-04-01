import { describe, it, expect, vi, beforeEach } from 'vitest';

import { apiFetch, ApiError } from './apiFetch';

// Tests unitarios para apiFetch y ApiError
// Se mockea fetch globalmente para controlar las respuestas

describe('ApiError', () => {
  it('debe construirse con status y body correctos', () => {
    const err = new ApiError(422, { message: 'invalid' });
    expect(err.status).toBe(422);
    expect(err.body).toEqual({ message: 'invalid' });
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('HTTP 422');
  });

  it('debe ser instancia de Error', () => {
    const err = new ApiError(404, null);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });
});

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('debe retornar el body JSON en respuesta ok', async () => {
    const data = { id: 1, nombre: 'Test' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(data),
      })
    );

    const result = await apiFetch<typeof data>('/api/test');
    expect(result).toEqual(data);
  });

  it('debe lanzar ApiError con status y body cuando la respuesta no es ok', async () => {
    const errorBody = { type: '/errors/validation', status: 422, fields: { nombre: 'Requerido' } };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve(errorBody),
      })
    );

    await expect(apiFetch('/api/test')).rejects.toThrow(ApiError);
    try {
      await apiFetch('/api/test');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.body).toEqual(errorBody);
    }
  });

  it('debe lanzar ApiError con body=null cuando el cuerpo de error no es JSON válido', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new SyntaxError('not json')),
      })
    );

    await expect(apiFetch('/api/test')).rejects.toThrow(ApiError);
    try {
      await apiFetch('/api/test');
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(500);
      expect(apiErr.body).toBeNull();
    }
  });

  it('debe incluir Content-Type: application/json en los headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/test');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('debe usar GET como método por defecto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/test');

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('GET');
  });

  it('debe serializar body como JSON cuando se especifica method y body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const payload = { nombre: 'Nuevo', codigo: 'X-001' };
    await apiFetch('/api/productos', { method: 'POST', body: payload });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(payload));
  });

  it('debe pasar el signal de AbortController a fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    const controller = new AbortController();
    await apiFetch('/api/test', { signal: controller.signal });

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  it('debe funcionar sin opciones (compatibilidad con callers existentes)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })
    );

    const result = await apiFetch<{ ok: boolean }>('/api/health');
    expect(result.ok).toBe(true);
  });
});
