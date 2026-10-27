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
import { useStudentGrades } from '../../features/student/hooks.ts';
import type { StudentGrade } from '../../features/student/types.ts';
import { formatDate, formatNumber } from '../../utils/format.ts';

const PAGE_SIZE = 10;
const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function StudentGradesPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
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
        <span className="font-medium text-slate-900">{grade.subject.name}</span>
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
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={CARD}>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {t('student.grades.summary.average')}
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {data.average === null
                  ? '-'
                  : formatNumber(data.average, language)}
              </p>
            </div>
            <div className={CARD}>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {t('student.grades.summary.grades')}
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {data.grades.length}
              </p>
            </div>
            <div className={CARD}>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {t('student.grades.summary.subjects')}
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {data.bySubject.length}
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {t('student.grades.bySubject.title')}
            </h2>
            <SubjectAverages subjects={data.bySubject} grades={data.grades} />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('student.grades.table.title')}
              </h2>
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
                      {item.subject}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
            <DataTable
              caption={t('student.grades.table.caption')}
              columns={columns}
              rows={rows}
              rowKey={(grade) => grade.id}
            />
            <Pagination
              meta={{
                page,
                limit: PAGE_SIZE,
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / PAGE_SIZE),
              }}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </section>
  );
}
