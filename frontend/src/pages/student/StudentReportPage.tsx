import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { PrintButton } from '../../components/ui/PrintButton.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { ReportCard } from '../../features/student/components/ReportCard.tsx';
import {
  useStudentGrades,
  useStudentProfile,
} from '../../features/student/hooks.ts';

export default function StudentReportPage() {
  const { t } = useTranslation();
  const profile = useStudentProfile();
  const grades = useStudentGrades();
  const isError = profile.isError || grades.isError;

  return (
    <section>
      <div className="print:hidden">
        <PageHeader
          title={t('report.title')}
          description={t('report.ownDescription')}
          actions={profile.data && grades.data && <PrintButton />}
        />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-slate-300 bg-white shadow-sm">
          <ErrorState
            onRetry={() => {
              void profile.refetch();
              void grades.refetch();
            }}
          />
        </div>
      ) : profile.data && grades.data ? (
        <ReportCard student={profile.data} grades={grades.data.grades} />
      ) : (
        <LoadingPanel />
      )}
    </section>
  );
}
