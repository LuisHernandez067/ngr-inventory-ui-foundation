import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Tests del módulo de temas — verifica fallback, persistencia y ciclo de temas
describe('theme.ts', () => {
  // Simular localStorage para cada test
  let storageMock: Record<string, string> = {};

  beforeEach(() => {
    storageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => storageMock[key] ?? null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      storageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      delete storageMock[key];
    });

    // Restablecer el atributo data-bs-theme en cada test
    document.documentElement.removeAttribute('data-bs-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('THEMES y STORAGE_KEY', () => {
    it('debe exportar THEMES con los cuatro temas en orden correcto', async () => {
      const { THEMES } = await import('./theme');
      expect(THEMES).toEqual(['light', 'dark', 'warm', 'cold']);
    });

    it('debe exportar STORAGE_KEY como "ngr-theme"', async () => {
      const { STORAGE_KEY } = await import('./theme');
      expect(STORAGE_KEY).toBe('ngr-theme');
    });
  });

  describe('getTheme()', () => {
    it('debe retornar "light" cuando no hay tema guardado', async () => {
      const { getTheme } = await import('./theme');
      expect(getTheme()).toBe('light');
    });

    it('debe retornar el tema guardado si es válido', async () => {
      storageMock['ngr-theme'] = 'dark';
      const { getTheme } = await import('./theme');
      expect(getTheme()).toBe('dark');
    });

    it('debe retornar "light" si el valor guardado es inválido', async () => {
      storageMock['ngr-theme'] = 'invalid-theme';
      const { getTheme } = await import('./theme');
      expect(getTheme()).toBe('light');
    });

    it('debe retornar "warm" si el valor guardado es "warm"', async () => {
      storageMock['ngr-theme'] = 'warm';
      const { getTheme } = await import('./theme');
      expect(getTheme()).toBe('warm');
    });

    it('debe retornar "cold" si el valor guardado es "cold"', async () => {
      storageMock['ngr-theme'] = 'cold';
      const { getTheme } = await import('./theme');
      expect(getTheme()).toBe('cold');
    });
  });

  describe('setTheme()', () => {
    it('debe establecer data-bs-theme en el elemento <html>', async () => {
      const { setTheme } = await import('./theme');
      setTheme('dark');
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    });

    it('debe persistir el tema en localStorage', async () => {
      const { setTheme } = await import('./theme');
      setTheme('warm');
      expect(storageMock['ngr-theme']).toBe('warm');
    });

    it('debe ignorar valores inválidos', async () => {
      const { setTheme } = await import('./theme');
      // @ts-expect-error — probando valor inválido intencionalmente
      setTheme('purple');
      expect(document.documentElement.getAttribute('data-bs-theme')).toBeNull();
    });
  });

  describe('cycleTheme()', () => {
    it('debe ciclar de light → dark', async () => {
      storageMock['ngr-theme'] = 'light';
      const { cycleTheme } = await import('./theme');
      const result = cycleTheme();
      expect(result).toBe('dark');
      expect(storageMock['ngr-theme']).toBe('dark');
    });

    it('debe ciclar de dark → warm', async () => {
      storageMock['ngr-theme'] = 'dark';
      const { cycleTheme } = await import('./theme');
      const result = cycleTheme();
      expect(result).toBe('warm');
    });

    it('debe ciclar de warm → cold', async () => {
      storageMock['ngr-theme'] = 'warm';
      const { cycleTheme } = await import('./theme');
      const result = cycleTheme();
      expect(result).toBe('cold');
    });

    it('debe ciclar de cold → light (vuelta al inicio)', async () => {
      storageMock['ngr-theme'] = 'cold';
      const { cycleTheme } = await import('./theme');
      const result = cycleTheme();
      expect(result).toBe('light');
    });
  });

  describe('init()', () => {
    it('debe aplicar el tema guardado al inicializar', async () => {
      storageMock['ngr-theme'] = 'dark';
      const { init } = await import('./theme');
      init();
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    });

    it('debe aplicar "light" si no hay tema guardado', async () => {
      const { init } = await import('./theme');
      init();
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    });
  });
});
