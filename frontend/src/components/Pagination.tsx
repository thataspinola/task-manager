/**
 * Controles Anterior / Próxima.
 * Some se só existir 1 página (`totalPages <= 1`).
 */
import type { PaginationMeta } from '../types/task';

type PaginationProps = {
  meta: PaginationMeta;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export function Pagination({
  meta,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  if (meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Paginação">
      <button
        className="button button-secondary"
        type="button"
        disabled={disabled || !hasPrevious}
        onClick={() => onPageChange(meta.page - 1)}
      >
        Anterior
      </button>

      <span>
        Página <strong>{meta.page}</strong> de{' '}
        <strong>{meta.totalPages}</strong>
      </span>

      <button
        className="button button-secondary"
        type="button"
        disabled={disabled || !hasNext}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Próxima
      </button>
    </nav>
  );
}
