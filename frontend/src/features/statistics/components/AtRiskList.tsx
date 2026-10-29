import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { fullName } from '../../../utils/format.ts';
import { FailingSubjects } from './FailingSubjects.tsx';

interface AtRiskStudent {
  studentId: number;
  firstName: string;
  lastName: string;
  className: string | null;
  failingSubjects: { subject: string; average: number }[];
}

interface AtRiskListProps {
  students: AtRiskStudent[];
  studentLink: (studentId: number) => string;
  // Leave the class out when the whole list is about one class.
  showClass?: boolean;
}

export function AtRiskList({
  students,
  studentLink,
  showClass = true,
}: AtRiskListProps) {
  const { t } = useTranslation();

  if (students.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {t('admin.statistics.atRisk.none')}
      </p>
    );
  }

  return (
    <ul className="max-h-96 divide-y divide-slate-200 overflow-y-auto pr-1">
      {students.map((student) => (
        <li
          key={student.studentId}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
        >
          <span className="min-w-0 flex-1">
            <Link
              to={studentLink(student.studentId)}
              className="font-medium text-slate-900 hover:text-brand-600"
            >
              {fullName(student)}
            </Link>
            {showClass && (
              <span className="ml-2 text-sm text-slate-500">
                {student.className ?? '-'}
              </span>
            )}
          </span>
          <FailingSubjects subjects={student.failingSubjects} />
        </li>
      ))}
    </ul>
  );
}
