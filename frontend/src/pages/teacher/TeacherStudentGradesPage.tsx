import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { LoadingPanel } from '../../components/ui/LoadingPanel.tsx';
import { GradeFormModal } from '../../features/teacher/components/GradeFormModal.tsx';
import { TaughtSubjectCard } from '../../features/teacher/components/TaughtSubjectCard.tsx';
import {
  useAllClassStudents,
  useStudentGrades,
  useTeacherClasses,
} from '../../features/teacher/hooks.ts';
import type { TeacherGrade } from '../../features/teacher/types.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { paths } from '../../routes/paths.ts';
import { fullName } from '../../utils/format.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-300';

export default function TeacherStudentGradesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams();
  const classId = Number(params.classId);
  const studentId = Number(params.studentId);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<TeacherGrade | null>(null);

  const students = useAllClassStudents(classId);
  const grades = useStudentGrades(studentId);
  const classes = useTeacherClasses();

  const student = students.data?.data.find((item) => item.id === studentId);
  const notFound =
    !Number.isInteger(classId) ||
    !Number.isInteger(studentId) ||
    (students.isSuccess && !student);

  const schoolClass = classes.data?.find((item) => item.id === classId);
  const taught = schoolClass?.subjects ?? [];
  const all = grades.data?.data ?? [];

  // A class that the teacher only leads is followed from the class teacher pages.
  if (schoolClass?.isHomeroom && taught.length === 0) {
    return <Navigate to={paths.teacher.homeroomStudent(studentId)} replace />;
  }

  return (
    <section>
      <Link
        to={paths.teacher.classStudents(params.classId ?? '')}
        className="mb-4 inline-block text-[15px] font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline"
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
              student ? fullName(student) : t('teacher.studentGrades.title')
            }
            badge={student ? t('roles.STUDENT') : undefined}
            large
            description={t('teacher.studentGrades.description')}
            actions={
              taught.length > 0 && (
                <Button fullWidth={false} onClick={() => setCreating(true)}>
                  {t('teacher.studentGrades.add')}
                </Button>
              )
            }
          />

          {grades.isError && (
            <div className={CARD}>
              <ErrorState onRetry={() => void grades.refetch()} />
            </div>
          )}

          {grades.isPending && <LoadingPanel />}

          {grades.data && (
            <div className="space-y-10">
              {taught.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    {t('teacher.studentGrades.taught', {
                      count: taught.length,
                    })}
                  </h2>
                  <div className="grid items-start gap-4 lg:grid-cols-2">
                    {taught.map((subject) => (
                      <TaughtSubjectCard
                        key={subject.id}
                        subject={subject}
                        grades={all.filter(
                          (grade) => grade.subject.id === subject.id,
                        )}
                        ownProfileId={user?.profile?.id}
                        onEdit={setEditing}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <GradeFormModal
            open={creating || editing !== null}
            onClose={() => {
              setCreating(false);
              setEditing(null);
            }}
            studentId={studentId}
            subjects={taught}
            grade={editing}
          />
        </>
      )}
    </section>
  );
}
