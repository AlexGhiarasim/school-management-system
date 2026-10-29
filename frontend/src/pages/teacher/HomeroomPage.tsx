import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { InfoIcon } from '../../components/ui/icons.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { AverageBars } from '../../features/admin/components/charts/AverageBars.tsx';
import { GradeDistributionChart } from '../../features/admin/components/charts/GradeDistributionChart.tsx';
import { AtRiskList } from '../../features/statistics/components/AtRiskList.tsx';
import { StudentMetric } from '../../features/student/components/StudentMetric.tsx';
import { StudentPanel } from '../../features/student/components/StudentPanel.tsx';
import { HomeroomGate } from '../../features/teacher/components/HomeroomGate.tsx';
import { useHomeroomOverview } from '../../features/teacher/hooks.ts';
import type {
  HomeroomOverview,
  HomeroomStudent,
} from '../../features/teacher/types.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';
import { paths } from '../../routes/paths.ts';
import { teacherService } from '../../services/teacherService.ts';
import { formatNumber, fullName } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';
const LINK =
  'font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline';

function Roster({ overview }: { overview: HomeroomOverview }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';

  const columns: Column<HomeroomStudent>[] = [
    {
      key: 'name',
      header: t('teacher.homeroom.roster.student'),
      render: (student) => (
        <Link
          to={paths.teacher.homeroomStudent(student.studentId)}
          className="font-medium text-slate-900 hover:text-brand-600 focus:outline-none focus-visible:underline"
        >
          {fullName(student)}
        </Link>
      ),
    },
    {
      key: 'average',
      header: t('teacher.homeroom.roster.average'),
      render: (student) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {student.average === null
            ? '-'
            : formatNumber(student.average, language)}
        </span>
      ),
    },
    {
      key: 'grades',
      header: t('teacher.homeroom.roster.grades'),
      className: 'hidden sm:table-cell',
      render: (student) => student.grades,
    },
    {
      key: 'status',
      header: t('teacher.homeroom.roster.status'),
      render: (student) => {
        if (student.grades === 0) {
          return (
            <span className="text-slate-400">
              {t('teacher.homeroom.roster.noGrades')}
            </span>
          );
        }

        return student.failingSubjects.length > 0 ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[13px] font-medium whitespace-nowrap text-rose-800">
            {t('teacher.homeroom.roster.failing', {
              count: student.failingSubjects.length,
            })}
          </span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[13px] font-medium whitespace-nowrap text-emerald-800">
            {t('teacher.homeroom.roster.passing')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t('teacher.homeroom.roster.actions'),
      className: 'text-right',
      render: (student) => (
        <span className="flex justify-end gap-4 whitespace-nowrap">
          <Link
            to={paths.teacher.homeroomStudent(student.studentId)}
            className={LINK}
          >
            {t('teacher.homeroom.roster.viewGrades')}
          </Link>
          <Link
            to={paths.teacher.homeroomReport(student.studentId)}
            className={`${LINK} hidden sm:inline`}
          >
            {t('teacher.homeroom.roster.report')}
          </Link>
        </span>
      ),
    },
  ];

  return (
    <StudentPanel
      title={t('teacher.homeroom.roster.title', {
        count: overview.students.length,
      })}
      className="overflow-hidden"
    >
      <div className="overflow-hidden rounded-xl border border-slate-300 [&>div]:rounded-none [&>div]:shadow-none [&>div]:ring-0 [&_thead]:bg-slate-100 [&_thead]:text-slate-600">
        <DataTable
          caption={t('teacher.homeroom.roster.caption')}
          columns={columns}
          rows={overview.students}
          rowKey={(student) => student.studentId}
          empty={
            <EmptyState
              title={t('teacher.classStudents.empty.title')}
              description={t('teacher.classStudents.empty.description')}
            />
          }
        />
      </div>
    </StudentPanel>
  );
}

function HomeroomContent({ classId, name }: { classId: number; name: string }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const { notify } = useToast();
  const overview = useHomeroomOverview(classId);
  const [exporting, setExporting] = useState(false);
  const { data } = overview;

  async function exportGrades() {
    setExporting(true);

    try {
      await teacherService.exportClassGrades(classId, language);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title={t('teacher.homeroom.title', { name })}
        badge={t('teacher.homeroom.badge')}
        large
        description={t('teacher.homeroom.description')}
        actions={
          <Button
            variant="secondary"
            fullWidth={false}
            loading={exporting}
            disabled={!data || data.statistics.totals.grades === 0}
            onClick={() => void exportGrades()}
          >
            {t('teacher.homeroom.export')}
          </Button>
        }
      />

      <p className="mb-6 flex items-start gap-3 rounded-xl bg-white px-4 py-3 text-[15px] text-slate-600 shadow-sm ring-1 ring-slate-300">
        <span className="mt-0.5 shrink-0 text-slate-400">
          <InfoIcon />
        </span>
        {t('teacher.homeroom.permissions')}
      </p>

      {overview.isError && (
        <div className={CARD}>
          <ErrorState onRetry={() => void overview.refetch()} />
        </div>
      )}

      {overview.isPending && <LoadingPanel />}

      {data && (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <StudentMetric
              label={t('admin.statistics.kpi.students')}
              value={data.statistics.totals.students}
            />
            <StudentMetric
              label={t('admin.statistics.kpi.passRate')}
              value={
                data.statistics.passRate === null
                  ? '-'
                  : `${formatNumber(data.statistics.passRate, language)}%`
              }
            />
            <StudentMetric
              label={t('admin.statistics.kpi.grades')}
              value={data.statistics.totals.grades}
            />
          </dl>

          {data.statistics.totals.grades === 0 ? (
            <div className={CARD}>
              <EmptyState
                title={t('teacher.homeroom.noGrades.title')}
                description={t('teacher.homeroom.noGrades.description')}
              />
            </div>
          ) : (
            <>
              <div className="grid items-start gap-6 lg:grid-cols-2">
                <StudentPanel title={t('admin.statistics.distribution.title')}>
                  <GradeDistributionChart
                    distribution={data.statistics.distribution}
                  />
                </StudentPanel>
                <StudentPanel title={t('admin.statistics.bySubject.title')}>
                  <AverageBars
                    items={data.statistics.bySubject.map((item) => ({
                      id: item.subjectId,
                      label: subjectName(item.name),
                      detail: t('admin.statistics.bySubject.grades', {
                        count: item.grades,
                      }),
                      average: item.average,
                    }))}
                  />
                </StudentPanel>
              </div>

              <div className="grid items-start gap-6 lg:grid-cols-3">
                <StudentPanel
                  title={t('admin.statistics.atRisk.title', {
                    count: data.statistics.atRisk.length,
                  })}
                  className="lg:col-span-2"
                >
                  <AtRiskList
                    students={data.statistics.atRisk}
                    studentLink={paths.teacher.homeroomStudent}
                    showClass={false}
                  />
                </StudentPanel>
                <StudentPanel title={t('teacher.homeroom.teachers.title')}>
                  {data.teaching.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {t('teacher.homeroom.teachers.empty')}
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {data.teaching.map(({ subject, teacher }) => (
                        <li
                          key={subject.id}
                          className="py-2.5 first:pt-0 last:pb-0"
                        >
                          <p className="font-medium text-slate-900">
                            {subjectName(subject.name)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </StudentPanel>
              </div>
            </>
          )}

          <Roster overview={data} />
        </div>
      )}
    </section>
  );
}

export default function HomeroomPage() {
  return (
    <HomeroomGate>
      {(schoolClass) => (
        <HomeroomContent classId={schoolClass.id} name={schoolClass.name} />
      )}
    </HomeroomGate>
  );
}
