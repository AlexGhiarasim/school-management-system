import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LinkButton } from '../../components/ui/LinkButton.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { useTeacherClasses } from '../../features/teacher/hooks.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function TeacherClassesPage() {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { data, isPending, isError, refetch } = useTeacherClasses();

  const homeroom = data?.find((schoolClass) => schoolClass.isHomeroom);
  // A class that the teacher only leads has its own page, under the class teacher.
  const teaching =
    data?.filter(
      (schoolClass) =>
        !schoolClass.isHomeroom || schoolClass.subjects.length > 0,
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

      {isPending && <LoadingPanel />}

      {data && data.length === 0 && (
        <div className={CARD}>
          <EmptyState
            title={t('teacher.classes.empty.title')}
            description={t('teacher.classes.empty.description')}
          />
        </div>
      )}

      {homeroom && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-l-brand-600 bg-white p-6 shadow-sm ring-1 ring-slate-300">
          <div>
            <p className="text-[13px] font-semibold tracking-wide text-brand-700 uppercase">
              {t('teacher.homeroom.badge')}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {t('teacher.classes.homeroomCallout.title', {
                name: homeroom.name,
              })}
            </p>
            <p className="mt-1 text-[15px] text-slate-600">
              {t('teacher.classes.homeroomCallout.description')}
            </p>
          </div>
          <LinkButton to={paths.teacher.homeroom} variant="primary">
            {t('teacher.classes.homeroomCallout.action', {
              name: homeroom.name,
            })}
          </LinkButton>
        </div>
      )}

      {data && data.length > 0 && teaching.length === 0 && (
        <div className={CARD}>
          <EmptyState title={t('teacher.classes.noTeaching')} />
        </div>
      )}

      {teaching.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {t('teacher.classes.teachingTitle', { count: teaching.length })}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teaching.map((schoolClass) => (
              <li key={schoolClass.id}>
                <Link
                  to={paths.teacher.classStudents(schoolClass.id)}
                  className={`${CARD} block h-full transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200`}
                >
                  <p className="text-4xl font-bold tracking-tight text-brand-600">
                    {schoolClass.name}
                  </p>
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
        </>
      )}
    </section>
  );
}
