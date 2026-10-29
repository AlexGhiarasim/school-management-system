import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { ClearFilters } from '../../components/ui/ClearFilters.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import {
  GradeActionBadge,
  GradeChangeSummary,
} from '../../features/admin/components/GradeChangeSummary.tsx';
import { useGradeHistory } from '../../features/admin/hooks.ts';
import type {
  GradeAuditAction,
  GradeChange,
} from '../../features/admin/types.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { formatDateTime } from '../../utils/format.ts';

const ACTIONS: GradeAuditAction[] = ['CREATED', 'UPDATED', 'DELETED'];
const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function AdminActivityPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const [action, setAction] = useState<GradeAuditAction | ''>('');
  const [page, setPage] = useState(1);
  const history = useGradeHistory(page, action);
  const rows = history.data?.data ?? [];

  const columns: Column<GradeChange>[] = [
    {
      key: 'when',
      header: t('admin.activity.table.when'),
      className: 'whitespace-nowrap',
      render: (change) => (
        <span className="text-slate-600">
          {formatDateTime(change.createdAt, language)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: t('admin.activity.table.actor'),
      render: (change) =>
        change.actor ? (
          <span>
            <span className="block font-medium text-slate-900">
              {change.actor.name}
            </span>
            <span className="text-sm text-slate-500">
              {t(`roles.${change.actor.role}`)}
            </span>
          </span>
        ) : (
          <span className="text-slate-400">
            {t('admin.activity.deletedAccount')}
          </span>
        ),
    },
    {
      key: 'action',
      header: t('admin.activity.table.action'),
      render: (change) => <GradeActionBadge action={change.action} />,
    },
    {
      key: 'grade',
      wrap: true,
      header: t('admin.activity.table.grade'),
      render: (change) => (
        <span>
          <span className="block font-medium text-slate-900">
            {change.studentName}
          </span>
          <span className="text-sm text-slate-500">
            {subjectName(change.subjectName)}
          </span>
        </span>
      ),
    },
    {
      key: 'change',
      wrap: true,
      header: t('admin.activity.table.change'),
      render: (change) => <GradeChangeSummary change={change} />,
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.activity')}
        description={t('admin.activity.description')}
      />

      <div className="mb-4 grid gap-4 sm:max-w-xs">
        <SelectField
          label={t('admin.activity.filter.label')}
          value={action}
          onChange={(event) => {
            setAction(event.target.value as GradeAuditAction | '');
            setPage(1);
          }}
        >
          <option value="">{t('admin.activity.filter.all')}</option>
          {ACTIONS.map((item) => (
            <option key={item} value={item}>
              {t(`admin.activity.actions.${item}`)}
            </option>
          ))}
        </SelectField>
      </div>
      <ClearFilters
        visible={action !== ''}
        onClear={() => {
          setAction('');
          setPage(1);
        }}
      />

      {history.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void history.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.activity.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(change) => change.id}
            loading={history.isPending}
            empty={
              <EmptyState
                title={t('admin.activity.empty.title')}
                description={t('admin.activity.empty.description')}
              />
            }
          />
          {history.data && (
            <Pagination meta={history.data.meta} onPageChange={setPage} />
          )}
        </>
      )}
    </section>
  );
}
