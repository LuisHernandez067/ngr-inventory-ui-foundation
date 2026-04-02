// Patrón Pagination — control de paginación con elipsis y navegación accesible
import type { ComponentProps } from '../types';

/** Props para el componente Pagination */
export interface PaginationProps extends ComponentProps {
  /** Página actual (1-indexado) */
  currentPage: number;
  /** Total de páginas disponibles */
  totalPages: number;
}

/**
 * Genera la lista de páginas a mostrar.
 * Siempre incluye página 1, última página, currentPage ± 1.
 * Usa null para representar elipsis en rangos omitidos.
 *
 * Ejemplo: current=5, total=10 → [1, null, 4, 5, 6, null, 10]
 */
function buildPageList(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    // Sin elipsis — mostrar todas las páginas
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  // Páginas cercanas a la actual
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | null)[] = [];

  // Insertar null donde hay saltos en la secuencia
  for (let i = 0; i < sorted.length; i++) {
    // Con noUncheckedIndexedAccess los accesos por índice pueden ser undefined.
    // Usamos optional chaining + fallback para evitar non-null assertions prohibidas.
    const current = sorted[i] ?? 0;
    const prev = sorted[i - 1] ?? 0;
    if (i > 0 && current - prev > 1) {
      result.push(null); // elipsis
    }
    result.push(current);
  }

  return result;
}

/**
 * Renderiza el HTML del control de paginación.
 * Accesible con nav aria-label="Paginación".
 */
export function render(props: PaginationProps): string {
  const { currentPage, totalPages, id, className } = props;

  const idAttr = id ? ` id="${id}"` : '';
  const extraClass = className ? ` ${className}` : '';

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const pages = buildPageList(currentPage, totalPages);

  const pageItems = pages
    .map((page, _idx) => {
      if (page === null) {
        // Elemento de elipsis
        return `<li class="page-item disabled" aria-hidden="true"><span class="page-link">…</span></li>`;
      }
      const isActive = page === currentPage;
      const pageStr = String(page);
      return (
        `<li class="page-item${isActive ? ' active' : ''}" ${isActive ? 'aria-current="page"' : ''}>` +
        `<button type="button" class="page-link" data-page="${pageStr}" ${isActive ? 'aria-disabled="true"' : ''}>${pageStr}</button>` +
        `</li>`
      );
    })
    .join('');

  return (
    `<nav${idAttr} class="ngr-pagination${extraClass}" aria-label="Paginación">` +
    `<ul class="pagination justify-content-center mb-0">` +
    `<li class="page-item${prevDisabled ? ' disabled' : ''}">` +
    `<button type="button" class="page-link" data-page="${String(currentPage - 1)}" ` +
    `${prevDisabled ? 'disabled aria-disabled="true"' : ''} aria-label="Página anterior">` +
    `<i class="bi bi-chevron-left" aria-hidden="true"></i></button>` +
    `</li>` +
    pageItems +
    `<li class="page-item${nextDisabled ? ' disabled' : ''}">` +
    `<button type="button" class="page-link" data-page="${String(currentPage + 1)}" ` +
    `${nextDisabled ? 'disabled aria-disabled="true"' : ''} aria-label="Página siguiente">` +
    `<i class="bi bi-chevron-right" aria-hidden="true"></i></button>` +
    `</li>` +
    `</ul>` +
    `</nav>`
  );
}

/**
 * Inicializa los listeners de paginación.
 * Emite 'ngr:page-change' al hacer clic en un número de página o en anterior/siguiente.
 */
export function init(root: HTMLElement): void {
  root.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>('[data-page]');
    if (!btn || btn.hasAttribute('disabled')) return;

    const page = parseInt(btn.getAttribute('data-page') ?? '', 10);
    if (isNaN(page) || page < 1) return;

    // Emitir evento de cambio de página
    root.dispatchEvent(
      new CustomEvent('ngr:page-change', {
        bubbles: true,
        detail: { page },
      })
    );
  });
}
