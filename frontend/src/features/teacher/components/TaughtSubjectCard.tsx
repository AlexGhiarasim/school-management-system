import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { formatDate } from '../../../utils/format.ts';
import { GradeBadge } from '../../student/components/GradeBadge.tsx';
import type { Subject, TeacherGrade } from '../types.ts';

interface TaughtSubjectCardProps {
  subject: Subject;
  grades: TeacherGrade[];
  ownProfileId: number | undefined;
  onEdit: (grade: TeacherGrade) => void;
}

// The grades of one subject the teacher teaches, with the average on top. The
// teacher can change only the grades they gave.
export function TaughtSubjectCard({
  subject,
  grades,
  ownProfileId,
  onEdit,
}: TaughtSubjectCardProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();

  const average =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, grade) => sum + grade.value, 0) / grades.length,
        )
      : null;

  return (
    <article
      aria-label={subjectName(subject.name)}
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {subjectName(subject.name)}
          </h3>
          <p className="mt-0.5 text-[15px] text-slate-500">
            {t('student.grades.bySubject.gradesCount', {
              count: grades.length,
            })}
          </p>
        </div>
        {average !== null && (
          <div className="text-right">
            <p className="text-[13px] font-medium tracking-wide text-slate-500 uppercase">
              {t('teacher.studentGrades.average')}
            </p>
            <p className="text-2xl font-bold text-slate-900">{average}</p>
          </div>
        )}
      </div>

      {grades.length === 0 ? (
        <p className="mt-4 border-t border-slate-100 pt-4 text-[15px] text-slate-500">
          {t('teacher.studentGrades.taughtEmpty')}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {grades.map((grade) => (
            <li
              key={grade.id}
              className="flex flex-wrap items-center gap-3 py-2.5"
            >
              <GradeBadge value={grade.value} />
              <span className="text-[15px] text-slate-600">
                {formatDate(grade.date, language)}
              </span>
              {grade.teacher?.id === ownProfileId && (
                <Button
                  variant="secondary"
                  fullWidth={false}
                  className="ml-auto px-3 py-1 text-[13px]"
                  onClick={() => onEdit(grade)}
                >
                  {t('teacher.studentGrades.table.edit')}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
