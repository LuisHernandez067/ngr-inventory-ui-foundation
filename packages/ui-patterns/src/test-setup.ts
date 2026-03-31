// Mock de Bootstrap — jsdom no tiene CSS layout, los constructores lanzarían errores
import { vi } from 'vitest';

vi.mock('bootstrap', () => ({
  Tooltip: vi.fn().mockImplementation(() => ({ dispose: vi.fn() })),
  Dropdown: vi.fn().mockImplementation(() => ({
    dispose: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
  })),
}));
