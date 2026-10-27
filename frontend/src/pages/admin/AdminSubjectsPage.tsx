import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { TextField } from '../../components/ui/TextField.tsx';
import { SubjectFormModal } from '../../features/admin/components/SubjectFormModal.tsx';
import {
  useAdminSubjects,
  useDeleteSubject,
} from '../../features/admin/hooks.ts';
import type { AdminSubject } from '../../features/admin/types.ts';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { useToast } from '../../hooks/useToast.ts';
import { ApiError } from '../../lib/api.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function AdminSubjectsPage() {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminSubject | null>(null);
  const [deleting, setDeleting] = useState<AdminSubject | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const subjects = useAdminSubjects({ page, search: debouncedSearch });
  const deleteSubject = useDeleteSubject();
  const rows = subjects.data?.data ?? [];

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteSubject.mutateAsync(deleting.id);
      notify(t('admin.subjects.delete.deleted'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      const inUse = error instanceof ApiError && error.status === 409;
      notify(
        t(inUse ? 'admin.subjects.delete.inUse' : getApiErrorKey(error)),
        'error',
      );
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<AdminSubject>[] = [
    {
      key: 'name',
      header: t('admin.subjects.table.name'),
      render: (subject) => (
        <span className="font-medium text-slate-900">
          {subjectName(subject.name)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('admin.subjects.table.actions'),
      className: 'text-right',
      render: (subject) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(subject)}
          >
            {t('admin.subjects.table.edit')}
          </Button>
          <Button
            variant="danger"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setDeleting(subject)}
          >
            {t('admin.subjects.table.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.subjects')}
        description={t('admin.subjects.description')}
        actions={
          <Button fullWidth={false} onClick={() => setCreating(true)}>
            {t('admin.subjects.add')}
          </Button>
        }
      />

      <div className="mb-4 sm:max-w-sm">
        <TextField
          label={t('admin.subjects.search')}
          type="search"
          name="search"
          value={search}
          placeholder={t('admin.subjects.searchPlaceholder')}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {subjects.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void subjects.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.subjects.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(subject) => subject.id}
            loading={subjects.isPending}
            empty={
              debouncedSearch.trim() ? (
                <EmptyState
                  title={t('admin.subjects.noResults.title')}
                  description={t('admin.subjects.noResults.description')}
                />
              ) : (
                <EmptyState
                  title={t('admin.subjects.empty.title')}
                  description={t('admin.subjects.empty.description')}
                />
              )
            }
          />
          {subjects.data && (
            <Pagination meta={subjects.data.meta} onPageChange={setPage} />
          )}
        </>
      )}

      <SubjectFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        subject={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.subjects.delete.title')}
        message={t('admin.subjects.delete.message', {
          name: deleting ? subjectName(deleting.name) : '',
        })}
        confirmLabel={t('admin.subjects.delete.confirm')}
        danger
        loading={deleteSubject.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
