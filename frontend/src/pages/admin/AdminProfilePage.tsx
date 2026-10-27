import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ChangePasswordButton } from '../../features/auth/components/ChangePasswordCard.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function AdminProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section>
      <PageHeader
        title={t('nav.admin.profile')}
        description={t('admin.profile.description')}
      />

      <div className="space-y-6">
        <div className={CARD}>
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700"
            >
              {user.email[0].toUpperCase()}
            </span>
            <div>
              <p className="text-xl font-semibold break-all text-slate-900">
                {user.email}
              </p>
              <p className="text-sm text-slate-500">{t('roles.ADMIN')}</p>
            </div>
          </div>
          <ChangePasswordButton />
        </div>
      </div>
    </section>
  );
}
