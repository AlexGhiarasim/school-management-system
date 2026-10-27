const FAILING_GRADE = 5;
const GOOD_GRADE = 8;

export function gradeTone(value: number): string {
  if (value < FAILING_GRADE) return 'bg-rose-50 text-rose-800';
  if (value < GOOD_GRADE) return 'bg-amber-50 text-amber-800';
  return 'bg-emerald-50 text-emerald-800';
}
