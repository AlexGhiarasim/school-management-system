import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../../utils/format.ts';

const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 32 };
const TICKS = [2, 4, 6, 8, 10];
const MAX_GRADE = 10;

interface WeeklyTrendChartProps {
  trend: { weekStart: string; average: number | null; grades: number }[];
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(600);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function WeeklyTrendChart({ trend }: WeeklyTrendChartProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const points = trend.filter((week) => week.average !== null);
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const x = (index: number) =>
    PADDING.left +
    (points.length === 1
      ? plotWidth / 2
      : (index / (points.length - 1)) * plotWidth);
  const y = (value: number) =>
    PADDING.top + plotHeight - (value / MAX_GRADE) * plotHeight;

  const weekLabel = (date: string) =>
    new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    }).format(new Date(date));

  const line = points
    .map((week, index) => `${x(index)},${y(week.average ?? 0)}`)
    .join(' ');
  const area = `${x(0)},${y(0)} ${line} ${x(points.length - 1)},${y(0)}`;

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - bounds.left;
    let nearest = 0;

    points.forEach((_, index) => {
      if (Math.abs(x(index) - offset) < Math.abs(x(nearest) - offset)) {
        nearest = index;
      }
    });

    setActive(nearest);
  }

  const current = active === null ? null : points[active];

  return (
    <div ref={ref} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={t('admin.statistics.trend.title')}
        onPointerMove={handlePointer}
        onPointerLeave={() => setActive(null)}
        className="block touch-none"
      >
        {TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-slate-200"
            />
            <text
              x={PADDING.left - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-500 text-[11px] tabular-nums"
            >
              {tick}
            </text>
          </g>
        ))}

        <polygon points={area} className="fill-slate-500/10" />
        <polyline
          points={line}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          className="stroke-slate-700"
        />

        {current && active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={PADDING.top}
            y2={PADDING.top + plotHeight}
            className="stroke-slate-300"
          />
        )}

        {points.map((week, index) => (
          <g key={week.weekStart}>
            <circle
              cx={x(index)}
              cy={y(week.average ?? 0)}
              r={active === index ? 5 : 4}
              strokeWidth={2}
              className={`stroke-white ${active === index ? 'fill-brand-600' : 'fill-slate-700'}`}
            />
            <text
              x={x(index)}
              y={HEIGHT - 8}
              textAnchor="middle"
              className="fill-slate-500 text-[11px]"
            >
              {weekLabel(week.weekStart)}
            </text>
          </g>
        ))}
      </svg>

      {current && active !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
          style={{
            left: x(active),
            top: Math.max(0, y(current.average ?? 0) - 52),
          }}
        >
          <strong className="block text-sm font-semibold">
            {formatNumber(current.average ?? 0, language)}
          </strong>
          <span className="text-slate-300">
            {t('admin.statistics.trend.tooltip', {
              week: weekLabel(current.weekStart),
              count: current.grades,
            })}
          </span>
        </div>
      )}

      <table className="sr-only">
        <caption>{t('admin.statistics.trend.title')}</caption>
        <tbody>
          {points.map((week) => (
            <tr key={week.weekStart}>
              <th scope="row">{weekLabel(week.weekStart)}</th>
              <td>{formatNumber(week.average ?? 0, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
