import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ProfileBanner } from '../../components/ui/ProfileBanner.tsx';
import { ProfileField } from '../../components/ui/ProfileField.tsx';
import { ChangePasswordButton } from '../../features/auth/components/ChangePasswordCard.tsx';
import { useAdmins } from '../../features/admin/hooks.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const admins = useAdmins();

  if (!user) return null;

  const { profile } = user;

  return (
    <section>
      <PageHeader
        title={t('nav.admin.profile')}
        description={t('admin.profile.description')}
      />

      <div className="space-y-8">
        <div className="animate-rise max-w-2xl">
          <ProfileBanner
            initials={
              profile
                ? `${profile.firstName[0]}${profile.lastName[0]}`
                : user.email[0].toUpperCase()
            }
            name={
              profile ? `${profile.firstName} ${profile.lastName}` : user.email
            }
            subtitle={t('roles.ADMIN')}
          >
            <dl className="mt-6 grid gap-3">
              <ProfileField
                label={t('auth.fields.email')}
                value={user.email}
                copyable
              />
              {profile?.phone && (
                <ProfileField
                  label={t('auth.fields.phone').replace(/ \(.*\)$/, '')}
                  value={profile.phone}
                  copyable
                />
              )}
            </dl>
            <ChangePasswordButton />
          </ProfileBanner>
        </div>

        {admins.data && admins.data.length > 0 && (
          <div
            className="animate-rise max-w-2xl"
            style={{ animationDelay: '100ms' }}
          >
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {t('admin.profile.admins', { count: admins.data.length })}
            </h2>
            <ul className="divide-y divide-slate-200 rounded-2xl bg-white px-5 shadow-sm ring-1 ring-slate-300">
              {admins.data.map((admin) => {
                const fullName =
                  admin.firstName && admin.lastName
                    ? `${admin.firstName} ${admin.lastName}`
                    : admin.email;

                return (
                  <li key={admin.id} className="flex items-center gap-4 py-3.5">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[15px] font-semibold text-indigo-700"
                    >
                      {admin.firstName && admin.lastName
                        ? `${admin.firstName[0]}${admin.lastName[0]}`
                        : admin.email[0].toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium text-slate-900">
                        <span className="truncate">{fullName}</span>
                        {admin.id === user.id && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[13px] font-medium text-slate-700">
                            {t('admin.profile.you')}
                          </span>
                        )}
                      </p>
                      <p className="text-[15px] text-slate-500 [overflow-wrap:anywhere]">
                        {admin.email}
                        {admin.phone && ` · ${admin.phone}`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
