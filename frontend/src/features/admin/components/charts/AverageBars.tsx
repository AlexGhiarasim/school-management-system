import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../../utils/format.ts';

const MAX_GRADE = 10;

export interface AverageBar {
  id: number;
  label: string;
  detail: string;
  average: number | null;
}

interface AverageBarsProps {
  items: AverageBar[];
  // When given, each row becomes a button, for example to filter by a class.
  onSelect?: (id: number) => void;
}

export function AverageBars({ items, onSelect }: AverageBarsProps) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const value = item.average ?? 0;
        const content = (
          <>
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate font-medium text-slate-900">
                {item.label}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {item.detail}
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {item.average === null ? '-' : formatNumber(value, language)}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="mt-2 block h-2 overflow-hidden rounded-full bg-slate-100"
            >
              <span
                className="block h-full rounded-full bg-slate-700"
                style={{ width: `${(value / MAX_GRADE) * 100}%` }}
              />
            </span>
          </>
        );

        return (
          <li key={item.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="block w-full rounded-lg px-2 py-2 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
              >
                {content}
              </button>
            ) : (
              <div className="px-2 py-2">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
