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
import { TeacherFormModal } from '../../features/admin/components/TeacherFormModal.tsx';
import {
  useAdminTeachers,
  useDeleteTeacher,
} from '../../features/admin/hooks.ts';
import type { AdminTeacher } from '../../features/admin/types.ts';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function AdminTeachersPage() {
  const { t } = useTranslation();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminTeacher | null>(null);
  const [deleting, setDeleting] = useState<AdminTeacher | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const teachers = useAdminTeachers({ page, search: debouncedSearch });
  const deleteTeacher = useDeleteTeacher();
  const rows = teachers.data?.data ?? [];

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteTeacher.mutateAsync(deleting.id);
      notify(t('admin.teachers.delete.deleted'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<AdminTeacher>[] = [
    {
      key: 'name',
      header: t('admin.teachers.table.name'),
      render: (teacher) => (
        <span className="font-medium text-slate-900">
          {teacher.lastName} {teacher.firstName}
        </span>
      ),
    },
    {
      key: 'email',
      header: t('admin.teachers.table.email'),
      className: 'hidden sm:table-cell',
      render: (teacher) => teacher.email,
    },
    {
      key: 'actions',
      header: t('admin.teachers.table.actions'),
      className: 'text-right',
      render: (teacher) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(teacher)}
          >
            {t('admin.teachers.table.edit')}
          </Button>
          <Button
            variant="danger"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setDeleting(teacher)}
          >
            {t('admin.teachers.table.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.teachers')}
        description={t('admin.teachers.description')}
        actions={
          <Button fullWidth={false} onClick={() => setCreating(true)}>
            {t('admin.teachers.add')}
          </Button>
        }
      />

      <div className="mb-4 sm:max-w-sm">
        <TextField
          label={t('admin.teachers.search')}
          type="search"
          name="search"
          value={search}
          placeholder={t('admin.teachers.searchPlaceholder')}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {teachers.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void teachers.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.teachers.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(teacher) => teacher.id}
            loading={teachers.isPending}
            empty={
              debouncedSearch.trim() ? (
                <EmptyState
                  title={t('admin.teachers.noResults.title')}
                  description={t('admin.teachers.noResults.description')}
                />
              ) : (
                <EmptyState
                  title={t('admin.teachers.empty.title')}
                  description={t('admin.teachers.empty.description')}
                />
              )
            }
          />
          {teachers.data && (
            <Pagination meta={teachers.data.meta} onPageChange={setPage} />
          )}
        </>
      )}

      <TeacherFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        teacher={editing}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.teachers.delete.title')}
        message={t('admin.teachers.delete.message', {
          name: deleting ? `${deleting.firstName} ${deleting.lastName}` : '',
        })}
        confirmLabel={t('admin.teachers.delete.confirm')}
        danger
        loading={deleteTeacher.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
