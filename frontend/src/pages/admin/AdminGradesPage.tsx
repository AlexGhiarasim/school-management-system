import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { ClearFilters } from '../../components/ui/ClearFilters.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { GradeEditModal } from '../../features/admin/components/GradeEditModal.tsx';
import {
  useAdminClasses,
  useAdminGrades,
  useAllClassStudents,
  useAllSubjects,
  useDeleteGrade,
} from '../../features/admin/hooks.ts';
import type { AdminGrade } from '../../features/admin/types.ts';
import { GradeBadge } from '../../features/student/components/GradeBadge.tsx';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { useToast } from '../../hooks/useToast.ts';
import { getApiErrorKey } from '../../lib/apiErrors.ts';
import { adminService } from '../../services/adminService.ts';
import { formatDate, fullName } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function AdminGradesPage() {
  const { t, i18n } = useTranslation();
  const { notify } = useToast();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();

  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminGrade | null>(null);
  const [deleting, setDeleting] = useState<AdminGrade | null>(null);

  const grades = useAdminGrades({ page, classId, studentId, subjectId });
  const classes = useAdminClasses();
  const subjects = useAllSubjects();
  const classStudents = useAllClassStudents(classId ? Number(classId) : null);
  const deleteGrade = useDeleteGrade();
  const [exporting, setExporting] = useState(false);
  const rows = grades.data?.data ?? [];
  const filtering = classId !== '' || studentId !== '' || subjectId !== '';

  async function exportCsv() {
    setExporting(true);

    try {
      await adminService.exportGrades(
        { classId, studentId, subjectId },
        language,
      );
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setExporting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;

    try {
      await deleteGrade.mutateAsync(deleting.id);
      notify(t('admin.grades.delete.deleted'), 'success');
      if (rows.length === 1 && page > 1) setPage(page - 1);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<AdminGrade>[] = [
    {
      key: 'student',
      header: t('admin.grades.table.student'),
      render: (grade) => (
        <span className="font-medium text-slate-900">
          {grade.student.lastName} {grade.student.firstName}
        </span>
      ),
    },
    {
      key: 'subject',
      header: t('admin.grades.table.subject'),
      render: (grade) => subjectName(grade.subject.name),
    },
    {
      key: 'value',
      header: t('admin.grades.table.grade'),
      render: (grade) => <GradeBadge value={grade.value} />,
    },
    {
      key: 'date',
      header: t('admin.grades.table.date'),
      className: 'hidden @2xl:table-cell',
      render: (grade) => formatDate(grade.date, language),
    },
    {
      key: 'teacher',
      header: t('admin.grades.table.teacher'),
      className: 'hidden @4xl:table-cell',
      render: (grade) =>
        grade.teacher
          ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
          : t('admin.grades.table.noTeacher'),
    },
    {
      key: 'actions',
      header: t('admin.grades.table.actions'),
      className: 'text-right',
      render: (grade) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(grade)}
          >
            {t('admin.grades.table.edit')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      <PageHeader
        title={t('nav.admin.grades')}
        description={t('admin.grades.description')}
        actions={
          <Button
            variant="secondary"
            fullWidth={false}
            loading={exporting}
            disabled={rows.length === 0}
            onClick={() => void exportCsv()}
          >
            {t('admin.grades.export')}
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label={t('admin.grades.filter.class')}
          value={classId}
          onChange={(event) => {
            setClassId(event.target.value);
            setStudentId('');
            setPage(1);
          }}
        >
          <option value="">{t('admin.grades.filter.allClasses')}</option>
          {classes.data?.data.map((schoolClass) => (
            <option key={schoolClass.id} value={schoolClass.id}>
              {schoolClass.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('admin.grades.filter.student')}
          value={studentId}
          disabled={!classId}
          onChange={(event) => {
            setStudentId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('admin.grades.filter.allStudents')}</option>
          {classStudents.data?.data.map((student) => (
            <option key={student.id} value={student.id}>
              {student.lastName} {student.firstName}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('admin.grades.filter.subject')}
          value={subjectId}
          onChange={(event) => {
            setSubjectId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">{t('admin.grades.filter.allSubjects')}</option>
          {subjects.data?.data.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subjectName(subject.name)}
            </option>
          ))}
        </SelectField>
      </div>
      <ClearFilters
        visible={filtering}
        onClear={() => {
          setClassId('');
          setStudentId('');
          setSubjectId('');
          setPage(1);
        }}
      />

      {grades.isError ? (
        <div className={CARD}>
          <ErrorState onRetry={() => void grades.refetch()} />
        </div>
      ) : (
        <>
          <DataTable
            caption={t('admin.grades.table.caption')}
            columns={columns}
            rows={rows}
            rowKey={(grade) => grade.id}
            loading={grades.isPending}
            empty={
              filtering ? (
                <EmptyState
                  title={t('admin.grades.noResults.title')}
                  description={t('admin.grades.noResults.description')}
                />
              ) : (
                <EmptyState
                  title={t('admin.grades.empty.title')}
                  description={t('admin.grades.empty.description')}
                />
              )
            }
          />
          {grades.data && (
            <Pagination meta={grades.data.meta} onPageChange={setPage} />
          )}
        </>
      )}

      <GradeEditModal
        grade={editing}
        subjects={subjects.data?.data ?? []}
        onClose={() => setEditing(null)}
        onDelete={() => {
          setDeleting(editing);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={t('admin.grades.delete.title')}
        message={t('admin.grades.delete.message', {
          grade: deleting?.value ?? '',
          subject: deleting ? subjectName(deleting.subject.name) : '',
          name: deleting ? fullName(deleting.student) : '',
        })}
        confirmLabel={t('admin.grades.delete.confirm')}
        danger
        loading={deleteGrade.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
