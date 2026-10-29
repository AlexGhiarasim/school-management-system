interface StudentMetricProps {
  label: string;
  value: string | number;
  compact?: boolean;
  progress?: number | null;
}

export function StudentMetric({
  label,
  value,
  compact = false,
  progress,
}: StudentMetricProps) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-slate-300 bg-white shadow-sm ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
    >
      <dt
        className={`font-medium tracking-wide text-slate-600 uppercase ${compact ? 'text-[11px]' : 'text-xs'}`}
      >
        {label}
      </dt>
      <dd
        className={`mt-3 font-semibold tracking-tight text-slate-900 tabular-nums ${compact ? 'text-3xl' : 'text-4xl'}`}
      >
        {value}
      </dd>
      {progress != null && (
        <div
          aria-hidden="true"
          className="mt-3 h-1 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
