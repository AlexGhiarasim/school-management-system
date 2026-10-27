import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { useTeacherClasses } from '../../features/teacher/hooks.ts';
import type { Subject, TeacherClass } from '../../features/teacher/types.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';

interface Card {
  schoolClass: TeacherClass;
  subject: Subject | null;
}

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function TeacherClassesPage() {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { data, isPending, isError, refetch } = useTeacherClasses();

  // One card per class and subject. A class teacher who teaches nothing in
  // the class still gets a card for it.
  const cards =
    data?.flatMap((schoolClass): Card[] =>
      schoolClass.subjects.length > 0
        ? schoolClass.subjects.map((subject) => ({ schoolClass, subject }))
        : [{ schoolClass, subject: null }],
    ) ?? [];

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
          {cards.map(({ schoolClass, subject }) => (
            <li key={`${schoolClass.id}-${subject?.id ?? 'homeroom'}`}>
              <Link
                to={paths.teacher.classStudents(schoolClass.id)}
                className={`${CARD} block transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-4xl font-bold tracking-tight text-indigo-600">
                    {schoolClass.name}
                  </p>
                  {schoolClass.isHomeroom && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {t('teacher.classes.homeroom')}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {t('teacher.classes.students', {
                    count: schoolClass.studentCount,
                  })}
                </p>
                {subject && (
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {subjectName(subject.name)}
                  </p>
                )}
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
