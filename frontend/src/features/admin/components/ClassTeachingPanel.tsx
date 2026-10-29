import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';
import { SelectField } from '../../../components/ui/SelectField.tsx';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { fullName } from '../../../utils/format.ts';
import { StudentPanel } from '../../student/components/StudentPanel.tsx';
import {
  useAddTeaching,
  useAllSubjects,
  useAllTeachers,
  useClassTeaching,
  useRemoveTeaching,
} from '../hooks.ts';
import type { TeachingAssignment } from '../types.ts';

interface ClassTeachingPanelProps {
  classId: number;
  className: string;
}

// Who teaches which subject in a class. A teacher can grade only the subjects
// that are given to them here.
export function ClassTeachingPanel({
  classId,
  className,
}: ClassTeachingPanelProps) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const subjectName = useSubjectName();
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [removing, setRemoving] = useState<TeachingAssignment | null>(null);

  const teaching = useClassTeaching(classId);
  const subjects = useAllSubjects();
  const teachers = useAllTeachers();
  const add = useAddTeaching(classId);
  const remove = useRemoveTeaching(classId);

  const assigned = teaching.data ?? [];
  // A subject has one teacher in a class, so only the free ones can be chosen.
  const freeSubjects = (subjects.data?.data ?? []).filter(
    (subject) => !assigned.some((item) => item.subject.id === subject.id),
  );

  async function assign() {
    try {
      await add.mutateAsync({
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
      });
      notify(t('admin.classStudents.teaching.added'), 'success');
      setSubjectId('');
      setTeacherId('');
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    }
  }

  async function confirmRemove() {
    if (!removing) return;

    try {
      await remove.mutateAsync(removing.id);
      notify(t('admin.classStudents.teaching.removed'), 'success');
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <StudentPanel
      title={t('admin.classStudents.teaching.title')}
      className="mb-6"
    >
      <p className="mb-4 text-sm text-slate-500">
        {t('admin.classStudents.teaching.description')}
      </p>

      {teaching.isError ? (
        <p role="alert" className="text-sm text-rose-700">
          {t('common.errorDescription')}
        </p>
      ) : assigned.length === 0 ? (
        !teaching.isPending && (
          <p className="text-sm text-slate-500">
            {t('admin.classStudents.teaching.empty')}
          </p>
        )
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-300">
          {assigned.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <span className="min-w-0">
                <span className="font-medium text-slate-900">
                  {subjectName(item.subject.name)}
                </span>
                <span className="ml-3 text-slate-600">
                  {fullName(item.teacher)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setRemoving(item)}
                className="text-sm font-medium text-rose-600 hover:text-rose-700 focus:outline-none focus-visible:underline"
              >
                {t('admin.classStudents.teaching.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void assign();
        }}
        className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <SelectField
          label={t('admin.classStudents.teaching.subject')}
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
        >
          <option value="">
            {t('admin.classStudents.teaching.chooseSubject')}
          </option>
          {freeSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subjectName(subject.name)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('admin.classStudents.teaching.teacher')}
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
        >
          <option value="">
            {t('admin.classStudents.teaching.chooseTeacher')}
          </option>
          {teachers.data?.data.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {fullName(teacher)}
            </option>
          ))}
        </SelectField>
        <Button
          type="submit"
          fullWidth={false}
          disabled={!subjectId || !teacherId}
          loading={add.isPending}
        >
          {t('admin.classStudents.teaching.assign')}
        </Button>
      </form>

      <ConfirmDialog
        open={removing !== null}
        title={t('admin.classStudents.teaching.removeTitle')}
        message={t('admin.classStudents.teaching.removeMessage', {
          teacher: removing ? fullName(removing.teacher) : '',
          subject: removing ? subjectName(removing.subject.name) : '',
          class: className,
        })}
        confirmLabel={t('admin.classStudents.teaching.remove')}
        danger
        loading={remove.isPending}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setRemoving(null)}
      />
    </StudentPanel>
  );
}
