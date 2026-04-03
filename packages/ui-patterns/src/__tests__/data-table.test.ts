import { describe, it, expect, vi } from 'vitest';

import { render, init } from '../patterns/data-table';
import type { ColumnDef } from '../types';

// Datos de prueba representativos del dominio NGR Inventory
interface Producto {
  id: number;
  nombre: string;
  stock: number;
  estado: string;
}

const columns: ColumnDef<Producto>[] = [
  { key: 'id', header: 'ID' },
  { key: 'nombre', header: 'Nombre', sortable: true },
  { key: 'stock', header: 'Stock', sortable: true },
  { key: 'estado', header: 'Estado' },
];

const rows: Producto[] = [
  { id: 1, nombre: 'Laptop HP', stock: 10, estado: 'activo' },
  { id: 2, nombre: 'Monitor Dell', stock: 5, estado: 'activo' },
  { id: 3, nombre: 'Teclado Logitech', stock: 0, estado: 'inactivo' },
];

// Tests del patrón DataTable
describe('DataTable — render()', () => {
  it('debe renderizar tabla con role="grid"', () => {
    const html = render({ columns, rows });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('table[role="grid"]')).not.toBeNull();
  });

  it('debe renderizar encabezados de columna con scope="col"', () => {
    const html = render({ columns, rows });
    const el = document.createElement('div');
    el.innerHTML = html;
    const headers = el.querySelectorAll('th[scope="col"]');
    expect(headers).toHaveLength(4);
  });

  it('debe incluir data-sortable en columnas ordenables', () => {
    const html = render({ columns, rows });
    const el = document.createElement('div');
    el.innerHTML = html;
    const sortable = el.querySelectorAll('th[data-sortable]');
    expect(sortable).toHaveLength(2);
  });

  it('debe renderizar una fila por cada row de datos', () => {
    const html = render({ columns, rows });
    const el = document.createElement('div');
    el.innerHTML = html;
    const dataRows = el.querySelectorAll('tbody tr');
    expect(dataRows).toHaveLength(3);
  });

  it('debe mostrar el EmptyState cuando no hay filas', () => {
    const html = render({ columns, rows: [] });
    expect(html).toContain('ngr-empty-state');
  });

  it('no debe mostrar tabla cuando loading es true', () => {
    const html = render({ columns, rows, loading: true });
    const el = document.createElement('div');
    el.innerHTML = html;
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('.spinner-border')).not.toBeNull();
  });

  it('debe agregar cursor-pointer a filas cuando onRowClick es provisto', () => {
    const html = render({ columns, rows, onRowClick: vi.fn() });
    const el = document.createElement('div');
    el.innerHTML = html;
    const firstRow = el.querySelector('tbody tr');
    expect(firstRow?.classList.contains('cursor-pointer')).toBe(true);
  });

  it('no debe agregar cursor-pointer a filas sin onRowClick', () => {
    const html = render({ columns, rows });
    const el = document.createElement('div');
    el.innerHTML = html;
    const firstRow = el.querySelector('tbody tr');
    expect(firstRow?.classList.contains('cursor-pointer')).toBe(false);
  });

  it('debe usar render personalizado de columna cuando se provee', () => {
    const customColumns: ColumnDef<Producto>[] = [
      { key: 'estado', header: 'Estado', render: (val) => `<strong>${String(val)}</strong>` },
    ];
    const html = render({ columns: customColumns, rows: [rows[0]] });
    expect(html).toContain('<strong>activo</strong>');
  });
});

describe('DataTable — init() — sorting', () => {
  it('debe emitir ngr:sort-change con direction "asc" al primer clic', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ columns, rows });
    document.body.appendChild(root);
    init(root, { columns, rows });

    const spy = vi.fn();
    root.addEventListener('ngr:sort-change', spy);

    const sortableTh = root.querySelector<HTMLElement>('th[data-sortable="nombre"]');
    sortableTh?.click();

    expect(spy).toHaveBeenCalledOnce();
    const sortChangeEvent0 = spy.mock.calls[0]?.[0] as
      | CustomEvent<{ key: string; direction: string | null }>
      | undefined;
    expect(sortChangeEvent0?.detail.key).toBe('nombre');
    expect(sortChangeEvent0?.detail.direction).toBe('asc');
    expect(sortableTh?.getAttribute('aria-sort')).toBe('ascending');

    document.body.removeChild(root);
  });

  it('debe emitir ngr:sort-change con direction "desc" al segundo clic', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ columns, rows });
    document.body.appendChild(root);
    init(root, { columns, rows });

    const spy = vi.fn();
    root.addEventListener('ngr:sort-change', spy);

    const sortableTh = root.querySelector<HTMLElement>('th[data-sortable="nombre"]');
    sortableTh?.click(); // asc
    sortableTh?.click(); // desc

    expect(spy).toHaveBeenCalledTimes(2);
    const sortChangeEvent1 = spy.mock.calls[1]?.[0] as
      | CustomEvent<{ key: string; direction: string | null }>
      | undefined;
    expect(sortChangeEvent1?.detail.direction).toBe('desc');
    expect(sortableTh?.getAttribute('aria-sort')).toBe('descending');

    document.body.removeChild(root);
  });

  it('debe emitir direction null al tercer clic (vuelta a sin orden)', () => {
    const root = document.createElement('div');
    root.innerHTML = render({ columns, rows });
    document.body.appendChild(root);
    init(root, { columns, rows });

    const spy = vi.fn();
    root.addEventListener('ngr:sort-change', spy);

    const sortableTh = root.querySelector<HTMLElement>('th[data-sortable="nombre"]');
    sortableTh?.click(); // asc
    sortableTh?.click(); // desc
    sortableTh?.click(); // none

    const sortChangeEvent2 = spy.mock.calls[2]?.[0] as
      | CustomEvent<{ key: string; direction: string | null }>
      | undefined;
    expect(sortChangeEvent2?.detail.direction).toBeNull();
    expect(sortableTh?.getAttribute('aria-sort')).toBe('none');

    document.body.removeChild(root);
  });

  it('debe aislar el estado de ordenamiento entre múltiples instancias', () => {
    const root1 = document.createElement('div');
    const root2 = document.createElement('div');
    root1.innerHTML = render({ columns, rows });
    root2.innerHTML = render({ columns, rows });
    document.body.appendChild(root1);
    document.body.appendChild(root2);

    init(root1, { columns, rows });
    init(root2, { columns, rows });

    const spy1 = vi.fn();
    const spy2 = vi.fn();
    root1.addEventListener('ngr:sort-change', spy1);
    root2.addEventListener('ngr:sort-change', spy2);

    root1.querySelector<HTMLElement>('th[data-sortable="nombre"]')?.click();
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).not.toHaveBeenCalled();

    document.body.removeChild(root1);
    document.body.removeChild(root2);
  });
});
