import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../../components/ui/ErrorState.tsx';
import { LinkButton } from '../../../components/ui/LinkButton.tsx';
import { LoadingPanel } from '../../../components/ui/LoadingPanel.tsx';
import { paths } from '../../../routes/paths.ts';
import { useHomeroomClass } from '../hooks.ts';
import type { TeacherClass } from '../types.ts';

interface HomeroomGateProps {
  children: (schoolClass: TeacherClass) => ReactNode;
}

// Renders the pages of the class teacher only for a teacher who leads a class.
export function HomeroomGate({ children }: HomeroomGateProps) {
  const { t } = useTranslation();
  const { homeroomClass, isPending, isError, refetch } = useHomeroomClass();

  if (isPending) return <LoadingPanel />;

  if (isError) {
    return (
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-300">
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  if (!homeroomClass) {
    return (
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-300">
        <EmptyState
          title={t('teacher.homeroom.notHomeroom.title')}
          description={t('teacher.homeroom.notHomeroom.description')}
          action={
            <LinkButton to={paths.teacher.classes}>
              {t('teacher.homeroom.notHomeroom.action')}
            </LinkButton>
          }
        />
      </div>
    );
  }

  return <>{children(homeroomClass)}</>;
}
