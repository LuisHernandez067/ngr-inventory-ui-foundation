import { HttpResponse } from 'msw';
import type { ProblemDetails } from '@ngr-inventory/api-contracts';

/** Escenarios de error predefinidos para simular respuestas fallidas */
const SCENARIOS: Record<string, ProblemDetails & { _httpStatus: number }> = {
  'error-401': {
    type: '/errors/unauthorized',
    title: 'No autenticado',
    status: 401,
    detail: 'Se requiere autenticación para acceder a este recurso',
    _httpStatus: 401,
  },
  'error-403': {
    type: '/errors/forbidden',
    title: 'Acceso denegado',
    status: 403,
    detail: 'No tiene permisos suficientes para realizar esta operación',
    _httpStatus: 403,
  },
  'error-404': {
    type: '/errors/not-found',
    title: 'Recurso no encontrado',
    status: 404,
    detail: 'El recurso solicitado no existe o fue eliminado',
    _httpStatus: 404,
  },
  'error-409': {
    type: '/errors/conflict',
    title: 'Conflicto de datos',
    status: 409,
    detail: 'Ya existe un recurso con los mismos datos únicos',
    _httpStatus: 409,
  },
  'error-422': {
    type: '/errors/validation',
    title: 'Error de validación',
    status: 422,
    detail: 'Los datos enviados no cumplen con los requisitos de validación',
    _httpStatus: 422,
  },
  'error-500': {
    type: '/errors/server-error',
    title: 'Error interno del servidor',
    status: 500,
    detail: 'Ocurrió un error inesperado. Por favor intente nuevamente más tarde.',
    _httpStatus: 500,
  },
};

/**
 * Resuelve el escenario de error indicado por el parámetro _scenario.
 * Retorna una Response de MSW si corresponde, o null si no hay escenario aplicable.
 */
export function resolveScenario(scenario: string | null): Response | null {
  if (!scenario || !(scenario in SCENARIOS)) return null;
  const { _httpStatus, ...body } = SCENARIOS[scenario];
  return HttpResponse.json(body, { status: _httpStatus });
}
