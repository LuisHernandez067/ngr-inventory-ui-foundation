import type { PaginatedResponse } from '@ngr-inventory/api-contracts';
import * as DataTableModule from '@ngr-inventory/ui-patterns';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { apiFetch } from './apiFetch';
import { createListPage } from './createListPage';
import type { ColumnDef } from './createListPage';

// Tests del factory createListPage.
// Se mockea apiFetch para controlar las respuestas y evitar fetch real.

// Tipo de fila de prueba — incluye index signature para satisfacer Record<string, unknown>
interface ItemRow extends Record<string, unknown> {
  id: string;
  nombre: string;
  status: string;
}

const columns: ColumnDef<ItemRow>[] = [
  { key: 'id', header: 'ID' },
  { key: 'nombre', header: 'Nombre' },
  { key: 'status', header: 'Estado' },
];

/** Respuesta paginada de prueba */
function makeResponse(items: ItemRow[]): PaginatedResponse<ItemRow> {
  return {
    data: items,
    page: 1,
    pageSize: 10,
    total: items.length,
    totalPages: 1,
  };
}

// Mockear el módulo apiFetch para controlar respuestas en tests
vi.mock('./apiFetch', () => ({
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

const mockApiFetch = vi.mocked(apiFetch);

describe('createListPage', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  // ── Renderizado básico ───────────────────────────────────────────────────────

  it('debe renderizar el título de la página', () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse([]));

    const page = createListPage<ItemRow>({
      title: 'Prueba',
      endpoint: '/api/test',
      columns,
    });

    page.render(container);

    expect(String(container.querySelector('h1')?.textContent).trim()).toBe('Prueba');
  });

  it('debe funcionar sin onRowClick (compatibilidad hacia atrás)', async () => {
    mockApiFetch.mockResolvedValueOnce(
      makeResponse([{ id: '1', nombre: 'Item', status: 'active' }])
    );

    const page = createListPage<ItemRow>({
      title: 'Sin callback',
      endpoint: '/api/test',
      columns,
    });

    // No debe lanzar ningún error al renderizar
    expect(() => {
      page.render(container);
    }).not.toThrow();

    // Esperar a que se carguen los datos
    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // Las filas no deben tener cursor-pointer (sin onRowClick)
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      expect(row.classList.contains('cursor-pointer')).toBe(false);
    });
  });

  // ── onRowClick wiring ────────────────────────────────────────────────────────

  it('debe llamar onRowClick con el id correcto al hacer clic en una fila', async () => {
    const items: ItemRow[] = [
      { id: 'item-001', nombre: 'Primero', status: 'active' },
      { id: 'item-002', nombre: 'Segundo', status: 'inactive' },
    ];
    mockApiFetch.mockResolvedValueOnce(makeResponse(items));

    const onRowClick = vi.fn();
    const page = createListPage<ItemRow>({
      title: 'Con callback',
      endpoint: '/api/test',
      columns,
      onRowClick,
    });

    page.render(container);

    // Esperar a que se rendericen las filas
    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });

    // Hacer clic en la primera fila
    const firstRow = container.querySelector<HTMLElement>('tbody tr');
    firstRow?.click();

    expect(onRowClick).toHaveBeenCalledOnce();
    expect(onRowClick).toHaveBeenCalledWith('item-001');
  });

  it('debe llamar onRowClick con el id de la segunda fila al hacer clic en ella', async () => {
    const items: ItemRow[] = [
      { id: 'item-001', nombre: 'Primero', status: 'active' },
      { id: 'item-002', nombre: 'Segundo', status: 'inactive' },
    ];
    mockApiFetch.mockResolvedValueOnce(makeResponse(items));

    const onRowClick = vi.fn();
    const page = createListPage<ItemRow>({
      title: 'Con callback',
      endpoint: '/api/test',
      columns,
      onRowClick,
    });

    page.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBe(2);
    });

    // Hacer clic en la segunda fila
    const allRows = container.querySelectorAll<HTMLElement>('tbody tr');
    allRows[1]?.click();

    expect(onRowClick).toHaveBeenCalledOnce();
    expect(onRowClick).toHaveBeenCalledWith('item-002');
  });

  it('debe agregar cursor-pointer a las filas cuando onRowClick es provisto', async () => {
    const items: ItemRow[] = [{ id: 'x-1', nombre: 'Test', status: 'active' }];
    mockApiFetch.mockResolvedValueOnce(makeResponse(items));

    const page = createListPage<ItemRow>({
      title: 'Cursor',
      endpoint: '/api/test',
      columns,
      onRowClick: vi.fn(),
    });

    page.render(container);

    await vi.waitFor(() => {
      expect(container.querySelectorAll('tbody tr').length).toBe(1);
    });

    const row = container.querySelector('tbody tr');
    expect(row?.classList.contains('cursor-pointer')).toBe(true);
  });

  // ── onActionClick wiring ─────────────────────────────────────────────────────

  it('debe llamar onActionClick al hacer clic en el botón de acción', () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse([]));

    const onActionClick = vi.fn();
    const page = createListPage<ItemRow>({
      title: 'Acción',
      endpoint: '/api/test',
      columns,
      actionLabel: 'Nuevo',
      actionIcon: 'bi-plus-lg',
      onActionClick,
    });

    page.render(container);

    // El botón de acción se renderiza en el toolbar
    const actionBtn = container.querySelector<HTMLButtonElement>('.ngr-action-btn');
    expect(actionBtn).not.toBeNull();
    actionBtn?.click();

    expect(onActionClick).toHaveBeenCalledOnce();
  });

  it('no debe renderizar botón de acción si actionLabel no está provisto', () => {
    mockApiFetch.mockResolvedValueOnce(makeResponse([]));

    const page = createListPage<ItemRow>({
      title: 'Sin acción',
      endpoint: '/api/test',
      columns,
    });

    page.render(container);

    expect(container.querySelector('.ngr-action-btn')).toBeNull();
  });

  // ── destroy limpieza ──────────────────────────────────────────────────────────

  it('destroy debe limpiar el controlador sin errores', () => {
    mockApiFetch.mockReturnValueOnce(new Promise(vi.fn()));

    const page = createListPage<ItemRow>({
      title: 'Limpieza',
      endpoint: '/api/test',
      columns,
    });

    page.render(container);
    expect(() => {
      page.destroy();
    }).not.toThrow();
  });

  // ── Spy en DataTable.init ──────────────────────────────────────────────────

  it('debe pasar onRowClick a DataTable.init cuando la opción está provista', async () => {
    const items: ItemRow[] = [{ id: 'z-1', nombre: 'Z', status: 'active' }];
    mockApiFetch.mockResolvedValueOnce(makeResponse(items));

    const initSpy = vi.spyOn(DataTableModule.DataTable, 'init');

    const onRowClick = vi.fn();
    const page = createListPage<ItemRow>({
      title: 'Spy',
      endpoint: '/api/test',
      columns,
      onRowClick,
    });

    page.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // DataTable.init debe haber sido llamado con el campo onRowClick
    expect(initSpy).toHaveBeenCalled();
    const callArgs = initSpy.mock.calls[0];
    expect(callArgs?.[1]).toHaveProperty('onRowClick');
  });

  it('no debe pasar onRowClick a DataTable.init cuando la opción no está provista', async () => {
    const items: ItemRow[] = [{ id: 'z-1', nombre: 'Z', status: 'active' }];
    mockApiFetch.mockResolvedValueOnce(makeResponse(items));

    const initSpy = vi.spyOn(DataTableModule.DataTable, 'init');

    const page = createListPage<ItemRow>({
      title: 'Sin spy',
      endpoint: '/api/test',
      columns,
    });

    page.render(container);

    await vi.waitFor(() => {
      expect(container.querySelector('table')).not.toBeNull();
    });

    // DataTable.init debe haber sido llamado sin onRowClick
    expect(initSpy).toHaveBeenCalled();
    const callArgs = initSpy.mock.calls[0];
    expect(callArgs?.[1]).not.toHaveProperty('onRowClick');
  });
});
