// Mock de Bootstrap Tooltip — jsdom no tiene CSS layout, el constructor lanzaría error
import { vi } from 'vitest';

vi.mock('bootstrap', () => ({
  Tooltip: vi.fn().mockImplementation(() => ({ dispose: vi.fn() })),
}));
