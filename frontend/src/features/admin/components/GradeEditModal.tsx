import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { SelectField } from '../../../components/ui/SelectField.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import {
  GRADE_MAX,
  GRADE_MIN,
  isValidGradeDate,
  isValidGradeValue,
} from '../../../utils/validators.ts';
import { useEditGrade } from '../hooks.ts';
import type { AdminGrade, AdminSubject } from '../types.ts';

const TODAY = new Date().toISOString().slice(0, 10);
const GRADES = Array.from(
  { length: GRADE_MAX - GRADE_MIN + 1 },
  (_, index) => GRADE_MAX - index,
);

interface GradeValues {
  subjectId: string;
  value: string;
  date: string;
}

function validate(values: GradeValues) {
  const errors: Partial<Record<keyof GradeValues, FormError>> = {};

  if (!values.subjectId) {
    errors.subjectId = { key: 'teacher.gradeForm.errors.subjectRequired' };
  }
  if (!isValidGradeValue(values.value)) {
    errors.value = { key: 'teacher.gradeForm.errors.gradeInvalid' };
  }
  if (!isValidGradeDate(values.date)) {
    errors.date = { key: 'teacher.gradeForm.errors.dateInvalid' };
  }

  return errors;
}

interface GradeEditFormProps {
  grade: AdminGrade;
  subjects: AdminSubject[];
  onDone: () => void;
}

function GradeEditForm({ grade, subjects, onDone }: GradeEditFormProps) {
  const { t } = useTranslation();
  const subjectName = useSubjectName();
  const { notify } = useToast();
  const mutation = useEditGrade();
  const { field, handleSubmit } = useFormState<GradeValues>(
    {
      subjectId: String(grade.subject.id),
      value: String(grade.value),
      date: grade.date,
    },
    validate,
    t,
  );

  async function save(values: GradeValues) {
    try {
      await mutation.mutateAsync({
        id: grade.id,
        input: {
          subjectId: Number(values.subjectId),
          value: Number(values.value),
          date: values.date,
        },
      });
      notify(t('teacher.gradeForm.updated'), 'success');
      onDone();
    } catch {
      // The error is shown below the form through the mutation state.
    }
  }

  return (
    <form
      onSubmit={(event) => handleSubmit(event, save)}
      noValidate
      className="space-y-4"
    >
      <p className="text-sm text-slate-600">
        {t('admin.grades.editFor', {
          name: `${grade.student.firstName} ${grade.student.lastName}`,
        })}
      </p>
      <SelectField
        label={t('teacher.gradeForm.subject')}
        {...field('subjectId')}
      >
        <option value="">{t('teacher.gradeForm.subjectPlaceholder')}</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subjectName(subject.name)}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label={t('teacher.gradeForm.grade')} {...field('value')}>
          <option value="">{t('teacher.gradeForm.gradePlaceholder')}</option>
          {GRADES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
        <TextField
          label={t('teacher.gradeForm.date')}
          type="date"
          max={TODAY}
          {...field('date')}
        />
      </div>

      {mutation.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {t(getApiErrorKey(mutation.error))}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" fullWidth={false} onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" fullWidth={false} loading={mutation.isPending}>
          {mutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}

interface GradeEditModalProps {
  grade: AdminGrade | null;
  subjects: AdminSubject[];
  onClose: () => void;
}

export function GradeEditModal({
  grade,
  subjects,
  onClose,
}: GradeEditModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={grade !== null}
      onClose={onClose}
      title={t('teacher.gradeForm.editTitle')}
    >
      {grade && (
        <GradeEditForm grade={grade} subjects={subjects} onDone={onClose} />
      )}
    </Modal>
  );
}
