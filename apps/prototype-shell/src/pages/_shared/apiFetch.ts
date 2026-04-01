// Helper para hacer fetch a los endpoints de MSW con tipado genérico.
// Todas las peticiones van a /api/* — MSW intercepta y responde en el browser.

/**
 * Realiza una petición HTTP con tipado genérico de respuesta.
 * Lanza un error si el servidor responde con un status no-ok.
 * Soporta AbortSignal para cancelación de peticiones en vuelo.
 *
 * @param url - URL del endpoint, ej. '/api/productos?page=1&pageSize=10'
 * @param options - Opciones adicionales de RequestInit (incluye signal para cancelación)
 * @returns La respuesta JSON deserializada como tipo T
 */
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
