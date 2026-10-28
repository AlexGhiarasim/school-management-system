import { useTranslation } from 'react-i18next';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { formatShortDate } from '../../../utils/format.ts';
import type { StudentGrade, SubjectAverage } from '../types.ts';
import { GradeBadge } from './GradeBadge.tsx';

const MAX_GRADE = 10;

interface SubjectAveragesProps {
  subjects: SubjectAverage[];
  grades: StudentGrade[];
  // Optional name of the teacher of each subject, by subject id.
  teachers?: Record<number, string>;
}

export function SubjectAverages({
  subjects,
  grades,
  teachers,
}: SubjectAveragesProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();

  return (
    <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((item) => {
        const subjectGrades = grades.filter(
          (grade) => grade.subject.id === item.subjectId,
        );

        const average = Math.round(item.average);

        return (
          <li
            key={item.subjectId}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">
                  {subjectName(item.subject)}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {t('student.grades.bySubject.gradesCount', {
                    count: item.count,
                  })}
                </p>
                {teachers?.[item.subjectId] && (
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {teachers[item.subjectId]}
                  </p>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">{average}</p>
            </div>
            <div
              role="progressbar"
              aria-label={subjectName(item.subject)}
              aria-valuemin={0}
              aria-valuemax={MAX_GRADE}
              aria-valuenow={average}
              className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(average / MAX_GRADE) * 100}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {subjectGrades.map((grade) => (
                <li
                  key={grade.id}
                  className="flex items-center justify-between gap-3"
                >
                  <GradeBadge value={grade.value} />
                  <span className="text-sm text-slate-500">
                    {formatShortDate(grade.date, language)}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
