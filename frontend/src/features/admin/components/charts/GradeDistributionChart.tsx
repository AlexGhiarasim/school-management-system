import { useTranslation } from 'react-i18next';
import { gradeBand, type GradeBand } from '../../../../utils/grades.ts';

const BARS: Record<GradeBand, string> = {
  failing:
    'border-rose-500 group-hover:bg-rose-500/10 group-focus-visible:bg-rose-500/10',
  fair: 'border-amber-500 group-hover:bg-amber-500/10 group-focus-visible:bg-amber-500/10',
  good: 'border-emerald-500 group-hover:bg-emerald-500/10 group-focus-visible:bg-emerald-500/10',
};
// The same colors as the borders (Tailwind 500), for the stripes inside.
const STRIPES: Record<GradeBand, string> = {
  failing: '#f43f5e',
  fair: '#f59e0b',
  good: '#10b981',
};

// Diagonal stripes: a line of `line` px every `gap` px.
function hatch(band: GradeBand, line: number, gap: number) {
  return `repeating-linear-gradient(45deg, ${STRIPES[band]} 0 ${line}px, transparent ${line}px ${gap}px)`;
}

const SWATCHES: Record<GradeBand, string> = {
  failing: 'border-rose-500',
  fair: 'border-amber-500',
  good: 'border-emerald-500',
};

interface GradeDistributionChartProps {
  distribution: { value: number; count: number }[];
}

export function GradeDistributionChart({
  distribution,
}: GradeDistributionChartProps) {
  const { t, i18n } = useTranslation();
  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(1, ...distribution.map((item) => item.count));
  const percent = (count: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(total === 0 ? 0 : count / total);

  return (
    <>
      <ol
        aria-label={t('admin.statistics.distribution.title')}
        className="mb-7 flex h-56 items-end gap-1 border-b border-slate-200 sm:gap-2"
      >
        {distribution.map(({ value, count }) => {
          const label = t('admin.statistics.distribution.bar', {
            grade: value,
            count,
            percent: percent(count),
          });

          return (
            <li
              key={value}
              tabIndex={0}
              aria-label={label}
              className="group relative flex h-full flex-1 flex-col items-center justify-end focus:outline-none"
            >
              <span className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block">
                <strong className="font-semibold">{count}</strong>{' '}
                <span className="text-slate-300">
                  {t('admin.statistics.distribution.tooltip', {
                    grade: value,
                    percent: percent(count),
                  })}
                </span>
              </span>
              <span className="mb-1 text-[11px] font-medium text-slate-500 tabular-nums">
                {count}
              </span>
              <span
                className={`w-full max-w-6 rounded-t border-2 border-b-0 transition ${count === 0 ? 'border-transparent' : BARS[gradeBand(value)]}`}
                style={{
                  height: `${(count / max) * 80}%`,
                  backgroundImage: hatch(gradeBand(value), 1.5, 7),
                }}
              />
              <span className="absolute top-full mt-2 text-xs font-medium text-slate-600 tabular-nums">
                {value}
              </span>
            </li>
          );
        })}
      </ol>
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-slate-600">
        {(Object.keys(SWATCHES) as GradeBand[]).map((band) => (
          <li key={band} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3.5 w-3.5 rounded-sm border-2 ${SWATCHES[band]}`}
              style={{ backgroundImage: hatch(band, 1, 4) }}
            />
            {t(`admin.statistics.distribution.legend.${band}`)}
          </li>
        ))}
      </ul>
    </>
  );
}
