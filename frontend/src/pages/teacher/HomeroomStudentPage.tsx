import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LinkButton } from '../../components/ui/LinkButton.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { StudentMetric } from '../../features/student/components/StudentMetric.tsx';
import { SubjectAverages } from '../../features/student/components/SubjectAverages.tsx';
import { HomeroomGate } from '../../features/teacher/components/HomeroomGate.tsx';
import {
  useHomeroomOverview,
  useStudentGrades,
  useTeacherClasses,
} from '../../features/teacher/hooks.ts';
import { paths } from '../../routes/paths.ts';
import { formatNumber, fullName } from '../../utils/format.ts';
import { averageBySubject, overallAverage } from '../../utils/grades.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

function HomeroomStudent({ classId }: { classId: number }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const studentId = Number(useParams().studentId);

  const overview = useHomeroomOverview(classId);
  const grades = useStudentGrades(studentId);
  const classes = useTeacherClasses();

  const student = overview.data?.students.find(
    (item) => item.studentId === studentId,
  );
  const notFound =
    !Number.isInteger(studentId) || (overview.isSuccess && !student);
  const teachesClass =
    (classes.data?.find((item) => item.id === classId)?.subjects ?? []).length >
    0;

  const all = grades.data?.data ?? [];
  const bySubject = averageBySubject(all);
  const average = overallAverage(bySubject);
  const teacherNames = Object.fromEntries(
    (overview.data?.teaching ?? []).map(({ subject, teacher }) => [
      subject.id,
      `${teacher.firstName} ${teacher.lastName}`,
    ]),
  );

  return (
    <section>
      <Link
        to={paths.teacher.homeroom}
        className="mb-4 inline-block text-[15px] font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline"
      >
        {t('teacher.homeroom.back')}
      </Link>

      {notFound ? (
        <div className={CARD}>
          <EmptyState
            title={t('teacher.homeroom.student.notFound.title')}
            description={t('teacher.homeroom.student.notFound.description')}
          />
        </div>
      ) : (
        <>
          <PageHeader
            title={
              student ? fullName(student) : t('teacher.studentGrades.title')
            }
            badge={student ? t('roles.STUDENT') : undefined}
            large
            description={t('teacher.homeroom.student.description')}
            actions={
              student && (
                <>
                  {teachesClass && (
                    <LinkButton
                      to={paths.teacher.studentGrades(classId, studentId)}
                    >
                      {t('teacher.homeroom.student.ownGrades')}
                    </LinkButton>
                  )}
                  <LinkButton
                    variant="primary"
                    to={paths.teacher.homeroomReport(studentId)}
                  >
                    {t('report.open')}
                  </LinkButton>
                </>
              )
            }
          />

          {grades.isError && (
            <div className={CARD}>
              <ErrorState onRetry={() => void grades.refetch()} />
            </div>
          )}

          {(grades.isPending || overview.isPending) && <LoadingPanel />}

          {grades.data && overview.data && (
            <>
              {all.length === 0 ? (
                <div className={CARD}>
                  <EmptyState
                    title={t('teacher.homeroom.student.empty.title')}
                    description={t(
                      'teacher.homeroom.student.empty.description',
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <dl className="grid gap-4 sm:grid-cols-3">
                    <StudentMetric
                      label={t('student.grades.summary.average')}
                      value={
                        average === null ? '-' : formatNumber(average, language)
                      }
                      progress={average === null ? null : average * 10}
                    />
                    <StudentMetric
                      label={t('student.grades.summary.grades')}
                      value={all.length}
                    />
                    <StudentMetric
                      label={t('student.grades.summary.subjects')}
                      value={bySubject.length}
                    />
                  </dl>
                  <SubjectAverages
                    subjects={bySubject}
                    grades={all}
                    teachers={teacherNames}
                    framed
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default function HomeroomStudentPage() {
  return (
    <HomeroomGate>
      {(schoolClass) => <HomeroomStudent classId={schoolClass.id} />}
    </HomeroomGate>
  );
}
