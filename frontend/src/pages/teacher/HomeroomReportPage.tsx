import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { PrintButton } from '../../components/ui/PrintButton.tsx';
import { ReportCard } from '../../features/student/components/ReportCard.tsx';
import { HomeroomGate } from '../../features/teacher/components/HomeroomGate.tsx';
import {
  useAllClassStudents,
  useStudentGrades,
} from '../../features/teacher/hooks.ts';
import type { TeacherClass } from '../../features/teacher/types.ts';
import { paths } from '../../routes/paths.ts';

function HomeroomReport({ schoolClass }: { schoolClass: TeacherClass }) {
  const { t } = useTranslation();
  const studentId = Number(useParams().studentId);
  const students = useAllClassStudents(schoolClass.id);
  const grades = useStudentGrades(studentId);

  const student = students.data?.data.find((item) => item.id === studentId);
  const notFound =
    !Number.isInteger(studentId) || (students.isSuccess && !student);
  const isError = students.isError || grades.isError;

  return (
    <section>
      <div className="print:hidden">
        <Link
          to={paths.teacher.homeroomStudent(studentId)}
          className="mb-3 inline-block text-sm font-medium text-slate-500 hover:text-brand-600"
        >
          ← {t('teacher.homeroom.student.back')}
        </Link>
        <PageHeader
          title={t('report.title')}
          description={t('report.description')}
          actions={student && grades.data && <PrintButton />}
        />
      </div>

      {notFound ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-300">
          <EmptyState
            title={t('teacher.homeroom.student.notFound.title')}
            description={t('teacher.homeroom.student.notFound.description')}
          />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-300">
          <ErrorState
            onRetry={() => {
              void students.refetch();
              void grades.refetch();
            }}
          />
        </div>
      ) : student && grades.data ? (
        <ReportCard
          student={{
            ...student,
            class: { id: schoolClass.id, name: schoolClass.name },
          }}
          grades={grades.data.data}
        />
      ) : (
        <LoadingPanel />
      )}
    </section>
  );
}

export default function HomeroomReportPage() {
  return (
    <HomeroomGate>
      {(schoolClass) => <HomeroomReport schoolClass={schoolClass} />}
    </HomeroomGate>
  );
}
