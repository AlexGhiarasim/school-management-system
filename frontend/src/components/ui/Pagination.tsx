import { useTranslation } from 'react-i18next';
import type { PaginationMeta } from '../../types/api.ts';
import { Button } from './Button.tsx';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const MAX_VISIBLE_PAGES = 7;

function visiblePages(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? [null, value] : [value],
  );
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const { page, totalPages, total } = meta;

  if (total === 0) return null;

  return (
    <nav
      aria-label={t('common.pagination.label')}
      className="flex flex-wrap items-center justify-between gap-3 pt-4"
    >
      <p className="text-sm text-slate-500">
        {t('common.pagination.total', { count: total })}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          variant="secondary"
          fullWidth={false}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('common.pagination.previous')}
        </Button>
        {visiblePages(page, totalPages).map((value, index) =>
          value === null ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={value}
              type="button"
              aria-label={t('common.pagination.page', { page: value })}
              aria-current={value === page ? 'page' : undefined}
              onClick={() => onPageChange(value)}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors ${
                value === page
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {value}
            </button>
          ),
        )}
        <Button
          variant="secondary"
          fullWidth={false}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('common.pagination.next')}
        </Button>
      </div>
    </nav>
  );
}
