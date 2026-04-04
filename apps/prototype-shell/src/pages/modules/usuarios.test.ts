import type { PaginatedResponse, Rol, Usuario } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo usuarios (página de lista con filtros rol/activo y navegación al detalle).
// Se mockean apiFetch y authService para aislar el comportamiento del componente.

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

// Mockear authService para controlar permisos en tests
vi.mock('../../services/authService', () => ({
  authService: {
    hasPermission: vi.fn(),
  },
}));

import { authService } from '../../services/authService';
import { apiFetch } from '../_shared/apiFetch';

import { usuariosPage } from './usuarios';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture de usuarios para tests */
const usuariosFixture: Usuario[] = [
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
  {
    id: 'usr-002',
    email: 'operador@ngr.com',
    nombre: 'Ana',
    apellido: 'García',
    rolId: 'rol-002',
    rolNombre: 'Operador',
    activo: false,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/** Respuesta paginada con usuarios */
const usuariosResponse: PaginatedResponse<Usuario> = {
  data: usuariosFixture,
  total: 2,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const usuariosVaciosResponse: PaginatedResponse<Usuario> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

/** Fixture de roles para el filtro */
const rolesResponse: PaginatedResponse<Rol> = {
  data: [
    {
      id: 'rol-001',
      nombre: 'Administrador',
      descripcion: 'Acceso total',
      permisos: [],
      esAdmin: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'rol-002',
      nombre: 'Operador',
      descripcion: 'Acceso operativo',
      permisos: [],
      esAdmin: false,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

describe('usuariosPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: usuario con permiso de gestión
    mockAuthService.hasPermission.mockReturnValue(true);
    // Por defecto: roles (renderPage) + usuarios (fetchAndRender)
    mockApiFetch.mockResolvedValueOnce(rolesResponse).mockResolvedValueOnce(usuariosResponse);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    usuariosPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Usuarios"', () => {
    usuariosPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toBe('Usuarios');
  });

  it('debe mostrar columnas nombre, email, rol y activo en la tabla', () => {
    usuariosPage.render(container);

    const thead = q(container, 'thead');
    const html = thead.innerHTML;
    expect(html).toContain('Nombre');
    expect(html).toContain('Email');
    expect(html).toContain('Rol');
    expect(html).toContain('Estado');
  });

  it('debe llamar a apiFetch con el endpoint /api/usuarios', () => {
    usuariosPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/usuarios'),
      expect.any(Object)
    );
  });

  it('debe renderizar filas con nombre completo, email, rol y badge activo', async () => {
    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Carlos Rodríguez');
    });

    expect(container.innerHTML).toContain('admin@ngr.com');
    expect(container.innerHTML).toContain('Administrador');
    expect(container.innerHTML).toContain('Activo');
    expect(container.innerHTML).toContain('Ana García');
    expect(container.innerHTML).toContain('Inactivo');
  });

  // ── Filtro por rolId ──────────────────────────────────────────────────────────

  it('debe re-fetchear con ?rolId= al cambiar el filtro de rol', async () => {
    mockApiFetch
      .mockResolvedValueOnce(rolesResponse)
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(usuariosResponse);

    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Carlos Rodríguez');
    });

    const rolFilter = q(container, '#rol-filter') as HTMLSelectElement;
    rolFilter.value = 'rol-001';
    rolFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('rolId=rol-001'),
        expect.any(Object)
      );
    });
  });

  // ── Filtro por activo ─────────────────────────────────────────────────────────

  it('debe re-fetchear con ?activo=true al filtrar por usuarios activos', async () => {
    mockApiFetch
      .mockResolvedValueOnce(rolesResponse)
      .mockResolvedValueOnce(usuariosResponse)
      .mockResolvedValueOnce(usuariosResponse);

    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Carlos Rodríguez');
    });

    const activoFilter = q(container, '#activo-filter') as HTMLSelectElement;
    activoFilter.value = 'true';
    activoFilter.dispatchEvent(new Event('change'));

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('activo=true'),
        expect.any(Object)
      );
    });
  });

  // ── Botón "Nuevo Usuario" — visibilidad por permiso ──────────────────────────

  it('debe mostrar el botón "Nuevo Usuario" cuando hasPermission("usuarios.gestionar") es true', () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    usuariosPage.render(container);

    const btn = container.querySelector('#btn-nuevo-usuario');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Nuevo Usuario');
  });

  it('NO debe mostrar el botón "Nuevo Usuario" cuando hasPermission("usuarios.gestionar") es false', () => {
    mockAuthService.hasPermission.mockReturnValue(false);

    usuariosPage.render(container);

    expect(container.querySelector('#btn-nuevo-usuario')).toBeNull();
  });

  it('debe navegar a #/usuarios/nuevo al hacer clic en "Nuevo Usuario"', () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    usuariosPage.render(container);

    const btn = q(container, '#btn-nuevo-usuario') as HTMLButtonElement;
    btn.click();

    expect(window.location.hash).toBe('#/usuarios/nuevo');
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/usuarios/:id al hacer clic en una fila', async () => {
    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const firstRow = container.querySelector<HTMLElement>('tbody tr[data-id]');
    firstRow?.click();

    expect(window.location.hash).toBe('#/usuarios/usr-001');
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockReset();
    mockApiFetch
      .mockResolvedValueOnce(rolesResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin usuarios registrados" cuando no hay usuarios', async () => {
    mockApiFetch.mockReset();
    mockApiFetch.mockResolvedValueOnce(rolesResponse).mockResolvedValueOnce(usuariosVaciosResponse);

    usuariosPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin usuarios registrados');
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    usuariosPage.render(container);

    expect(() => {
      usuariosPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      usuariosPage.destroy();
    }).not.toThrow();
  });
});
