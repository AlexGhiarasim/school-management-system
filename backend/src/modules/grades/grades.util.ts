export interface SubjectAverage {
  subjectId: number;
  subject: string;
  average: number;
  count: number;
}

export function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 100) / 100;
}

export function summarize(
  grades: { value: number; subject: { id: number; name: string } }[],
) {
  const bySubject = new Map<number, { name: string; values: number[] }>();

  for (const { value, subject } of grades) {
    const entry = bySubject.get(subject.id) ?? {
      name: subject.name,
      values: [],
    };
    entry.values.push(value);
    bySubject.set(subject.id, entry);
  }

  const subjects: SubjectAverage[] = [...bySubject.entries()]
    .map(([subjectId, { name, values }]) => ({
      subjectId,
      subject: name,
      average: average(values) as number,
      count: values.length,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  return {
    average: average(grades.map(({ value }) => value)),
    bySubject: subjects,
  };
}
