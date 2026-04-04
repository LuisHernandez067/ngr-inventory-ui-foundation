import type {
  AuditoriaEntry,
  PaginatedResponse,
  TipoAccionAuditoria,
  Usuario,
} from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo auditoria (página de lista con 5 filtros y vista de solo lectura).
// Se mockea apiFetch para aislar el comportamiento del componente.

// Mockear apiFetch antes de importar el módulo bajo test
vi.mock('../_shared/apiFetch', () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(`HTTP ${String(status)}`);
      this.name = 'ApiError';
      this.status = status;
      this.body = body;
    }
  },
}));

import { apiFetch } from '../_shared/apiFetch';

import { auditoriaPage } from './auditoria';

const mockApiFetch = vi.mocked(apiFetch);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture de entradas de auditoría para tests */
const auditoriaFixture: AuditoriaEntry[] = [
  {
    id: 'aud-001',
    fecha: '2025-04-01T09:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'crear' as TipoAccionAuditoria,
    modulo: 'usuarios',
    entidadId: 'usr-003',
    entidadTipo: 'usuario',
    descripcion: 'Creó el usuario operador2@ngr.com',
  },
  {
    id: 'aud-002',
    fecha: '2025-04-01T10:00:00.000Z',
    usuarioId: 'usr-002',
    usuarioEmail: 'operador@ngr.com',
    accion: 'actualizar' as TipoAccionAuditoria,
    modulo: 'productos',
    entidadId: 'prod-001',
    entidadTipo: 'producto',
    descripcion: 'Actualizó el stock del producto Teclado Mecánico TKL',
  },
  {
    id: 'aud-003',
    fecha: '2025-04-01T11:00:00.000Z',
    usuarioId: 'usr-001',
    usuarioEmail: 'admin@ngr.com',
    accion: 'eliminar' as TipoAccionAuditoria,
    modulo: 'roles',
    entidadId: 'rol-005',
    entidadTipo: 'rol',
    descripcion: 'Eliminó el rol Pruebas',
  },
];

/** Respuesta paginada con auditoría */
const auditoriaResponse: PaginatedResponse<AuditoriaEntry> = {
  data: auditoriaFixture,
  total: 3,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const auditoriaVaciaResponse: PaginatedResponse<AuditoriaEntry> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

/** Fixture de usuarios para el filtro de usuarioId */
const usuariosResponse: PaginatedResponse<Usuario> = {
  data: [
    {
      id: 'usr-001',
      email: 'admin@ngr.com',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      rolId: 'rol-001',
      rolNombre: 'Administrador',
      activo: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

describe('auditoriaPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: usuarios (renderPage) + auditoría (fetchAndRender)
    mockApiFetch.mockResolvedValueOnce(usuariosResponse).mockResolvedValueOnce(auditoriaResponse);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    auditoriaPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Auditoría"', () => {
    auditoriaPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toContain('Auditoría');
  });

  it('debe mostrar la tabla con 6 columnas (fecha y hora, usuario, acción, módulo, entidad, detalles)', () => {
    auditoriaPage.render(container);

    const headers = container.querySelectorAll('thead th');
    expect(headers.length).toBe(6);
  });

  it('debe llamar a apiFetch con el endpoint /api/auditoria', () => {
    auditoriaPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auditoria'),
      expect.any(Object)
    );
  });

  it('debe renderizar los datos de las entradas de auditoría', async () => {
    auditoriaPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('admin@ngr.com');
    });

    expect(container.innerHTML).toContain('operador@ngr.com');
    expect(container.innerHTML).toContain('usuarios');
    expect(container.innerHTML).toContain('productos');
  });

  // ── Panel de filtros con 5 controles ─────────────────────────────────────────

  it('debe mostrar el panel de filtros con control accion', () => {
    auditoriaPage.render(container);

    expect(container.querySelector('#accion-filter')).not.toBeNull();
  });

  it('debe mostrar el panel de filtros con control modulo', () => {
    auditoriaPage.render(container);

    expect(container.querySelector('#modulo-filter')).not.toBeNull();
  });

  it('debe mostrar el panel de filtros con control usuarioId', () => {
    auditoriaPage.render(container);

    expect(container.querySelector('#usuario-filter')).not.toBeNull();
  });

  it('debe mostrar el panel de filtros con control fechaDesde', () => {
    auditoriaPage.render(container);

    expect(container.querySelector('#fecha-desde-filter')).not.toBeNull();
  });

  it('debe mostrar el panel de filtros con control fechaHasta', () => {
    auditoriaPage.render(container);

    expect(container.querySelector('#fecha-hasta-filter')).not.toBeNull();
  });

  // ── Filtro por acción ─────────────────────────────────────────────────────────

  it('debe re-fetchear con ?accion= al aplicar el filtro de acción', async () => {
    mockApiFetch
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(auditoriaResponse)
      .mockResolvedValueOnce(auditoriaResponse);

    auditoriaPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('admin@ngr.com');
    });

    const accionFilter = q(container, '#accion-filter') as HTMLSelectElement;
    accionFilter.value = 'crear';

    const btnFiltrar = q(container, '#btn-filtrar') as HTMLButtonElement;
    btnFiltrar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('accion=crear'),
        expect.any(Object)
      );
    });
  });

  // ── Filtro por módulo ─────────────────────────────────────────────────────────

  it('debe re-fetchear con ?modulo= al aplicar el filtro de módulo', async () => {
    mockApiFetch
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(auditoriaResponse)
      .mockResolvedValueOnce(auditoriaResponse);

    auditoriaPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('admin@ngr.com');
    });

    const moduloFilter = q(container, '#modulo-filter') as HTMLSelectElement;
    moduloFilter.value = 'usuarios';

    const btnFiltrar = q(container, '#btn-filtrar') as HTMLButtonElement;
    btnFiltrar.click();

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('modulo=usuarios'),
        expect.any(Object)
      );
    });
  });

  // ── Contador de resultados ────────────────────────────────────────────────────

  it('debe mostrar el contador de resultados tras cargar los datos', async () => {
    auditoriaPage.render(container);

    await vi.waitFor(() => {
      const countEl = container.querySelector('#result-count');
      expect(countEl?.textContent).toContain('3');
    });
  });

  it('debe mostrar "0 registros" cuando la respuesta está vacía', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(auditoriaVaciaResponse);

    auditoriaPage.render(container);

    await vi.waitFor(() => {
      const countEl = container.querySelector('#result-count');
      expect(countEl?.textContent).toContain('0');
    });
  });

  // ── Estado vacío ──────────────────────────────────────────────────────────────

  it('debe mostrar mensaje de "No se encontraron registros" cuando no hay entradas', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(auditoriaVaciaResponse);

    auditoriaPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('No se encontraron registros de auditoría');
    });
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(usuariosResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    auditoriaPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    auditoriaPage.render(container);

    expect(() => {
      auditoriaPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      auditoriaPage.destroy();
    }).not.toThrow();
  });
});
