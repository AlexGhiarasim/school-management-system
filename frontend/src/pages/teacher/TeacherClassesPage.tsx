import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { useTeacherClasses } from '../../features/teacher/hooks.ts';
import { paths } from '../../routes/paths.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function TeacherClassesPage() {
  const { t } = useTranslation();
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

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      )}

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
                className={`${CARD} block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200`}
              >
                <p className="text-4xl font-bold tracking-tight text-indigo-600">
                  {schoolClass.name}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {t('teacher.classes.students', {
                    count: schoolClass.studentCount,
                  })}
                </p>
                <p className="mt-4 text-sm font-medium text-indigo-600">
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
