// Utilidad debounce — retrasa la ejecución hasta que cesen los eventos

/**
 * Retarda la ejecución de la función fn hasta que hayan pasado
 * `delay` ms sin que sea invocada nuevamente.
 * Cada nueva invocación cancela el timer anterior.
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    // Cancelar el timer previo si existe
    clearTimeout(timer);
    // Programar la ejecución diferida
    timer = setTimeout(() => fn(...args), delay);
  };
}
