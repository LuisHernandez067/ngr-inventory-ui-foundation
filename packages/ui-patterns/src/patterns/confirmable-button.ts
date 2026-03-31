// Patrón ConfirmableButton — botón de acción con confirmación previa y estado de carga
import { Button, ConfirmDialog } from '@ngr-inventory/ui-core';
import type { ComponentProps, ButtonVariant } from '../types';

/** Props para el componente ConfirmableButton */
export interface ConfirmableButtonProps extends ComponentProps {
  /** Texto visible del botón */
  label: string;
  /** Título del diálogo de confirmación */
  confirmTitle: string;
  /** Mensaje HTML del cuerpo del diálogo */
  confirmMessage: string;
  /** Variante del botón (por defecto 'danger') */
  variant?: ButtonVariant;
  /** Variante del diálogo de confirmación (por defecto 'danger') */
  confirmVariant?: 'danger' | 'warning';
  /** Ícono Bootstrap Icons opcional del botón */
  icon?: string;
  /** Callback invocado tras la confirmación */
  onConfirmed: () => Promise<void> | void;
  /** Valor del atributo data-action */
  dataAction?: string;
}

/**
 * Renderiza el HTML del botón confirmable.
 * Delega al componente Button.render() de ui-core.
 */
export function render(props: ConfirmableButtonProps): string {
  const { label, variant = 'danger', icon, dataAction, id, className } = props;
  return Button.render({ variant, label, icon, dataAction, id, className });
}

/**
 * Inicializa el botón confirmable.
 * Al hacer clic, muestra el diálogo de confirmación y ejecuta onConfirmed si el usuario acepta.
 * Durante la ejecución async, el botón se deshabilita con spinner.
 */
export function init(root: HTMLElement): void {
  const btn = root.querySelector<HTMLButtonElement>('button');
  if (!btn) return;

  // Guardar el contenido original para restaurarlo después
  const originalLabel = btn.innerHTML;

  btn.addEventListener('click', async () => {
    // Acceder a los props almacenados en el root como atributos de datos
    const title = root.getAttribute('data-confirm-title') ?? '¿Confirmar acción?';
    const message = root.getAttribute('data-confirm-message') ?? '¿Estás seguro?';
    const variant = (root.getAttribute('data-confirm-variant') ?? 'danger') as 'danger' | 'warning';
    const onConfirmed = (root as HTMLElement & { _onConfirmed?: () => Promise<void> | void })
      ._onConfirmed;

    if (!onConfirmed) return;

    // Mostrar diálogo de confirmación
    const confirmed = await ConfirmDialog.confirm({ title, message, variant });
    if (!confirmed) return;

    // Activar estado de carga en el botón
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span><span class="visually-hidden">Procesando...</span>`;

    try {
      await onConfirmed();
    } finally {
      // Restaurar el botón al estado original
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  });
}

/**
 * Monta el ConfirmableButton en un elemento raíz con todos sus props.
 * Almacena los callbacks necesarios en el elemento DOM.
 */
export function mount(root: HTMLElement, props: ConfirmableButtonProps): void {
  root.innerHTML = render(props);

  // Almacenar los datos de confirmación como atributos del root
  root.setAttribute('data-confirm-title', props.confirmTitle);
  root.setAttribute('data-confirm-message', props.confirmMessage);
  root.setAttribute('data-confirm-variant', props.confirmVariant ?? 'danger');

  // Almacenar el callback en el elemento (no serializable como atributo)
  (root as HTMLElement & { _onConfirmed?: () => Promise<void> | void })._onConfirmed =
    props.onConfirmed;

  init(root);
}
