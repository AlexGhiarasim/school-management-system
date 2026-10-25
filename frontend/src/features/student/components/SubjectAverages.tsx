import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../../utils/format.ts';
import { averageTone } from '../../../utils/grades.ts';
import type { SubjectAverage } from '../types.ts';

const MAX_GRADE = 10;

export function SubjectAverages({ subjects }: { subjects: SubjectAverage[] }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((item) => (
        <li
          key={item.subjectId}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{item.subject}</p>
              <p className="mt-0.5 text-sm text-slate-500">
                {t('student.grades.bySubject.gradesCount', {
                  count: item.count,
                })}
              </p>
            </div>
            <p className={`text-2xl font-bold ${averageTone(item.average)}`}>
              {formatNumber(item.average, language)}
            </p>
          </div>
          <div
            role="progressbar"
            aria-label={item.subject}
            aria-valuemin={0}
            aria-valuemax={MAX_GRADE}
            aria-valuenow={item.average}
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${(item.average / MAX_GRADE) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
