import { useTranslation } from 'react-i18next';
import type { PaginationMeta } from '../../types/api.ts';
import { Button } from './Button.tsx';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
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
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">
          {t('common.pagination.summary', { page, totalPages })}
        </span>
        <Button
          variant="secondary"
          fullWidth={false}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('common.pagination.previous')}
        </Button>
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
