import { useTranslation } from 'react-i18next';
import { Logo } from '../../../components/layout/Logo.tsx';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { averageBySubject, overallAverage } from '../../../utils/grades.ts';
import { formatDate, formatNumber } from '../../../utils/format.ts';
import type { StudentGrade, StudentProfile } from '../types.ts';

const PASSING_GRADE = 5;
const TODAY = new Date().toISOString();

interface ReportCardProps {
  student: Pick<
    StudentProfile,
    'firstName' | 'lastName' | 'email' | 'dateOfBirth' | 'class'
  >;
  grades: Pick<StudentGrade, 'id' | 'value' | 'date' | 'subject'>[];
}

// A school report laid out as a document, so it also prints well.
export function ReportCard({ student, grades }: ReportCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const subjects = averageBySubject(grades);
  const average = overallAverage(subjects);
  const failing = subjects.filter(
    (subject) => Math.round(subject.average) < PASSING_GRADE,
  );

  const info = [
    {
      label: t('report.student'),
      value: `${student.lastName} ${student.firstName}`,
    },
    { label: t('report.class'), value: student.class?.name ?? '-' },
    {
      label: t('report.dateOfBirth'),
      value: formatDate(student.dateOfBirth, language),
    },
    { label: t('auth.fields.email'), value: student.email },
  ];

  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-[18mm] print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Logo className="h-10 w-10 print:hidden" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('report.title')}
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {t('report.issued', {
            date: formatDate(TODAY, language),
          })}
        </p>
      </header>

      <dl className="grid gap-x-8 gap-y-3 border-b border-slate-200 py-6 sm:grid-cols-2">
        {info.map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {item.label}
            </dt>
            <dd className="mt-0.5 font-medium text-slate-900 [overflow-wrap:anywhere]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {subjects.length === 0 ? (
        <p className="py-8 text-center text-slate-500">
          {t('report.noGrades')}
        </p>
      ) : (
        <table className="mt-6 w-full text-left text-[15px]">
          <caption className="sr-only">{t('report.title')}</caption>
          <thead className="border-b border-slate-300 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
            <tr>
              <th scope="col" className="py-2 pr-4">
                {t('report.subject')}
              </th>
              <th scope="col" className="py-2 pr-4">
                {t('report.grades')}
              </th>
              <th scope="col" className="py-2 text-right">
                {t('report.average')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((subject) => {
              const rounded = Math.round(subject.average);

              return (
                <tr key={subject.subjectId} className="break-inside-avoid">
                  <td className="py-3 pr-4 font-medium text-slate-900">
                    {subjectName(subject.subject)}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 tabular-nums">
                    {grades
                      .filter((grade) => grade.subject.id === subject.subjectId)
                      .map((grade) => grade.value)
                      .join(', ')}
                  </td>
                  <td
                    className={`py-3 text-right font-semibold tabular-nums ${rounded < PASSING_GRADE ? 'text-rose-700' : 'text-slate-900'}`}
                  >
                    {rounded}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-300">
            <tr>
              <th scope="row" colSpan={2} className="pt-4 text-slate-900">
                {t('report.overall')}
              </th>
              <td className="pt-4 text-right text-xl font-bold text-slate-900 tabular-nums">
                {average === null ? '-' : formatNumber(average, language)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {subjects.length > 0 && (
        <p
          className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${failing.length === 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}
        >
          {failing.length === 0
            ? t('report.passed')
            : t('report.failing', {
                subjects: failing
                  .map((subject) => subjectName(subject.subject))
                  .join(', '),
              })}
        </p>
      )}
    </article>
  );
}
