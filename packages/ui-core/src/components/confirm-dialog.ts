// Componente ConfirmDialog — diálogo de confirmación usando SweetAlert2
import Swal from 'sweetalert2/dist/sweetalert2.js';

/** Props para el componente ConfirmDialog */
export interface NgrConfirmDialogProps {
  /** Título del diálogo */
  title: string;
  /** Mensaje HTML del cuerpo del diálogo */
  message: string;
  /** Texto del botón de confirmación (por defecto 'Confirmar') */
  confirmLabel?: string;
  /** Texto del botón de cancelación (por defecto 'Cancelar') */
  cancelLabel?: string;
  /** Variante de color del botón de confirmación (por defecto 'danger') */
  variant?: 'danger' | 'warning';
}

/**
 * Muestra un diálogo de confirmación con SweetAlert2.
 * Devuelve una promesa que resuelve a true si el usuario confirmó, false si canceló.
 * No usa render() ni init() — es una API imperativa asíncrona.
 */
export async function confirm(props: NgrConfirmDialogProps): Promise<boolean> {
  const {
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
  } = props;

  const result = await Swal.fire({
    title,
    html: message,
    showCancelButton: true,
    confirmButtonText: confirmLabel,
    cancelButtonText: cancelLabel,
    // Clases Bootstrap para los botones — deshabilitar estilos propios de Swal
    customClass: {
      confirmButton: `btn btn-${variant} me-2`,
      cancelButton: 'btn btn-secondary',
    },
    buttonsStyling: false,
    // El foco queda atrapado dentro del diálogo por SweetAlert2 automáticamente
    focusConfirm: false,
  });

  return result.isConfirmed;
}
