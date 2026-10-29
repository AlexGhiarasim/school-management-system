import { useTranslation } from 'react-i18next';

interface ClearFiltersProps {
  visible: boolean;
  onClear: () => void;
}

// Shows up only while a filter is set, and puts every filter back to "all".
export function ClearFilters({ visible, onClear }: ClearFiltersProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClear}
      className="animate-fade-in -mt-2 mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700 focus:outline-none focus-visible:underline"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
      {t('common.clearFilters')}
    </button>
  );
}
