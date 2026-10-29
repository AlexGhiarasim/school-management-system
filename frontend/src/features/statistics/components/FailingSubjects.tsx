import { useSubjectName } from '../../../hooks/useSubjectName.ts';

interface FailingSubjectsProps {
  subjects: { subject: string; average: number }[];
}

// The subjects a student fails, each with its grade.
export function FailingSubjects({ subjects }: FailingSubjectsProps) {
  const subjectName = useSubjectName();

  return (
    <span className="flex flex-wrap justify-end gap-1.5">
      {subjects.map(({ subject, average }) => (
        <span
          key={subject}
          className="inline-flex items-center gap-2 rounded-full bg-rose-50 py-0.5 pr-1 pl-3 text-sm font-medium text-rose-800"
        >
          {subjectName(subject)}
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold tabular-nums">
            {average}
          </span>
        </span>
      ))}
    </span>
  );
}
