// Helper para hacer fetch a los endpoints de MSW con tipado genérico.
// Todas las peticiones van a /api/* — MSW intercepta y responde en el browser.

/**
 * Error estructurado que incluye el status HTTP y el cuerpo de la respuesta.
 * Se lanza cuando el servidor responde con un status no-ok (>= 400).
 * Permite a los consumidores acceder al body parseado (ej. errores de validación 422).
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`HTTP ${String(status)}`);
    this.name = 'ApiError';
  }
}

/**
 * Opciones adicionales para la petición HTTP.
 * Extiende RequestInit con campos tipados para method y body.
 */
export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Método HTTP — por defecto 'GET' */
  method?: string;
  /** Cuerpo de la petición — se serializa a JSON automáticamente */
  body?: unknown;
}

/**
 * Realiza una petición HTTP con tipado genérico de respuesta.
 * Lanza ApiError si el servidor responde con un status no-ok.
 * Soporta AbortSignal para cancelación de peticiones en vuelo.
 *
 * @param url - URL del endpoint, ej. '/api/productos?page=1&pageSize=10'
 * @param options - Opciones adicionales: method, body, signal, headers, etc.
 * @returns La respuesta JSON deserializada como tipo T
 */
export async function apiFetch<T>(url: string, options?: ApiFetchOptions): Promise<T> {
  const { body, method = 'GET', ...rest } = options ?? {};

  const response = await fetch(url, {
    ...rest,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers instanceof Headers
        ? Object.fromEntries(rest.headers.entries())
        : ((rest.headers as Record<string, string> | undefined) ?? {})),
    },
    // Serializar body solo si está presente
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    // Intentar parsear el cuerpo del error como JSON (best-effort)
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      // Si no es JSON válido, se deja null
    }
    throw new ApiError(response.status, errorBody);
  }

  return response.json() as Promise<T>;
}
