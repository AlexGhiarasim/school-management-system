import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ChangePasswordButton } from '../../features/auth/components/ChangePasswordCard.tsx';
import { useTeacherClasses } from '../../features/teacher/hooks.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function TeacherProfilePage() {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { user } = useAuth();
  const { data: classes } = useTeacherClasses();

  if (!user) return null;

  const { profile } = user;

  return (
    <section>
      <PageHeader
        title={t('nav.teacher.profile')}
        description={t('teacher.profile.description')}
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`${CARD} lg:col-span-2`}>
            {profile && (
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700"
                >
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </span>
                <div>
                  <p className="text-xl font-semibold text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{t('roles.TEACHER')}</p>
                </div>
              </div>
            )}
            <dl className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">
                  {t('auth.fields.email')}
                </dt>
                <dd className="mt-1 font-medium break-all text-slate-900">
                  {user.email}
                </dd>
              </div>
            </dl>
            <ChangePasswordButton />
          </div>

          <div className={CARD}>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t('teacher.profile.teaching')}
            </p>
            {classes && classes.length > 0 ? (
              <ul className="mt-3 space-y-3 text-sm">
                {classes.map((schoolClass) => (
                  <li key={schoolClass.id}>
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      {schoolClass.name}
                      {schoolClass.isHomeroom && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {t('teacher.classes.homeroom')}
                        </span>
                      )}
                    </p>
                    {schoolClass.subjects.length > 0 && (
                      <p className="text-slate-500">
                        {schoolClass.subjects
                          .map((subject) => subjectName(subject.name))
                          .join(', ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                {t('teacher.classes.empty.title')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
