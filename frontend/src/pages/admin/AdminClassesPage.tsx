import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { TextField } from '../../components/ui/TextField.tsx';
import { ClassFormModal } from '../../features/admin/components/ClassFormModal.tsx';
import {
  useAdminClassPage,
  useAllTeachers,
  useDeleteClass,
} from '../../features/admin/hooks.ts';
import type { AdminClass } from '../../features/admin/types.ts';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';
import { paths } from '../../routes/paths.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function AdminClassesPage() {
  const { t } = useTranslation();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminClass | null>(null);
  const [deleting, setDeleting] = useState<AdminClass | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const classes = useAdminClassPage({ page, search: debouncedSearch });
  const teachers = useAllTeachers();
  const deleteClass = useDeleteClass();
  const rows = classes.data?.data ?? [];

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteClass.mutateAsync(deleting.id);
      notify(t('admin.classes.delete.deleted'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<AdminClass>[] = [
    {
      key: 'name',
      header: t('admin.classes.table.name'),
      render: (schoolClass) => (
        <Link
          to={paths.admin.classStudents(schoolClass.id)}
          className="text-base font-semibold text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline"
        >
          {schoolClass.name}
        </Link>
      ),
    },
    {
      key: 'teacher',
      header: t('admin.classes.table.teacher'),
      render: (schoolClass) =>
        schoolClass.teacher ? (
          `${schoolClass.teacher.lastName} ${schoolClass.teacher.firstName}`
        ) : (
          <span className="text-slate-400">
            {t('admin.classes.table.noTeacher')}
          </span>
        ),
    },
    {
      key: 'students',
      header: t('admin.classes.table.students'),
      className: 'hidden sm:table-cell',
      render: (schoolClass) =>
        t('admin.classes.studentCount', { count: schoolClass.studentCount }),
    },
    {
      key: 'actions',
      header: t('admin.classes.table.actions'),
      className: 'text-right',
      render: (schoolClass) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(schoolClass)}
          >
            {t('admin.classes.table.edit')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.classes')}
        description={t('admin.classes.description')}
        actions={
          <Button fullWidth={false} onClick={() => setCreating(true)}>
            {t('admin.classes.add')}
          </Button>
        }
      />

      <div className="mb-4 sm:max-w-sm">
        <TextField
          label={t('admin.classes.search')}
          type="search"
          name="search"
          value={search}
          placeholder={t('admin.classes.searchPlaceholder')}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {classes.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void classes.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.classes.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(schoolClass) => schoolClass.id}
            loading={classes.isPending}
            empty={
              debouncedSearch.trim() ? (
                <EmptyState
                  title={t('admin.classes.noResults.title')}
                  description={t('admin.classes.noResults.description')}
                />
              ) : (
                <EmptyState
                  title={t('admin.classes.empty.title')}
                  description={t('admin.classes.empty.description')}
                />
              )
            }
          />
          {classes.data && (
            <Pagination meta={classes.data.meta} onPageChange={setPage} />
          )}
        </>
      )}

      <ClassFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        schoolClass={editing}
        teachers={teachers.data?.data ?? []}
        onDelete={() => {
          setDeleting(editing);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.classes.delete.title')}
        message={t('admin.classes.delete.message', {
          name: deleting?.name ?? '',
        })}
        confirmLabel={t('admin.classes.delete.confirm')}
        danger
        loading={deleteClass.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
