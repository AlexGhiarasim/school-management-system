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
  framed?: boolean;
}

export function SubjectAverages({
  subjects,
  grades,
  teachers,
  framed = false,
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
            className={
              framed
                ? 'rounded-xl border border-slate-300 bg-white p-4 shadow-sm'
                : 'rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200'
            }
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
                  <p className="mt-1 text-base font-medium text-slate-700">
                    <span className="font-normal text-slate-500">
                      {t('student.grades.table.teacher')}:
                    </span>{' '}
                    {teachers[item.subjectId]}
                  </p>
                )}
              </div>
              <p
                className={
                  framed
                    ? 'flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-2 text-xl font-semibold text-slate-900 tabular-nums'
                    : 'text-2xl font-bold text-slate-900'
                }
              >
                {average}
              </p>
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

            <ul
              className={
                framed
                  ? 'mt-4 divide-y divide-slate-200 border-t border-slate-300 [&>li]:py-2.5 [&>li:last-child]:pb-0'
                  : 'mt-4 space-y-2 border-t border-slate-100 pt-4'
              }
            >
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
