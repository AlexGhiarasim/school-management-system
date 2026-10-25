import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import {
  useClassStudents,
  useTeacherClasses,
} from '../../features/teacher/hooks.ts';
import type { ClassStudent } from '../../features/teacher/types.ts';
import { paths } from '../../routes/paths.ts';
import { formatDate } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';

export default function ClassStudentsPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const classId = Number(useParams().classId);
  const [page, setPage] = useState(1);

  const classes = useTeacherClasses();
  const students = useClassStudents(classId, page);
  const schoolClass = classes.data?.find((item) => item.id === classId);

  const columns: Column<ClassStudent>[] = [
    {
      key: 'name',
      header: t('teacher.classStudents.table.name'),
      render: (student) => (
        <span className="font-medium text-slate-900">
          {student.lastName} {student.firstName}
        </span>
      ),
    },
    {
      key: 'email',
      header: t('teacher.classStudents.table.email'),
      className: 'hidden sm:table-cell',
      render: (student) => student.email,
    },
    {
      key: 'dateOfBirth',
      header: t('teacher.classStudents.table.dateOfBirth'),
      render: (student) => formatDate(student.dateOfBirth, language),
    },
    {
      key: 'grades',
      header: t('teacher.classStudents.table.grades'),
      className: 'text-right',
      render: (student) => (
        <Link
          to={paths.teacher.studentGrades(classId, student.id)}
          className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus-visible:underline"
        >
          {t('teacher.classStudents.table.viewGrades')}
        </Link>
      ),
    },
  ];

  const notFound =
    !Number.isInteger(classId) || (classes.isSuccess && !schoolClass);

  return (
    <section>
      <Link
        to={paths.teacher.classes}
        className="mb-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus-visible:underline"
      >
        {t('teacher.classStudents.back')}
      </Link>

      {notFound ? (
        <div className={CARD}>
          <EmptyState
            title={t('teacher.classStudents.notFound.title')}
            description={t('teacher.classStudents.notFound.description')}
          />
        </div>
      ) : (
        <>
          <PageHeader
            title={
              schoolClass
                ? t('teacher.classStudents.title', { name: schoolClass.name })
                : t('nav.teacher.classes')
            }
            description={t('teacher.classStudents.description')}
          />

          {students.isError ? (
            <div className={CARD}>
              <ErrorState onRetry={() => void students.refetch()} />
            </div>
          ) : (
            <>
              <DataTable
                caption={t('teacher.classStudents.table.caption')}
                columns={columns}
                rows={students.data?.data ?? []}
                rowKey={(student) => student.id}
                loading={students.isPending}
                empty={
                  <EmptyState
                    title={t('teacher.classStudents.empty.title')}
                    description={t('teacher.classStudents.empty.description')}
                  />
                }
              />
              {students.data && (
                <Pagination meta={students.data.meta} onPageChange={setPage} />
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
