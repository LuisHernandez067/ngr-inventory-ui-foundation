import type { Usuario } from '@ngr-inventory/api-contracts';
import { ConfirmDialog } from '@ngr-inventory/ui-core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Tests del módulo usuarios-detail.
// Se mockean apiFetch, authService y ConfirmDialog para aislar el comportamiento del componente.

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

// Mockear ConfirmDialog para controlar el resultado del diálogo
vi.mock('@ngr-inventory/ui-core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    ConfirmDialog: {
      confirm: vi.fn(),
    },
  };
});

import { authService } from '../../services/authService';
import { apiFetch, ApiError } from '../_shared/apiFetch';

import { usuariosDetailPage } from './usuarios-detail';

const mockApiFetch = vi.mocked(apiFetch);
const mockAuthService = vi.mocked(authService);
const mockConfirm = vi.mocked(ConfirmDialog).confirm;

/** Helper: query con assert — evita non-null assertion operator */
function q(container: HTMLElement, selector: string): Element {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

/** Fixture — usuario activo */
const usuarioActivo: Usuario = {
  id: 'usr-001',
  email: 'admin@ngr.com',
  nombre: 'Carlos',
  apellido: 'Rodríguez',
  rolId: 'rol-001',
  rolNombre: 'Administrador',
  activo: true,
  ultimoAcceso: '2025-04-01T10:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-04-01T10:00:00.000Z',
  createdBy: 'system',
  updatedBy: 'admin@ngr.com',
};

/** Fixture — usuario inactivo */
const usuarioInactivo: Usuario = {
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
};

describe('usuariosDetailPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
    // Por defecto: usuario con permiso de gestión
    mockAuthService.hasPermission.mockReturnValue(true);
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.removeChild(container);
    usuariosDetailPage.destroy();
    vi.restoreAllMocks();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────────

  it('debe mostrar spinner durante la carga', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    usuariosDetailPage.render(container, { id: 'usr-001' });

    expect(container.innerHTML).toContain('spinner-border');
    expect(container.innerHTML).toContain('Cargando usuario');
  });

  // ── Renderizado del usuario ───────────────────────────────────────────────────

  it('debe renderizar nombre completo y email del usuario', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#usuario-nombre')).not.toBeNull();
    });

    expect(q(container, '#usuario-nombre').textContent).toContain('Carlos Rodríguez');
    expect(container.innerHTML).toContain('admin@ngr.com');
  });

  it('debe renderizar el nombre del rol del usuario', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#usuario-nombre')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('Administrador');
  });

  // ── Badge de estado activo ────────────────────────────────────────────────────

  it('debe mostrar badge "Activo" con clase bg-success para usuario activo', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#activo-badge')).not.toBeNull();
    });

    const badge = q(container, '#activo-badge');
    expect(badge.textContent.trim()).toBe('Activo');
    expect(badge.classList.contains('bg-success')).toBe(true);
  });

  it('debe mostrar badge "Inactivo" con clase bg-danger para usuario inactivo', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioInactivo);

    usuariosDetailPage.render(container, { id: 'usr-002' });

    await vi.waitFor(() => {
      expect(container.querySelector('#activo-badge')).not.toBeNull();
    });

    const badge = q(container, '#activo-badge');
    expect(badge.textContent.trim()).toBe('Inactivo');
    expect(badge.classList.contains('bg-danger')).toBe(true);
  });

  // ── Acciones gateadas por permiso ────────────────────────────────────────────

  it('debe mostrar botón editar cuando hasPermission("usuarios.gestionar") es true', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#usuario-actions')).not.toBeNull();
    });

    const editLink = container.querySelector<HTMLAnchorElement>('a[href*="/editar"]');
    expect(editLink).not.toBeNull();
    expect(editLink?.textContent).toContain('Editar');
  });

  it('debe mostrar botón toggle-activo cuando hasPermission("usuarios.gestionar") es true', async () => {
    mockAuthService.hasPermission.mockReturnValue(true);
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-toggle-activo')).not.toBeNull();
    });

    expect(container.querySelector('#btn-toggle-activo')).not.toBeNull();
  });

  it('NO debe mostrar acciones cuando hasPermission("usuarios.gestionar") es false', async () => {
    mockAuthService.hasPermission.mockReturnValue(false);
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#usuario-nombre')).not.toBeNull();
    });

    expect(container.querySelector('#usuario-actions')).toBeNull();
    expect(container.querySelector('#btn-toggle-activo')).toBeNull();
  });

  // ── Toggle activo con confirmación ────────────────────────────────────────────

  it('debe abrir ConfirmDialog al hacer clic en toggle-activo', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);
    mockConfirm.mockResolvedValue(false); // El usuario cancela

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-toggle-activo')).not.toBeNull();
    });

    const btn = q(container, '#btn-toggle-activo') as HTMLButtonElement;
    btn.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });
  });

  it('no debe ejecutar PATCH cuando el usuario cancela el ConfirmDialog', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);
    mockConfirm.mockResolvedValue(false);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-toggle-activo')).not.toBeNull();
    });

    const btn = q(container, '#btn-toggle-activo') as HTMLButtonElement;
    btn.click();

    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledOnce();
    });

    // Solo debe haberse llamado 1 vez (carga inicial) — sin PATCH
    expect(mockApiFetch).toHaveBeenCalledTimes(1);
  });

  // ── Estado 404 ───────────────────────────────────────────────────────────────

  it('debe mostrar alerta warning cuando el usuario no existe (404)', async () => {
    const apiError = new ApiError(404, { title: 'Not found' });
    mockApiFetch.mockRejectedValueOnce(apiError);

    usuariosDetailPage.render(container, { id: 'usr-999' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-warning')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('El usuario solicitado no existe');
  });

  it('debe mostrar alerta danger cuando apiFetch falla con error genérico', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'));

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('.alert-danger')).not.toBeNull();
    });

    expect(container.innerHTML).toContain('No se pudo cargar el usuario');
  });

  it('no debe mostrar error cuando la petición es abortada', async () => {
    const abortError = new DOMException('Cancelado', 'AbortError');
    mockApiFetch.mockRejectedValueOnce(abortError);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledOnce();
    });

    expect(container.querySelector('.alert-danger')).toBeNull();
    expect(container.querySelector('.alert-warning')).toBeNull();
  });

  // ── Navegación ────────────────────────────────────────────────────────────────

  it('debe navegar a #/usuarios al hacer clic en Volver', async () => {
    mockApiFetch.mockResolvedValueOnce(usuarioActivo);

    usuariosDetailPage.render(container, { id: 'usr-001' });

    await vi.waitFor(() => {
      expect(container.querySelector('#btn-back')).not.toBeNull();
    });

    const btnBack = q(container, '#btn-back') as HTMLButtonElement;
    btnBack.click();

    expect(window.location.hash).toBe('#/usuarios');
  });

  // ── destroy ──────────────────────────────────────────────────────────────────

  it('destroy debe cancelar la petición en vuelo sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    usuariosDetailPage.render(container, { id: 'usr-001' });

    expect(() => {
      usuariosDetailPage.destroy();
    }).not.toThrow();
  });

  it('destroy no debe lanzar error si se llama sin render previo', () => {
    expect(() => {
      usuariosDetailPage.destroy();
    }).not.toThrow();
  });
});
