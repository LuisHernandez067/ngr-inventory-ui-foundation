import type { PaginatedResponse, Rol } from '@ngr-inventory/api-contracts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo roles (página de lista con navegación al detalle y acción gateada).
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

import { rolesPage } from './roles';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Permisos de ejemplo para los fixtures de roles */
const permisosAdmin = [
  { id: 'perm-001', clave: 'usuarios.ver', nombre: 'Ver usuarios', modulo: 'usuarios' },
  { id: 'perm-002', clave: 'usuarios.gestionar', nombre: 'Gestionar usuarios', modulo: 'usuarios' },
  { id: 'perm-003', clave: 'roles.ver', nombre: 'Ver roles', modulo: 'roles' },
  { id: 'perm-004', clave: 'roles.gestionar', nombre: 'Gestionar roles', modulo: 'roles' },
];

const permisosOperador = [
  { id: 'perm-001', clave: 'usuarios.ver', nombre: 'Ver usuarios', modulo: 'usuarios' },
];

/** Fixture de roles para tests */
const rolesFixture: Rol[] = [
  {
    id: 'rol-001',
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: permisosAdmin,
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
    permisos: permisosOperador,
    esAdmin: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    id: 'rol-003',
    nombre: 'Consulta',
    permisos: [],
    esAdmin: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
  },
];

/** Respuesta paginada con roles */
const rolesResponse: PaginatedResponse<Rol> = {
  data: rolesFixture,
  total: 3,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

/** Respuesta paginada vacía */
const rolesVaciosResponse: PaginatedResponse<Rol> = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 50,
  totalPages: 0,
};

describe('rolesPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: usuario con permiso de gestión
    mockAuthService.hasPermission.mockReturnValue(true);
    mockApiFetch.mockResolvedValue(rolesResponse);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    rolesPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ────────────────────────────────────────────────────────

  it('debe renderizar el título "Roles y permisos"', () => {
    rolesPage.render(container);

    const h1 = q(container, 'h1');
    expect(h1.textContent.trim()).toBe('Roles y permisos');
  });

  it('debe mostrar columnas nombre, descripción y Nº de permisos en la tabla', () => {
    rolesPage.render(container);

    const thead = q(container, 'thead');
    const html = thead.innerHTML;
    expect(html).toContain('Nombre');
    expect(html).toContain('Descripción');
    expect(html).toContain('permisos');
  });

  it('debe llamar a apiFetch con el endpoint /api/roles', () => {
    rolesPage.render(container);

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/roles'),
      expect.any(Object)
    );
  });

  it('debe renderizar filas con nombre, descripción y número de permisos', async () => {
    rolesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Administrador');
    });

    expect(container.innerHTML).toContain('Acceso total al sistema');
    expect(container.innerHTML).toContain('Operador');
    expect(container.innerHTML).toContain('Consulta');
  });

  it('debe mostrar el número correcto de permisos por rol', async () => {
    rolesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBe(3);
    });

    const rows = container.querySelectorAll<HTMLElement>('tbody tr[data-id]');
    // Administrador tiene 4 permisos
    expect(rows[0]?.innerHTML).toContain('4');
    // Operador tiene 1 permiso
    expect(rows[1]?.innerHTML).toContain('1');
    // Consulta tiene 0 permisos
    expect(rows[2]?.innerHTML).toContain('0');
  });

  // ── Botón "Nuevo Rol" — visibilidad por permiso ───────────────────────────────

  it('debe mostrar el botón "Nuevo Rol" cuando hasPermission("roles.gestionar") es true', () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    rolesPage.render(container);

    const btn = container.querySelector('#btn-nuevo-rol');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Nuevo Rol');
  });

  it('NO debe mostrar el botón "Nuevo Rol" cuando hasPermission("roles.gestionar") es false', () => {
    mockAuthService.hasPermission.mockReturnValue(false);

    rolesPage.render(container);

    expect(container.querySelector('#btn-nuevo-rol')).toBeNull();
  });

  it('debe navegar a #/roles/nuevo al hacer clic en "Nuevo Rol"', () => {
    mockAuthService.hasPermission.mockReturnValue(true);

    rolesPage.render(container);

    const btn = q(container, '#btn-nuevo-rol') as HTMLButtonElement;
    btn.click();

    expect(window.location.hash).toBe('#/roles/nuevo');
  });

  // ── Navegación por clic en fila ───────────────────────────────────────────────

  it('debe navegar a #/roles/:id al hacer clic en una fila', async () => {
    rolesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr[data-id]').length).toBeGreaterThan(0);
    });

    const firstRow = container.querySelector<HTMLElement>('tbody tr[data-id]');
    firstRow?.click();

    expect(window.location.hash).toBe('#/roles/rol-001');
  });

  // ── Estado de error ───────────────────────────────────────────────────────────

  it('debe mostrar mensaje de error cuando apiFetch falla', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    rolesPage.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Network error');
  });

  // ── Tabla vacía ───────────────────────────────────────────────────────────────

  it('debe mostrar "Sin roles registrados" cuando no hay roles', async () => {
    mockApiFetch.mockResolvedValueOnce(rolesVaciosResponse);

    rolesPage.render(container);

    await vi.waitFor(() => {
      expect(container.innerHTML).toContain('Sin roles registrados');
    });
  });

  // ── destroy ───────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValue(new Promise(vi.fn()));

    rolesPage.render(container);

    expect(() => {
      rolesPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      rolesPage.destroy();
    }).not.toThrow();
  });
});
