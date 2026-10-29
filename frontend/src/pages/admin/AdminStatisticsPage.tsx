import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ClearFilters } from '../../components/ui/ClearFilters.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { AverageBars } from '../../features/admin/components/charts/AverageBars.tsx';
import { GradeDistributionChart } from '../../features/admin/components/charts/GradeDistributionChart.tsx';
import { WeeklyTrendChart } from '../../features/admin/components/charts/WeeklyTrendChart.tsx';
import { useAdminClasses, useStatistics } from '../../features/admin/hooks.ts';
import { AtRiskList } from '../../features/statistics/components/AtRiskList.tsx';
import { StudentMetric } from '../../features/student/components/StudentMetric.tsx';
import { StudentPanel } from '../../features/student/components/StudentPanel.tsx';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';
import { formatNumber } from '../../utils/format.ts';

const CARD = 'rounded-2xl border border-slate-300 bg-white p-6 shadow-sm';

export default function AdminStatisticsPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const [classId, setClassId] = useState('');
  const classes = useAdminClasses();
  const { data, isPending, isError, isPlaceholderData, refetch } =
    useStatistics(classId);

  const name = (student: { firstName: string; lastName: string }) =>
    `${student.lastName} ${student.firstName}`;

  return (
    <section>
      <PageHeader
        title={t('nav.admin.statistics')}
        description={t('admin.statistics.description')}
      />

      <div className="mb-4 grid gap-4 sm:max-w-xs">
        <SelectField
          label={t('admin.grades.filter.class')}
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
        >
          <option value="">{t('admin.grades.filter.allClasses')}</option>
          {classes.data?.data.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name}
            </option>
          ))}
        </SelectField>
      </div>
      <ClearFilters visible={classId !== ''} onClear={() => setClassId('')} />

      {isError && (
        <div className={CARD}>
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}

      {isPending && <LoadingPanel />}

      {data && data.totals.grades === 0 && (
        <div className={CARD}>
          <EmptyState
            title={t('admin.statistics.empty.title')}
            description={t('admin.statistics.empty.description')}
          />
        </div>
      )}

      {data && data.totals.grades > 0 && (
        <div
          className={`space-y-6 transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}
        >
          <dl className="grid gap-4 sm:grid-cols-3">
            <StudentMetric
              label={t('admin.statistics.kpi.passRate')}
              value={
                data.passRate === null
                  ? '-'
                  : `${formatNumber(data.passRate, language)}%`
              }
            />
            <StudentMetric
              label={t('admin.statistics.kpi.students')}
              value={data.totals.students}
            />
            <StudentMetric
              label={t('admin.statistics.kpi.grades')}
              value={data.totals.grades}
            />
          </dl>

          <div className="grid gap-6 lg:grid-cols-2">
            <StudentPanel title={t('admin.statistics.distribution.title')}>
              <GradeDistributionChart distribution={data.distribution} />
            </StudentPanel>
            <StudentPanel title={t('admin.statistics.trend.title')}>
              <WeeklyTrendChart trend={data.trend} />
            </StudentPanel>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <StudentPanel title={t('admin.statistics.byClass.title')}>
              <AverageBars
                items={data.byClass.map((item) => ({
                  id: item.classId,
                  label: item.name,
                  detail: t('admin.statistics.byClass.students', {
                    count: item.students,
                  }),
                  average: item.average,
                }))}
                onSelect={classId ? undefined : (id) => setClassId(String(id))}
              />
            </StudentPanel>
            <StudentPanel title={t('admin.statistics.bySubject.title')}>
              <AverageBars
                items={data.bySubject.map((item) => ({
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

          <div className="grid gap-6 lg:grid-cols-3">
            <StudentPanel title={t('admin.statistics.top.title')}>
              <ol className="divide-y divide-slate-200">
                {data.topStudents.map((student, index) => (
                  <li
                    key={student.studentId}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        to={paths.admin.studentReport(student.studentId)}
                        className="block truncate font-medium text-slate-900 hover:text-brand-600"
                      >
                        {name(student)}
                      </Link>
                      <span className="text-sm text-slate-500">
                        {student.className ?? '-'}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatNumber(student.average, language)}
                    </span>
                  </li>
                ))}
              </ol>
            </StudentPanel>

            <StudentPanel
              title={t('admin.statistics.atRisk.title', {
                count: data.atRisk.length,
              })}
              className="lg:col-span-2"
            >
              <AtRiskList
                students={data.atRisk}
                studentLink={paths.admin.studentReport}
              />
            </StudentPanel>
          </div>
        </div>
      )}
    </section>
  );
}
