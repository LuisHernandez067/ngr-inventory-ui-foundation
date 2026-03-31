import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, mount } from '../patterns/confirmable-button';
import * as UiCore from '@ngr-inventory/ui-core';

// Tests del patrón ConfirmableButton
describe('ConfirmableButton — render()', () => {
  it('debe renderizar un botón con la variante especificada', () => {
    const html = render({
      label: 'Eliminar',
      confirmTitle: 'Confirmar',
      confirmMessage: '¿Estás seguro?',
      onConfirmed: vi.fn(),
    });
    expect(html).toContain('btn-danger');
    expect(html).toContain('Eliminar');
  });

  it('debe usar variante "danger" por defecto', () => {
    const html = render({
      label: 'Borrar',
      confirmTitle: 'Confirmar',
      confirmMessage: '¿Estás seguro?',
      onConfirmed: vi.fn(),
    });
    expect(html).toContain('btn-danger');
  });

  it('debe incluir el ícono cuando se proporciona', () => {
    const html = render({
      label: 'Eliminar',
      confirmTitle: 'Confirmar',
      confirmMessage: '¿Estás seguro?',
      icon: 'trash',
      onConfirmed: vi.fn(),
    });
    expect(html).toContain('bi-trash');
  });
});

describe('ConfirmableButton — mount() + init()', () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock del método confirm del namespace ConfirmDialog en ui-core
    confirmSpy = vi.spyOn(UiCore.ConfirmDialog, 'confirm');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe ejecutar onConfirmed cuando el usuario confirma', async () => {
    confirmSpy.mockResolvedValue(true);
    const onConfirmed = vi.fn().mockResolvedValue(undefined);

    const root = document.createElement('div');
    document.body.appendChild(root);
    mount(root, {
      label: 'Eliminar',
      confirmTitle: '¿Eliminar producto?',
      confirmMessage: 'Esta acción no se puede deshacer.',
      onConfirmed,
    });

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    // Esperar resolución de promesas
    await vi.waitFor(() => expect(onConfirmed).toHaveBeenCalledOnce());

    document.body.removeChild(root);
  });

  it('no debe ejecutar onConfirmed cuando el usuario cancela', async () => {
    confirmSpy.mockResolvedValue(false);
    const onConfirmed = vi.fn();

    const root = document.createElement('div');
    document.body.appendChild(root);
    mount(root, {
      label: 'Eliminar',
      confirmTitle: '¿Eliminar?',
      confirmMessage: '¿Seguro?',
      onConfirmed,
    });

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    await vi.waitFor(() => expect(confirmSpy).toHaveBeenCalledOnce());
    expect(onConfirmed).not.toHaveBeenCalled();

    document.body.removeChild(root);
  });

  it('debe deshabilitar el botón durante la ejecución async', async () => {
    confirmSpy.mockResolvedValue(true);
    let resolveAction!: () => void;
    const pendingAction = new Promise<void>((res) => {
      resolveAction = res;
    });
    const onConfirmed = vi.fn().mockReturnValue(pendingAction);

    const root = document.createElement('div');
    document.body.appendChild(root);
    mount(root, {
      label: 'Procesar',
      confirmTitle: '¿Procesar?',
      confirmMessage: '¿Seguro?',
      onConfirmed,
    });

    const btn = root.querySelector<HTMLButtonElement>('button');
    btn?.click();

    // Esperar que el confirm se llame y el botón se deshabilite
    await vi.waitFor(() => expect(onConfirmed).toHaveBeenCalled());
    expect(btn?.disabled).toBe(true);
    expect(btn?.querySelector('.spinner-border')).not.toBeNull();

    // Resolver la acción — el botón debe restaurarse
    resolveAction();
    await vi.waitFor(() => expect(btn?.disabled).toBe(false));

    document.body.removeChild(root);
  });
});
