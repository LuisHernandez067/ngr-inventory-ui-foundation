import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../utils/debounce';

// Tests de la utilidad debounce
describe('debounce()', () => {
  beforeEach(() => {
    // Activar timers falsos para controlar el tiempo
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe ejecutar la función después del delay especificado', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('arg1');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('arg1');
  });

  it('debe ejecutar solo una vez si se llama múltiples veces antes del delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    // Llamar 5 veces rápidamente
    debounced('a');
    debounced('b');
    debounced('c');
    debounced('d');
    debounced('e');

    vi.advanceTimersByTime(300);

    // Solo debe ejecutarse una vez, con el último argumento
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('e');
  });

  it('debe reiniciar el timer cuando se invoca antes del delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('primera');
    vi.advanceTimersByTime(200);

    // Invocar de nuevo antes de que expire — reinicia el timer
    debounced('segunda');
    vi.advanceTimersByTime(200);

    // Aún no debe ejecutarse (solo pasaron 200ms desde el segundo llamado)
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('segunda');
  });

  it('debe permitir múltiples ejecuciones si el intervalo supera el delay', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('primero');
    vi.advanceTimersByTime(400);

    debounced('segundo');
    vi.advanceTimersByTime(400);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
