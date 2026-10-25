import { gradeTone } from '../../../utils/grades.ts';

export function GradeBadge({ value }: { value: number }) {
  return (
    <span
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-semibold ${gradeTone(value)}`}
    >
      {value}
    </span>
  );
}
