import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { useStudentProfile } from '../../features/student/hooks.ts';
import { formatDate } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function StudentProfilePage() {
  const { t, i18n } = useTranslation();
  const { data, isPending, isError, refetch } = useStudentProfile();

  return (
    <section>
      <PageHeader
        title={t('nav.student.profile')}
        description={t('student.profile.description')}
      />

      {isError && (
        <div className={CARD}>
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}

      {isPending && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD} space-y-4 lg:col-span-2`}>
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
          <div className={`${CARD} space-y-3`}>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      )}

      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD} lg:col-span-2`}>
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700"
              >
                {data.firstName[0]}
                {data.lastName[0]}
              </span>
              <div>
                <p className="text-xl font-semibold text-slate-900">
                  {data.firstName} {data.lastName}
                </p>
                <p className="text-sm text-slate-500">{t('roles.STUDENT')}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">
                  {t('student.profile.fields.firstName')}
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {data.firstName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">
                  {t('student.profile.fields.lastName')}
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {data.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">
                  {t('student.profile.fields.email')}
                </dt>
                <dd className="mt-1 font-medium break-all text-slate-900">
                  {data.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">
                  {t('student.profile.fields.dateOfBirth')}
                </dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {formatDate(data.dateOfBirth, i18n.resolvedLanguage ?? 'ro')}
                </dd>
              </div>
            </dl>
          </div>

          <div className={CARD}>
            <p className="text-sm text-slate-500">
              {t('student.profile.fields.class')}
            </p>
            {data.class ? (
              <p className="mt-2 text-4xl font-bold tracking-tight text-indigo-600">
                {data.class.name}
              </p>
            ) : (
              <div className="mt-2">
                <p className="font-medium text-slate-900">
                  {t('student.profile.noClass.title')}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t('student.profile.noClass.description')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
