import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { GradeBadge } from '../../features/student/components/GradeBadge.tsx';
import { SubjectAverages } from '../../features/student/components/SubjectAverages.tsx';
import { StudentPanel } from '../../features/student/components/StudentPanel.tsx';
import { StudentMetric } from '../../features/student/components/StudentMetric.tsx';
import { useStudentGrades } from '../../features/student/hooks.ts';
import type { StudentGrade } from '../../features/student/types.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { formatDate, formatNumber } from '../../utils/format.ts';

const PAGE_SIZE = 10;
const CARD = 'rounded-2xl border border-slate-300 bg-white p-6 shadow-sm';

export default function StudentGradesPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const { data, isPending, isError, refetch } = useStudentGrades();
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);

  const filtered = data
    ? data.grades.filter(
        (grade) => !subjectId || String(grade.subject.id) === subjectId,
      )
    : [];
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<StudentGrade>[] = [
    {
      key: 'subject',
      header: t('student.grades.table.subject'),
      render: (grade) => (
        <span className="font-medium text-slate-900">
          {subjectName(grade.subject.name)}
        </span>
      ),
    },
    {
      key: 'value',
      header: t('student.grades.table.grade'),
      render: (grade) => <GradeBadge value={grade.value} />,
    },
    {
      key: 'date',
      header: t('student.grades.table.date'),
      render: (grade) => formatDate(grade.date, language),
    },
    {
      key: 'teacher',
      header: t('student.grades.table.teacher'),
      className: 'hidden sm:table-cell',
      render: (grade) =>
        grade.teacher
          ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
          : t('student.grades.table.noTeacher'),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.student.grades')}
        description={t('student.grades.description')}
      />

      {isError && (
        <div className={CARD}>
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {data && data.grades.length === 0 && (
        <div className={CARD}>
          <EmptyState
            title={t('student.grades.empty.title')}
            description={t('student.grades.empty.description')}
          />
        </div>
      )}

      {data && data.grades.length > 0 && (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <StudentMetric
              label={t('student.grades.summary.average')}
              value={
                data.average === null
                  ? '-'
                  : formatNumber(data.average, language)
              }
              progress={data.average === null ? null : data.average * 10}
            />
            <StudentMetric
              label={t('student.grades.summary.grades')}
              value={data.grades.length}
            />
            <StudentMetric
              label={t('student.grades.summary.subjects')}
              value={data.bySubject.length}
            />
          </dl>

          <StudentPanel title={t('student.grades.bySubject.title')}>
            <SubjectAverages
              subjects={data.bySubject}
              grades={data.grades}
              framed
            />
          </StudentPanel>

          <StudentPanel
            title={t('student.grades.table.title')}
            actions={
              <div className="w-full sm:w-64">
                <SelectField
                  label={t('student.grades.filter.label')}
                  value={subjectId}
                  onChange={(event) => {
                    setSubjectId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">{t('student.grades.filter.all')}</option>
                  {data.bySubject.map((item) => (
                    <option key={item.subjectId} value={item.subjectId}>
                      {subjectName(item.subject)}
                    </option>
                  ))}
                </SelectField>
              </div>
            }
          >
            <div className="overflow-hidden rounded-xl border border-slate-300 [&>div]:rounded-none [&>div]:shadow-none [&>div]:ring-0 [&_thead]:bg-slate-100 [&_thead]:text-slate-600">
              <DataTable
                caption={t('student.grades.table.caption')}
                columns={columns}
                rows={rows}
                rowKey={(grade) => grade.id}
              />
            </div>
            <Pagination
              meta={{
                page,
                limit: PAGE_SIZE,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / PAGE_SIZE),
              }}
              onPageChange={setPage}
            />
          </StudentPanel>
        </div>
      )}
    </section>
  );
}
