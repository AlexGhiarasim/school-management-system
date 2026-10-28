import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmSave } from '../../../components/ui/ConfirmSave.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { SelectField } from '../../../components/ui/SelectField.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useConfirmedSubmit } from '../../../hooks/useConfirmedSubmit.ts';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { formatDate } from '../../../utils/format.ts';
import {
  GRADE_MAX,
  GRADE_MIN,
  isValidGradeDate,
  isValidGradeValue,
} from '../../../utils/validators.ts';
import { useSaveGrade } from '../hooks.ts';
import type { Subject, TeacherGrade } from '../types.ts';

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

interface GradeFormProps {
  studentId: number;
  subjects: Subject[];
  grade: TeacherGrade | null;
  onDone: () => void;
}

function GradeForm({ studentId, subjects, grade, onDone }: GradeFormProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const { notify } = useToast();
  const mutation = useSaveGrade();
  const { field, handleSubmit } = useFormState<GradeValues>(
    {
      subjectId: grade ? String(grade.subject.id) : '',
      value: grade ? String(grade.value) : '',
      date: grade?.date ?? TODAY,
    },
    validate,
    t,
  );

  async function save(values: GradeValues) {
    try {
      await mutation.mutateAsync({
        studentId,
        gradeId: grade?.id,
        input: {
          subjectId: Number(values.subjectId),
          value: Number(values.value),
          date: values.date,
        },
      });
      notify(
        t(grade ? 'teacher.gradeForm.updated' : 'teacher.gradeForm.added'),
        'success',
      );
      onDone();
    } catch {
      // The error is shown below the form through the mutation state.
    }
  }

  const confirm = useConfirmedSubmit(save);

  return (
    <>
      <form
        onSubmit={(event) => handleSubmit(event, confirm.request)}
        noValidate
        className="space-y-4"
      >
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
            {mutation.isPending
              ? t('teacher.gradeForm.saving')
              : t('teacher.gradeForm.save')}
          </Button>
        </div>
      </form>
      <ConfirmSave
        entity="grade"
        editing={grade !== null}
        details={
          confirm.values
            ? [
                {
                  label: t('teacher.gradeForm.subject'),
                  value: subjectName(
                    subjects.find(
                      (item) => String(item.id) === confirm.values?.subjectId,
                    )?.name ?? '',
                  ),
                },
                {
                  label: t('teacher.gradeForm.grade'),
                  value: grade
                    ? `${grade.value} → ${confirm.values.value}`
                    : confirm.values.value,
                },
                {
                  label: t('teacher.gradeForm.date'),
                  value: formatDate(confirm.values.date, language),
                },
              ]
            : []
        }
        confirm={confirm}
      />
    </>
  );
}

interface GradeFormModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  subjects: Subject[];
  grade: TeacherGrade | null;
}

export function GradeFormModal({
  open,
  onClose,
  studentId,
  subjects,
  grade,
}: GradeFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        grade ? 'teacher.gradeForm.editTitle' : 'teacher.gradeForm.addTitle',
      )}
    >
      <GradeForm
        studentId={studentId}
        subjects={subjects}
        grade={grade}
        onDone={onClose}
      />
    </Modal>
  );
}
