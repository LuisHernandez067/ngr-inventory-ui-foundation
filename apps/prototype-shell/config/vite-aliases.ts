// Helper compartido de aliases Vite — reutilizado en vite.config.ts y Storybook viteFinal
// Centraliza las rutas para evitar duplicación entre configuraciones
import { resolve } from 'path';

/**
 * Retorna el mapa de aliases de rutas para Vite/Storybook.
 * @param root - Directorio raíz desde donde resolver las rutas (normalmente __dirname del config)
 */
export function getViteAliases(root: string): Record<string, string> {
  return {
    '@tokens': resolve(root, '../../packages/design-tokens/src'),
    '@theme': resolve(root, '../../packages/bootstrap-theme/src'),
  };
}

/**
 * Retorna las opciones del preprocesador SCSS con silenceDeprecations aplicado.
 * Requerido para suprimir warnings de @import de Bootstrap hasta migrar a @use.
 * @param root - Directorio raíz para resolver node_modules
 */
export function getScssOptions(root: string): Record<string, unknown> {
  return {
    scss: {
      silenceDeprecations: ['import'],
      loadPaths: [resolve(root, '../../node_modules')],
    },
  };
}
