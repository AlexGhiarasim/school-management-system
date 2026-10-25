import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { TextField } from '../../components/ui/TextField.tsx';
import { StudentFormModal } from '../../features/admin/components/StudentFormModal.tsx';
import {
  useAdminClasses,
  useAdminStudents,
  useDeleteStudent,
} from '../../features/admin/hooks.ts';
import {
  NO_CLASS_FILTER,
  type AdminStudent,
} from '../../features/admin/types.ts';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';
import { formatDate } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function AdminStudentsPage() {
  const { t, i18n } = useTranslation();
  const { notify } = useToast();
  const language = i18n.resolvedLanguage ?? 'ro';

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [deleting, setDeleting] = useState<AdminStudent | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const students = useAdminStudents({
    page,
    search: debouncedSearch,
    classFilter,
  });
  const classes = useAdminClasses();
  const deleteStudent = useDeleteStudent();
  const filtering = debouncedSearch.trim() !== '' || classFilter !== '';
  const rows = students.data?.data ?? [];

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteStudent.mutateAsync(deleting.id);
      notify(t('admin.students.delete.deleted'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<AdminStudent>[] = [
    {
      key: 'name',
      header: t('admin.students.table.name'),
      render: (student) => (
        <span className="font-medium text-slate-900">
          {student.lastName} {student.firstName}
        </span>
      ),
    },
    {
      key: 'email',
      header: t('admin.students.table.email'),
      className: 'hidden md:table-cell',
      render: (student) => student.email,
    },
    {
      key: 'dateOfBirth',
      header: t('admin.students.table.dateOfBirth'),
      className: 'hidden sm:table-cell',
      render: (student) => formatDate(student.dateOfBirth, language),
    },
    {
      key: 'class',
      header: t('admin.students.table.class'),
      render: (student) =>
        student.class ? (
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {student.class.name}
          </span>
        ) : (
          <span className="text-slate-400">
            {t('admin.students.table.noClass')}
          </span>
        ),
    },
    {
      key: 'actions',
      header: t('admin.students.table.actions'),
      className: 'text-right',
      render: (student) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(student)}
          >
            {t('admin.students.table.edit')}
          </Button>
          <Button
            variant="danger"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setDeleting(student)}
          >
            {t('admin.students.table.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.students')}
        description={t('admin.students.description')}
        actions={
          <Button fullWidth={false} onClick={() => setCreating(true)}>
            {t('admin.students.add')}
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <TextField
          label={t('admin.students.search')}
          type="search"
          name="search"
          value={search}
          placeholder={t('admin.students.searchPlaceholder')}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <SelectField
          label={t('admin.students.filter.label')}
          value={classFilter}
          onChange={(event) => {
            setClassFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('admin.students.filter.all')}</option>
          <option value={NO_CLASS_FILTER}>
            {t('admin.students.filter.noClass')}
          </option>
          {classes.data?.data.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name}
            </option>
          ))}
        </SelectField>
      </div>

      {students.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void students.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.students.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(student) => student.id}
            loading={students.isPending}
            empty={
              filtering ? (
                <EmptyState
                  title={t('admin.students.noResults.title')}
                  description={t('admin.students.noResults.description')}
                />
              ) : (
                <EmptyState
                  title={t('admin.students.empty.title')}
                  description={t('admin.students.empty.description')}
                />
              )
            }
          />
          {students.data && (
            <Pagination meta={students.data.meta} onPageChange={setPage} />
          )}
        </>
      )}

      <StudentFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        student={editing}
        classes={classes.data?.data ?? []}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.students.delete.title')}
        message={t('admin.students.delete.message', {
          name: deleting ? `${deleting.firstName} ${deleting.lastName}` : '',
        })}
        confirmLabel={t('admin.students.delete.confirm')}
        danger
        loading={deleteStudent.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
