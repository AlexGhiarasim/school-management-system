import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ProfileBanner } from '../../components/ui/ProfileBanner.tsx';
import { ProfileField } from '../../components/ui/ProfileField.tsx';
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
          <div className="animate-rise lg:col-span-2">
            <ProfileBanner
              initials={
                profile
                  ? `${profile.firstName[0]}${profile.lastName[0]}`
                  : user.email[0].toUpperCase()
              }
              name={
                profile
                  ? `${profile.firstName} ${profile.lastName}`
                  : user.email
              }
              subtitle={t('roles.TEACHER')}
            >
              <dl className="mt-5">
                <ProfileField
                  label={t('auth.fields.email')}
                  value={user.email}
                  copyable
                />
              </dl>
              <ChangePasswordButton />
            </ProfileBanner>
          </div>

          <div
            className={`${CARD} animate-rise`}
            style={{ animationDelay: '100ms' }}
          >
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
