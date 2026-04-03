import { describe, it, expect, vi, beforeEach } from 'vitest';

import { confirm } from './confirm-dialog';

// Mock de SweetAlert2 para evitar interacción con el DOM real
vi.mock('sweetalert2/dist/sweetalert2.js', () => ({
  default: {
    fire: vi.fn(),
  },
}));

// Tests del componente ConfirmDialog
describe('ConfirmDialog — confirm()', () => {
  let mockSwal: { fire: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const swal = await import('sweetalert2/dist/sweetalert2.js');
    mockSwal = swal.default as unknown as { fire: ReturnType<typeof vi.fn> };
    mockSwal.fire.mockClear();
  });

  it('debe retornar true cuando el usuario confirma', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    const result = await confirm({
      title: '¿Eliminar?',
      message: 'Esta acción no se puede deshacer.',
    });

    expect(result).toBe(true);
  });

  it('debe retornar false cuando el usuario cancela', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: false });

    const result = await confirm({
      title: '¿Eliminar?',
      message: 'Esta acción no se puede deshacer.',
    });

    expect(result).toBe(false);
  });

  it('debe llamar a Swal.fire con el título y mensaje correctos', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({ title: 'Confirmar eliminación', message: '¿Estás seguro?' });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirmar eliminación',
        html: '¿Estás seguro?',
      })
    );
  });

  it('debe usar labels por defecto "Confirmar" y "Cancelar"', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({ title: 'Prueba', message: 'Mensaje' });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      })
    );
  });

  it('debe usar labels personalizados cuando se proporcionan', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({
      title: 'Prueba',
      message: 'Mensaje',
      confirmLabel: 'Sí, eliminar',
      cancelLabel: 'No, volver',
    });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No, volver',
      })
    );
  });

  it('debe aplicar la variante danger por defecto al botón de confirmación', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({ title: 'Prueba', message: 'Mensaje' });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        customClass: expect.objectContaining({
          confirmButton: expect.stringContaining('btn-danger') as unknown,
        }) as unknown,
      })
    );
  });

  it('debe aplicar la variante warning cuando se especifica', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({ title: 'Prueba', message: 'Mensaje', variant: 'warning' });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        customClass: expect.objectContaining({
          confirmButton: expect.stringContaining('btn-warning') as unknown,
        }) as unknown,
      })
    );
  });

  it('debe deshabilitar buttonsStyling para usar clases Bootstrap', async () => {
    mockSwal.fire.mockResolvedValue({ isConfirmed: true });

    await confirm({ title: 'Prueba', message: 'Mensaje' });

    expect(mockSwal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        buttonsStyling: false,
      })
    );
  });
});
