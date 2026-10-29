import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ClearFilters } from '../../components/ui/ClearFilters.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { PersonCell } from '../../components/ui/PersonCell.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { TextField } from '../../components/ui/TextField.tsx';
import {
  CredentialsDialog,
  type Credentials,
} from '../../features/admin/components/CredentialsDialog.tsx';
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
import { formatDate, fullName } from '../../utils/format.ts';
import { paths } from '../../routes/paths.ts';
import { ImportButton } from '../../features/admin/components/ImportButton.tsx';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function AdminStudentsPage() {
  const { t, i18n } = useTranslation();
  const { notify } = useToast();
  const language = i18n.resolvedLanguage ?? 'ro';

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archivePage, setArchivePage] = useState(1);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminStudent | null>(null);
  const [deleting, setDeleting] = useState<AdminStudent | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  // The list shows students with a class. Those without one are in the archive,
  // a section below the list.
  const students = useAdminStudents({
    page,
    search: debouncedSearch,
    classFilter,
  });
  const archive = useAdminStudents({
    page: archivePage,
    search: '',
    classFilter: NO_CLASS_FILTER,
  });
  const classes = useAdminClasses();
  const deleteStudent = useDeleteStudent();
  const filtering = debouncedSearch.trim() !== '' || classFilter !== '';
  const archivedRows = archive.data?.data ?? [];
  const archiveTotal = archive.data?.meta.total ?? 0;
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
        <PersonCell
          name={`${student.lastName} ${student.firstName}`}
          email={student.email}
          hideEmailFrom="4xl"
        />
      ),
    },
    {
      key: 'email',
      header: t('admin.students.table.email'),
      className: 'hidden @4xl:table-cell',
      render: (student) => student.email,
    },
    {
      key: 'phone',
      header: t('admin.students.table.phone'),
      className: 'hidden @7xl:table-cell',
      render: (student) => student.phone ?? '-',
    },
    {
      key: 'dateOfBirth',
      header: t('admin.students.table.dateOfBirth'),
      className: 'hidden @5xl:table-cell',
      render: (student) => formatDate(student.dateOfBirth, language),
    },
    {
      key: 'class',
      header: t('admin.students.table.class'),
      render: (student) =>
        student.class ? (
          <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-[13px] font-semibold text-brand-700">
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
          <Link
            to={paths.admin.studentReport(student.id)}
            className="inline-flex items-center rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            {t('admin.students.table.report')}
          </Link>
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(student)}
          >
            {t('admin.students.table.edit')}
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
          <>
            <ImportButton kind="students" />
            <Button fullWidth={false} onClick={() => setCreating(true)}>
              {t('admin.students.add')}
            </Button>
          </>
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
          {classes.data?.data.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name}
            </option>
          ))}
        </SelectField>
      </div>
      <ClearFilters
        visible={search.trim() !== '' || classFilter !== ''}
        onClear={() => {
          setSearch('');
          setClassFilter('');
          setPage(1);
        }}
      />

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

      {archiveTotal > 0 && (
        <section className="mt-10">
          <button
            type="button"
            aria-expanded={archiveOpen}
            onClick={() => setArchiveOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left ring-1 ring-slate-300 transition-colors hover:bg-slate-50"
          >
            <span className="font-medium text-slate-900">
              {t('admin.students.archive.title', { count: archiveTotal })}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-5 w-5 text-slate-400 transition-transform ${
                archiveOpen ? 'rotate-180' : ''
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {archiveOpen && (
            <div className="mt-3 animate-fade-in">
              <p className="mb-3 text-[15px] text-slate-500">
                {t('admin.students.archive.description')}
              </p>
              <DataTable
                caption={t('admin.students.archive.title', {
                  count: archiveTotal,
                })}
                columns={columns}
                rows={archivedRows}
                rowKey={(student) => student.id}
                loading={archive.isPending}
              />
              {archive.data && (
                <Pagination
                  meta={archive.data.meta}
                  onPageChange={setArchivePage}
                />
              )}
            </div>
          )}
        </section>
      )}

      <StudentFormModal
        open={creating || editing !== null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        student={editing}
        classes={classes.data?.data ?? []}
        onCreated={setCredentials}
        onDelete={() => {
          setDeleting(editing);
          setEditing(null);
        }}
      />

      <CredentialsDialog
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.students.delete.title')}
        message={t('admin.students.delete.message', {
          name: deleting ? fullName(deleting) : '',
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
