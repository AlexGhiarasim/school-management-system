import type { SubjectAverage } from '../features/student/types.ts';

const FAILING_GRADE = 5;
const GOOD_GRADE = 8;

interface SubjectGrade {
  value: number;
  subject: { id: number; name: string };
}

export function averageBySubject(grades: SubjectGrade[]): SubjectAverage[] {
  const groups = new Map<number, { name: string; values: number[] }>();

  for (const { value, subject } of grades) {
    const group = groups.get(subject.id) ?? { name: subject.name, values: [] };
    group.values.push(value);
    groups.set(subject.id, group);
  }

  return [...groups.entries()]
    .map(([subjectId, { name, values }]) => ({
      subjectId,
      subject: name,
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      count: values.length,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

// Same rule as the API: the mean of the averages rounded per subject.
export function overallAverage(subjects: SubjectAverage[]): number | null {
  if (subjects.length === 0) return null;

  const sum = subjects.reduce(
    (total, { average }) => total + Math.round(average),
    0,
  );

  return Math.round((sum / subjects.length) * 100) / 100;
}

export function gradeTone(value: number): string {
  if (value < FAILING_GRADE) return 'bg-rose-50 text-rose-800';
  if (value < GOOD_GRADE) return 'bg-amber-50 text-amber-800';
  return 'bg-emerald-50 text-emerald-800';
}
