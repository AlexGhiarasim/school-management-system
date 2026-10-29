import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { PrintButton } from '../../components/ui/PrintButton.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { useStudentReport } from '../../features/admin/hooks.ts';
import { ReportCard } from '../../features/student/components/ReportCard.tsx';
import { paths } from '../../routes/paths.ts';

export default function AdminStudentReportPage() {
  const { t } = useTranslation();
  const studentId = Number(useParams().studentId);
  const { data, isPending, isError, refetch } = useStudentReport(studentId);

  return (
    <section>
      <div className="print:hidden">
        <Link
          to={paths.admin.students}
          className="mb-3 inline-block text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          ← {t('report.backToStudents')}
        </Link>
        <PageHeader
          title={t('report.title')}
          description={t('report.description')}
          actions={data && <PrintButton />}
        />
      </div>

      {isPending && <LoadingPanel />}
      {isError && (
        <div className="rounded-2xl border border-slate-300 bg-white shadow-sm">
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}
      {data && <ReportCard student={data.student} grades={data.grades} />}
    </section>
  );
}
