import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { useTeacherClasses } from '../../features/teacher/hooks.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function TeacherClassesPage() {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { data, isPending, isError, refetch } = useTeacherClasses();

  return (
    <section>
      <PageHeader
        title={t('nav.teacher.classes')}
        description={t('teacher.classes.description')}
      />

      {isError && (
        <div className={CARD}>
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}

      {isPending && <LoadingPanel />}

      {data && data.length === 0 && (
        <div className={CARD}>
          <EmptyState
            title={t('teacher.classes.empty.title')}
            description={t('teacher.classes.empty.description')}
          />
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((schoolClass) => (
            <li key={schoolClass.id}>
              <Link
                to={paths.teacher.classStudents(schoolClass.id)}
                className={`${CARD} block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-4xl font-bold tracking-tight text-brand-600">
                    {schoolClass.name}
                  </p>
                  {schoolClass.isHomeroom && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[13px] font-medium text-slate-700">
                      {t('teacher.classes.homeroom')}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[15px] text-slate-500">
                  {t('teacher.classes.students', {
                    count: schoolClass.studentCount,
                  })}
                </p>
                {schoolClass.subjects.length > 0 && (
                  <ul className="mt-3 space-y-0.5">
                    {schoolClass.subjects.map((subject) => (
                      <li
                        key={subject.id}
                        className="text-lg font-semibold text-slate-800"
                      >
                        {subjectName(subject.name)}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 text-[15px] font-medium text-brand-600">
                  {t('teacher.classes.open')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
