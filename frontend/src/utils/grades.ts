export function gradeTone(value: number): string {
  if (value >= 9) return 'bg-emerald-100 text-emerald-800';
  if (value >= 7) return 'bg-indigo-100 text-indigo-800';
  if (value >= 5) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function averageTone(value: number): string {
  if (value >= 9) return 'text-emerald-600';
  if (value >= 7) return 'text-indigo-600';
  if (value >= 5) return 'text-amber-600';
  return 'text-red-600';
}
