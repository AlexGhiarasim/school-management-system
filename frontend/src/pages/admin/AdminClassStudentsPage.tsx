import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { AddStudentsModal } from '../../features/admin/components/AddStudentsModal.tsx';
import {
  useAdminClasses,
  useAdminClassStudents,
  useAssignStudentClass,
} from '../../features/admin/hooks.ts';
import type { ClassStudent } from '../../features/teacher/types.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';
import { paths } from '../../routes/paths.ts';
import { formatDate, fullName } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function AdminClassStudentsPage() {
  const { t, i18n } = useTranslation();
  const { notify } = useToast();
  const language = i18n.resolvedLanguage ?? 'ro';
  const classId = Number(useParams().classId);

  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<ClassStudent | null>(null);

  const classes = useAdminClasses();
  const students = useAdminClassStudents(classId, page);
  const assign = useAssignStudentClass();

  const schoolClass = classes.data?.data.find((item) => item.id === classId);
  const rows = students.data?.data ?? [];
  const notFound =
    !Number.isInteger(classId) || (classes.isSuccess && !schoolClass);

  async function confirmRemove() {
    if (!removing) return;

    try {
      await assign.mutateAsync({ studentId: removing.id, classId: null });
      notify(t('admin.classStudents.remove.removed'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setRemoving(null);
    }
  }

  const columns: Column<ClassStudent>[] = [
    {
      key: 'name',
      header: t('admin.classStudents.table.name'),
      render: (student) => (
        <span className="font-medium text-slate-900">
          {student.lastName} {student.firstName}
        </span>
      ),
    },
    {
      key: 'email',
      header: t('admin.classStudents.table.email'),
      className: 'hidden sm:table-cell',
      render: (student) => student.email,
    },
    {
      key: 'dateOfBirth',
      header: t('admin.classStudents.table.dateOfBirth'),
      className: 'hidden md:table-cell',
      render: (student) => formatDate(student.dateOfBirth, language),
    },
    {
      key: 'actions',
      header: t('admin.classStudents.table.actions'),
      className: 'text-right',
      render: (student) => (
        <Button
          variant="secondary"
          fullWidth={false}
          className="px-3 py-1.5"
          onClick={() => setRemoving(student)}
        >
          {t('admin.classStudents.table.remove')}
        </Button>
      ),
    },
  ];

  return (
    <section>
      <Link
        to={paths.admin.classes}
        className="mb-4 inline-block text-[15px] font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline"
      >
        {t('admin.classStudents.back')}
      </Link>

      {notFound ? (
        <div className={CARD}>
          <EmptyState
            title={t('admin.classStudents.notFound.title')}
            description={t('admin.classStudents.notFound.description')}
          />
        </div>
      ) : (
        <>
          <PageHeader
            title={
              schoolClass
                ? t('admin.classStudents.title', { name: schoolClass.name })
                : t('nav.admin.classes')
            }
            description={
              schoolClass?.teacher
                ? t('admin.classStudents.teacher', {
                    name: `${schoolClass.teacher.firstName} ${schoolClass.teacher.lastName}`,
                  })
                : t('admin.classStudents.noTeacher')
            }
            actions={
              <Button
                fullWidth={false}
                disabled={!schoolClass}
                onClick={() => setAdding(true)}
              >
                {t('admin.classStudents.add')}
              </Button>
            }
          />

          {students.isError ? (
            <div className={CARD}>
              <ErrorState onRetry={() => void students.refetch()} />
            </div>
          ) : (
            <>
              <DataTable
                caption={t('admin.classStudents.table.caption')}
                columns={columns}
                rows={rows}
                rowKey={(student) => student.id}
                loading={students.isPending}
                empty={
                  <EmptyState
                    title={t('admin.classStudents.empty.title')}
                    description={t('admin.classStudents.empty.description')}
                  />
                }
              />
              {students.data && (
                <Pagination meta={students.data.meta} onPageChange={setPage} />
              )}
            </>
          )}

          {schoolClass && (
            <AddStudentsModal
              open={adding}
              onClose={() => setAdding(false)}
              classId={classId}
              className={schoolClass.name}
            />
          )}

          <ConfirmDialog
            open={removing !== null}
            title={t('admin.classStudents.remove.title')}
            message={t('admin.classStudents.remove.message', {
              name: removing ? fullName(removing) : '',
            })}
            confirmLabel={t('admin.classStudents.remove.confirm')}
            loading={assign.isPending}
            onConfirm={() => void confirmRemove()}
            onCancel={() => setRemoving(null)}
          />
        </>
      )}
    </section>
  );
}
