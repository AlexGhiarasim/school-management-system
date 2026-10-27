import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ProfileBanner } from '../../components/ui/ProfileBanner.tsx';
import { ProfileField } from '../../components/ui/ProfileField.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { ChangePasswordButton } from '../../features/auth/components/ChangePasswordCard.tsx';
import { GradeBadge } from '../../features/student/components/GradeBadge.tsx';
import {
  useClassOverview,
  useStudentGrades,
  useStudentProfile,
} from '../../features/student/hooks.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';
import { formatDate, formatNumber } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';
const RECENT_GRADES = 5;

export default function StudentProfilePage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const { data, isPending, isError, refetch } = useStudentProfile();
  const { data: grades } = useStudentGrades();
  const { data: classOverview } = useClassOverview(Boolean(data?.class));
  const [classmatesOpen, setClassmatesOpen] = useState(false);

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
          <div className="animate-rise lg:col-span-2">
            <ProfileBanner
              initials={`${data.firstName[0]}${data.lastName[0]}`}
              name={`${data.firstName} ${data.lastName}`}
              subtitle={t('roles.STUDENT')}
            >
              <dl className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <ProfileField
                  label={t('student.profile.fields.firstName')}
                  value={data.firstName}
                />
                <ProfileField
                  label={t('student.profile.fields.lastName')}
                  value={data.lastName}
                />
                <ProfileField
                  label={t('student.profile.fields.email')}
                  value={data.email}
                  copyable
                  wide
                />
                <ProfileField
                  label={t('student.profile.fields.dateOfBirth')}
                  value={formatDate(data.dateOfBirth, language)}
                />
              </dl>
              <ChangePasswordButton />
            </ProfileBanner>
          </div>

          <div
            className={`${CARD} animate-rise flex flex-col`}
            style={{ animationDelay: '100ms' }}
          >
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t('student.profile.fields.class')}
            </p>
            {data.class ? (
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
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

            {classOverview && (
              <p className="mt-2 text-sm text-slate-500">
                <button
                  type="button"
                  onClick={() => setClassmatesOpen(true)}
                  className="font-medium text-slate-700 underline decoration-indigo-300 underline-offset-4 hover:text-slate-900 hover:decoration-indigo-600"
                >
                  {t('student.profile.classOverview.students', {
                    count: classOverview.studentCount,
                  })}
                </button>
                {' · '}
                {t('student.profile.classOverview.teacher')}:{' '}
                {classOverview.teacher
                  ? `${classOverview.teacher.firstName} ${classOverview.teacher.lastName}`
                  : t('student.profile.classOverview.noTeacher')}
              </p>
            )}

            {grades && grades.grades.length > 0 && (
              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {t('student.grades.summary.average')}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-slate-900">
                    {grades.average === null
                      ? '-'
                      : formatNumber(grades.average, language)}
                  </dd>
                  {grades.average !== null && (
                    <div
                      aria-hidden="true"
                      className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className="h-full rounded-full bg-slate-700 transition-all duration-700"
                        style={{ width: `${(grades.average / 10) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {t('student.grades.summary.grades')}
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-slate-900">
                    {grades.grades.length}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {classOverview && (
            <Modal
              open={classmatesOpen}
              onClose={() => setClassmatesOpen(false)}
              title={`${t('student.profile.classOverview.title')} · ${classOverview.name}`}
              wide
            >
              <p className="text-sm text-slate-500">
                {t('student.profile.classOverview.students', {
                  count: classOverview.studentCount,
                })}
              </p>
              <ul className="mt-4 grid max-h-96 gap-x-8 overflow-y-auto sm:grid-cols-2">
                {classOverview.students.map((student) => (
                  <li
                    key={student.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 text-slate-800"
                  >
                    <span>
                      <span className="font-medium">{student.lastName}</span>{' '}
                      {student.firstName}
                    </span>
                    {student.id === data.id && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {t('student.profile.classOverview.you')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Modal>
          )}

          {grades && grades.grades.length > 0 && (
            <div
              className={`${CARD} animate-rise lg:col-span-3`}
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {t('student.profile.recent.title')}
                </h2>
                <Link
                  to={paths.student.grades}
                  className="group text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {t('student.profile.recent.viewAll')}
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-slate-100">
                {grades.grades.slice(0, RECENT_GRADES).map((grade) => (
                  <li key={grade.id}>
                    <Link
                      to={paths.student.grades}
                      className="-mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {subjectName(grade.subject.name)}
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                          {formatDate(grade.date, language)}
                        </span>
                        <GradeBadge value={grade.value} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
