import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ProfileBanner } from '../../components/ui/ProfileBanner.tsx';
import { ChangePasswordButton } from '../../features/auth/components/ChangePasswordCard.tsx';
import { useAuth } from '../../hooks/useAuth.ts';

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
        <div className="animate-rise max-w-2xl">
          <ProfileBanner
            initials={user.email[0].toUpperCase()}
            name={user.email}
            subtitle={t('roles.ADMIN')}
          >
            <ChangePasswordButton />
          </ProfileBanner>
        </div>
      </div>
    </section>
  );
}
