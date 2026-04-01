import type { HttpResponseResolver } from 'msw';

/** Latencia por defecto en milisegundos para simular red */
const DEFAULT_DELAY_MS = 300;

/**
 * Envuelve un resolver de MSW con un retraso artificial para simular latencia de red.
 * Por defecto usa 300ms. Se puede ajustar por handler.
 */
export function withLatency(
  resolver: HttpResponseResolver,
  ms: number = DEFAULT_DELAY_MS
): HttpResponseResolver {
  return async (args) => {
    await new Promise<void>((resolve) => setTimeout(resolve, ms));
    return resolver(args);
  };
}
