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
import { StudentPanel } from '../../features/student/components/StudentPanel.tsx';
import { StudentMetric } from '../../features/student/components/StudentMetric.tsx';
import {
  useClassOverview,
  useStudentGrades,
  useStudentProfile,
} from '../../features/student/hooks.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';
import { formatDate, formatNumber } from '../../utils/format.ts';

const CARD = 'rounded-2xl border border-slate-300 bg-white p-6 shadow-sm';
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
        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <div className="min-w-0 animate-rise lg:col-span-2 [&>div]:h-full [&>div]:ring-slate-300">
            <ProfileBanner
              initials={`${data.firstName[0]}${data.lastName[0]}`}
              name={`${data.firstName} ${data.lastName}`}
              subtitle={t('roles.STUDENT')}
            >
              <dl className="mt-6 grid gap-3 sm:grid-cols-2">
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
                {data.phone && (
                  <ProfileField
                    label={t('auth.fields.phone').replace(/ \(.*\)$/, '')}
                    value={data.phone}
                    copyable
                  />
                )}
                <ProfileField
                  label={t('student.profile.fields.dateOfBirth')}
                  value={formatDate(data.dateOfBirth, language)}
                />
              </dl>
              <ChangePasswordButton />
            </ProfileBanner>
          </div>

          <div
            className="flex min-w-0 animate-rise flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm"
            style={{ animationDelay: '100ms' }}
          >
            <StudentPanel title={t('student.profile.fields.class')} embedded>
              {data.class ? (
                <p className="text-4xl font-semibold tracking-tight text-slate-900">
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
                <div className="mt-3 text-[15px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => setClassmatesOpen(true)}
                    className="rounded-md font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 hover:decoration-slate-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
                  >
                    {t('student.profile.classOverview.students', {
                      count: classOverview.studentCount,
                    })}
                  </button>
                  <div className="mt-5 border-t border-slate-300 pt-4">
                    <p className="text-[13px] text-slate-500">
                      {t('student.profile.classOverview.teacher')}
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-800">
                      {classOverview.teacher
                        ? `${classOverview.teacher.firstName} ${classOverview.teacher.lastName}`
                        : t('student.profile.classOverview.noTeacher')}
                    </p>
                  </div>
                </div>
              )}
            </StudentPanel>

            {grades && grades.grades.length > 0 && (
              <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-300 bg-slate-50 p-5">
                <StudentMetric
                  compact
                  label={t('student.grades.summary.average')}
                  value={
                    grades.average === null
                      ? '-'
                      : formatNumber(grades.average, language)
                  }
                  progress={
                    grades.average === null ? null : grades.average * 10
                  }
                />
                <StudentMetric
                  compact
                  label={t('student.grades.summary.grades')}
                  value={grades.grades.length}
                />
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
            <StudentPanel
              title={t('student.profile.recent.title')}
              className="lg:col-span-3"
              actions={
                <Link
                  to={paths.student.grades}
                  className="group rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-indigo-600 shadow-sm transition-colors hover:bg-slate-100 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t('student.profile.recent.viewAll')}
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              }
            >
              <ul className="divide-y divide-slate-200">
                {grades.grades.slice(0, RECENT_GRADES).map((grade) => (
                  <li key={grade.id}>
                    <Link
                      to={paths.student.grades}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3.5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-100"
                    >
                      <span className="font-medium text-slate-900">
                        {subjectName(grade.subject.name)}
                      </span>
                      <span className="flex shrink-0 flex-col-reverse items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-xs text-slate-500 sm:text-sm">
                          {formatDate(grade.date, language)}
                        </span>
                        <GradeBadge value={grade.value} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </StudentPanel>
          )}
        </div>
      )}
    </section>
  );
}
