import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { GradeFormModal } from '../../features/teacher/components/GradeFormModal.tsx';
import {
  useAllClassStudents,
  useStudentGrades,
  useSubjects,
  useTeacherClasses,
} from '../../features/teacher/hooks.ts';
import type { TeacherGrade } from '../../features/teacher/types.ts';
import { GradeBadge } from '../../features/student/components/GradeBadge.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useSubjectName } from '../../hooks/useSubjectName.ts';
import { paths } from '../../routes/paths.ts';
import { formatDate } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function TeacherStudentGradesPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const { user } = useAuth();
  const params = useParams();
  const classId = Number(params.classId);
  const studentId = Number(params.studentId);

  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeacherGrade | null>(null);

  const students = useAllClassStudents(classId);
  const subjects = useSubjects();
  const grades = useStudentGrades(
    studentId,
    subjectFilter ? Number(subjectFilter) : undefined,
    page,
  );

  const student = students.data?.data.find((item) => item.id === studentId);
  const notFound =
    !Number.isInteger(classId) ||
    !Number.isInteger(studentId) ||
    (students.isSuccess && !student);
  const ownProfileId = user?.profile?.id;
  const schoolClass = useTeacherClasses().data?.find(
    (item) => item.id === classId,
  );
  const taughtSubjects = schoolClass?.subjects ?? [];
  const filterSubjects = schoolClass?.isHomeroom
    ? (subjects.data?.data ?? [])
    : taughtSubjects;

  const columns: Column<TeacherGrade>[] = [
    {
      key: 'subject',
      header: t('teacher.studentGrades.table.subject'),
      render: (grade) => (
        <span className="font-medium text-slate-900">
          {subjectName(grade.subject.name)}
        </span>
      ),
    },
    {
      key: 'value',
      header: t('teacher.studentGrades.table.grade'),
      render: (grade) => <GradeBadge value={grade.value} />,
    },
    {
      key: 'date',
      header: t('teacher.studentGrades.table.date'),
      render: (grade) => formatDate(grade.date, language),
    },
    {
      key: 'teacher',
      header: t('teacher.studentGrades.table.teacher'),
      className: 'hidden sm:table-cell',
      render: (grade) =>
        grade.teacher
          ? `${grade.teacher.firstName} ${grade.teacher.lastName}`
          : t('teacher.studentGrades.table.noTeacher'),
    },
    {
      key: 'actions',
      header: t('teacher.studentGrades.table.actions'),
      className: 'text-right',
      render: (grade) =>
        grade.teacher?.id === ownProfileId ? (
          <Button
            variant="secondary"
            fullWidth={false}
            className="px-3 py-1.5"
            onClick={() => setEditing(grade)}
          >
            {t('teacher.studentGrades.table.edit')}
          </Button>
        ) : null,
    },
  ];

  return (
    <section>
      <Link
        to={paths.teacher.classStudents(params.classId ?? '')}
        className="mb-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus-visible:underline"
      >
        {t('teacher.studentGrades.back')}
      </Link>

      {notFound ? (
        <div className={CARD}>
          <EmptyState
            title={t('teacher.studentGrades.notFound.title')}
            description={t('teacher.studentGrades.notFound.description')}
          />
        </div>
      ) : (
        <>
          <PageHeader
            title={
              student
                ? `${student.firstName} ${student.lastName}`
                : t('teacher.studentGrades.title')
            }
            description={
              schoolClass?.isHomeroom
                ? t('teacher.studentGrades.homeroomDescription')
                : t('teacher.studentGrades.description')
            }
            actions={
              taughtSubjects.length > 0 && (
                <Button fullWidth={false} onClick={() => setCreating(true)}>
                  {t('teacher.studentGrades.add')}
                </Button>
              )
            }
          />

          <div className="mb-4 w-full sm:w-64">
            <SelectField
              label={t('teacher.studentGrades.filter.label')}
              value={subjectFilter}
              onChange={(event) => {
                setSubjectFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">{t('teacher.studentGrades.filter.all')}</option>
              {filterSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subjectName(subject.name)}
                </option>
              ))}
            </SelectField>
          </div>

          {grades.isError ? (
            <div className={CARD}>
              <ErrorState onRetry={() => void grades.refetch()} />
            </div>
          ) : (
            <>
              <DataTable
                caption={t('teacher.studentGrades.table.caption')}
                columns={columns}
                rows={grades.data?.data ?? []}
                rowKey={(grade) => grade.id}
                loading={grades.isPending}
                empty={
                  <EmptyState
                    title={t('teacher.studentGrades.empty.title')}
                    description={t('teacher.studentGrades.empty.description')}
                  />
                }
              />
              {grades.data && (
                <Pagination meta={grades.data.meta} onPageChange={setPage} />
              )}
            </>
          )}

          <GradeFormModal
            open={creating || editing !== null}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
            studentId={studentId}
            subjects={taughtSubjects}
            grade={editing}
          />
        </>
      )}
    </section>
  );
}
