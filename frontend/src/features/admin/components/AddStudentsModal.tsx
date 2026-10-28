import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';
import { EmptyState } from '../../../components/ui/EmptyState.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { Skeleton } from '../../../components/ui/Skeleton.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { useAdminStudents, useAssignStudentClass } from '../hooks.ts';
import { NO_CLASS_FILTER, type AdminStudent } from '../types.ts';

interface AddStudentsPanelProps {
  classId: number;
  className: string;
  onDone: () => void;
}

function AddStudentsPanel({
  classId,
  className,
  onDone,
}: AddStudentsPanelProps) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [adding, setAdding] = useState<number | null>(null);
  const [candidate, setCandidate] = useState<AdminStudent | null>(null);

  const students = useAdminStudents({
    page: 1,
    search: debouncedSearch,
    classFilter: NO_CLASS_FILTER,
  });
  const assign = useAssignStudentClass();
  const rows = students.data?.data ?? [];

  async function add(studentId: number) {
    setAdding(studentId);

    try {
      await assign.mutateAsync({ studentId, classId });
      notify(t('admin.classStudents.addModal.added'), 'success');
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    } finally {
      setAdding(null);
    }
  }

  return (
    <div>
      <TextField
        label={t('admin.classStudents.addModal.search')}
        type="search"
        name="search"
        value={search}
        placeholder={t('admin.classStudents.addModal.searchPlaceholder')}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="mt-4 max-h-80 overflow-y-auto rounded-xl ring-1 ring-slate-200">
        {students.isPending && (
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        )}

        {students.isSuccess && rows.length === 0 && (
          <EmptyState
            title={t(
              debouncedSearch.trim()
                ? 'admin.classStudents.addModal.noResults.title'
                : 'admin.classStudents.addModal.empty.title',
            )}
            description={t(
              debouncedSearch.trim()
                ? 'admin.classStudents.addModal.noResults.description'
                : 'admin.classStudents.addModal.empty.description',
            )}
          />
        )}

        {rows.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {rows.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {student.lastName} {student.firstName}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {student.email}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  fullWidth={false}
                  className="px-3 py-1.5"
                  loading={adding === student.id}
                  onClick={() => setCandidate(student)}
                >
                  {t('admin.classStudents.addModal.add')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button fullWidth={false} onClick={onDone}>
          {t('admin.classStudents.addModal.done')}
        </Button>
      </div>

      <ConfirmDialog
        open={candidate !== null}
        title={t('confirm.assign.title')}
        message={t('confirm.assign.message', { name: className })}
        details={
          candidate
            ? [
                {
                  label: t('confirm.assign.student'),
                  value: `${candidate.lastName} ${candidate.firstName}`,
                },
                { label: t('confirm.assign.class'), value: className },
              ]
            : []
        }
        confirmLabel={t('confirm.add')}
        onConfirm={() => {
          if (candidate) void add(candidate.id);
          setCandidate(null);
        }}
        onCancel={() => setCandidate(null)}
      />
    </div>
  );
}

interface AddStudentsModalProps {
  open: boolean;
  onClose: () => void;
  classId: number;
  className: string;
}

export function AddStudentsModal({
  open,
  onClose,
  classId,
  className,
}: AddStudentsModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('admin.classStudents.addModal.title', { name: className })}
    >
      <AddStudentsPanel
        classId={classId}
        className={className}
        onDone={onClose}
      />
    </Modal>
  );
}
