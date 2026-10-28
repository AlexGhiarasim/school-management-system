import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/layout/PageHeader.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ErrorState } from '../../components/ui/ErrorState.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { GradeFormModal } from '../../features/teacher/components/GradeFormModal.tsx';
import { TaughtSubjectCard } from '../../features/teacher/components/TaughtSubjectCard.tsx';
import {
  useAllClassStudents,
  useClassTeaching,
  useStudentGrades,
  useTeacherClasses,
} from '../../features/teacher/hooks.ts';
import type { TeacherGrade } from '../../features/teacher/types.ts';
import { SubjectAverages } from '../../features/student/components/SubjectAverages.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { paths } from '../../routes/paths.ts';
import { formatNumber } from '../../utils/format.ts';
import { averageBySubject, overallAverage } from '../../utils/grades.ts';

const CARD = 'rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200';
const LABEL = 'text-xs font-medium tracking-wide text-slate-500 uppercase';

export default function TeacherStudentGradesPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
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
  const isHomeroom = schoolClass?.isHomeroom ?? false;
  // Only the class teacher can see who teaches what in the class.
  const teaching = useClassTeaching(classId, isHomeroom);
  const teacherNames = Object.fromEntries(
    (teaching.data ?? []).map(({ subject, teacher }) => [
      subject.id,
      `${teacher.firstName} ${teacher.lastName}`,
    ]),
  );
  const all = grades.data?.data ?? [];
  const bySubject = averageBySubject(all);
  const average = overallAverage(bySubject);

  const description = isHomeroom
    ? t(
        taught.length > 0
          ? 'teacher.studentGrades.homeroomDescription'
          : 'teacher.studentGrades.homeroomOnlyDescription',
      )
    : t('teacher.studentGrades.description');

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
            badge={student ? t('roles.STUDENT') : undefined}
            large
            description={description}
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

          {grades.isPending && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          )}

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

              {isHomeroom && (
                <div>
                  <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {t('teacher.studentGrades.overview.title')}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t('teacher.studentGrades.overview.readOnly')}
                    </p>
                  </div>

                  {all.length === 0 ? (
                    <div className={CARD}>
                      <EmptyState
                        title={t('teacher.studentGrades.empty.title')}
                        description={t(
                          'teacher.studentGrades.empty.description',
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className={CARD}>
                          <p className={LABEL}>
                            {t('student.grades.summary.average')}
                          </p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            {average === null
                              ? '-'
                              : formatNumber(average, language)}
                          </p>
                        </div>
                        <div className={CARD}>
                          <p className={LABEL}>
                            {t('student.grades.summary.grades')}
                          </p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            {all.length}
                          </p>
                        </div>
                        <div className={CARD}>
                          <p className={LABEL}>
                            {t('student.grades.summary.subjects')}
                          </p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            {bySubject.length}
                          </p>
                        </div>
                      </div>
                      <SubjectAverages
                        subjects={bySubject}
                        grades={all}
                        teachers={teacherNames}
                      />
                    </div>
                  )}
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
