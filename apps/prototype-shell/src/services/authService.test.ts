import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { authService } from './authService';
import type { AuthUser } from './authService';

// Tests unitarios para authService — gestión de sesión y permisos

// Limpiamos localStorage y el estado de sesión entre cada test
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ── hasPermission ─────────────────────────────────────────────────────────────

describe('authService.hasPermission', () => {
  it('debe retornar true cuando el usuario autenticado tiene el permiso indicado', () => {
    const admin: AuthUser = {
      nombre: 'Roberto',
      email: 'admin@ngr.com',
      rol: 'Administrador',
      perfil: 'admin',
      permisos: ['usuarios.ver', 'usuarios.gestionar', 'roles.gestionar'],
    };
    authService.login(admin, 'token-fake-123');

    expect(authService.hasPermission('usuarios.ver')).toBe(true);
  });

  it('debe retornar false cuando el usuario autenticado no tiene el permiso indicado', () => {
    const operador: AuthUser = {
      nombre: 'Carlos',
      email: 'carlos@ngr.com',
      rol: 'Operador',
      perfil: 'operador',
      permisos: ['usuarios.ver'],
    };
    authService.login(operador, 'token-fake-456');

    expect(authService.hasPermission('roles.gestionar')).toBe(false);
  });

  it('debe retornar false cuando no hay usuario autenticado', () => {
    // localStorage está vacío — nadie está logueado
    expect(authService.hasPermission('usuarios.ver')).toBe(false);
  });

  it('debe retornar false cuando el usuario está autenticado pero sin permisos almacenados', () => {
    const sinPermisos: AuthUser = {
      nombre: 'Sin Permisos',
      email: 'sinpermisos@ngr.com',
      rol: 'Consulta',
      perfil: 'consulta',
      // permisos omitido — campo opcional
    };
    authService.login(sinPermisos, 'token-fake-789');

    expect(authService.hasPermission('usuarios.ver')).toBe(false);
  });
});

// ── Login — almacenamiento de permisos ────────────────────────────────────────

describe('authService.login — persistencia de permisos', () => {
  it('debe persistir los permisos en localStorage al hacer login', () => {
    const usuario: AuthUser = {
      nombre: 'Laura',
      email: 'laura@ngr.com',
      rol: 'Operador',
      perfil: 'operador',
      permisos: ['usuarios.ver', 'movimientos.aprobar'],
    };
    authService.login(usuario, 'token-test');

    const stored = authService.getUser();
    expect(stored).not.toBeNull();
    expect(stored?.permisos).toEqual(['usuarios.ver', 'movimientos.aprobar']);
  });

  it('debe mantener todos los campos del usuario tras el login', () => {
    const usuario: AuthUser = {
      nombre: 'Ana',
      email: 'ana@ngr.com',
      rol: 'Administrador',
      perfil: 'admin',
      permisos: ['roles.gestionar'],
    };
    authService.login(usuario, 'tok-ana');

    const stored = authService.getUser();
    expect(stored?.nombre).toBe('Ana');
    expect(stored?.email).toBe('ana@ngr.com');
    expect(stored?.perfil).toBe('admin');
    expect(stored?.permisos).toContain('roles.gestionar');
  });
});

// ── Logout — limpieza de permisos ─────────────────────────────────────────────

describe('authService.logout — limpieza de estado', () => {
  it('debe eliminar los permisos de localStorage al hacer logout', () => {
    const usuario: AuthUser = {
      nombre: 'Martín',
      email: 'martin@ngr.com',
      rol: 'Operador',
      perfil: 'operador',
      permisos: ['usuarios.ver'],
    };
    authService.login(usuario, 'token-martin');

    // Verificamos que está autenticado
    expect(authService.isAuthenticated()).toBe(true);

    authService.logout();

    // Tras logout: no hay usuario ni permisos
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getUser()).toBeNull();
  });

  it('debe retornar false en hasPermission después del logout', () => {
    const admin: AuthUser = {
      nombre: 'Roberto',
      email: 'admin@ngr.com',
      rol: 'Administrador',
      perfil: 'admin',
      permisos: ['usuarios.ver', 'roles.gestionar'],
    };
    authService.login(admin, 'token-logout-test');

    // Antes del logout: tiene permiso
    expect(authService.hasPermission('usuarios.ver')).toBe(true);

    authService.logout();

    // Después del logout: no tiene permiso
    expect(authService.hasPermission('usuarios.ver')).toBe(false);
  });
});
