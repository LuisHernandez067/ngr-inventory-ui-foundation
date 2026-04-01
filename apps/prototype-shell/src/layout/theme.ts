// Módulo de gestión de temas — lee/escribe localStorage y actualiza html[data-bs-theme]

/** Temas disponibles en el sistema */
export type Theme = 'light' | 'dark' | 'warm' | 'cold';

/** Lista ordenada de temas para ciclar */
export const THEMES: Theme[] = ['light', 'dark', 'warm', 'cold'];

/** Clave de almacenamiento en localStorage */
export const STORAGE_KEY = 'ngr-theme';

/**
 * Devuelve el tema activo desde localStorage.
 * Retorna 'light' si no hay valor guardado o el valor es inválido.
 */
export function getTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && (THEMES as string[]).includes(saved)) {
    return saved as Theme;
  }
  return 'light';
}

/**
 * Aplica el tema dado al elemento <html> y lo persiste en localStorage.
 * Ignora valores que no estén en THEMES.
 */
export function setTheme(theme: Theme): void {
  if (!(THEMES as string[]).includes(theme)) return;
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-bs-theme', theme);
}

/**
 * Avanza al siguiente tema en el ciclo THEMES y lo aplica.
 * Retorna el nuevo tema activo.
 */
export function cycleTheme(): Theme {
  const current = getTheme();
  const currentIndex = THEMES.indexOf(current);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  // El módulo garantiza que nextIndex siempre está dentro del rango de THEMES
  const next: Theme = THEMES[nextIndex] ?? 'light';
  setTheme(next);
  return next;
}

/**
 * Inicializa el tema: aplica el tema guardado (o 'light' por defecto).
 * Llamar una vez al montar la app.
 */
export function init(): void {
  setTheme(getTheme());
}
