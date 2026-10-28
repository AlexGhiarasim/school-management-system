import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useConfirmedSubmit } from '../../../hooks/useConfirmedSubmit.ts';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useRequestState } from '../../../hooks/useRequestState.ts';
import { ApiError } from '../../../lib/api.ts';
import { saveToken } from '../../../lib/tokenStorage.ts';
import { authService } from '../../../services/authService.ts';
import { validatePassword } from '../../../utils/accountValidation.ts';
import { PASSWORD_MAX_LENGTH } from '../../../utils/validators.ts';
import { getAuthErrorKey } from '../errors.ts';
import { FormAlert } from './FormAlert.tsx';
import { PasswordStrengthMeter } from './PasswordStrengthMeter.tsx';

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function validate(values: PasswordValues) {
  const errors: Partial<Record<keyof PasswordValues, FormError>> = {};

  if (!values.currentPassword) {
    errors.currentPassword = { key: 'auth.errors.passwordRequired' };
  }

  const password = validatePassword(values.newPassword);
  if (password) errors.newPassword = password;

  if (!values.confirmPassword) {
    errors.confirmPassword = { key: 'auth.errors.confirmRequired' };
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = { key: 'auth.errors.passwordsMismatch' };
  }

  return errors;
}

function PasswordForm({
  onDone,
  onChanged,
}: {
  onDone: () => void;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const { values, field, setFieldError, handleSubmit } =
    useFormState<PasswordValues>(EMPTY, validate, t);
  const { loading, error, run } = useRequestState();

  async function save({ currentPassword, newPassword }: PasswordValues) {
    const failure = await run(async () => {
      const { accessToken } = await authService.changePassword(
        currentPassword,
        newPassword,
      );
      saveToken(accessToken);
    });

    if (failure === null) {
      onChanged();
      onDone();
    } else if (failure instanceof ApiError && failure.status === 403) {
      setFieldError('currentPassword', {
        key: 'auth.errors.currentPasswordWrong',
      });
    }
  }

  const confirm = useConfirmedSubmit(save);
  const wrongCurrentPassword =
    error instanceof ApiError && error.status === 403;

  return (
    <>
      <p className="-mt-1 mb-4 text-sm text-slate-500">
        {t('account.password.hint')}
      </p>
      <form
        onSubmit={(event) => handleSubmit(event, confirm.request)}
        noValidate
        className="space-y-4"
      >
        <TextField
          label={t('account.password.current')}
          type="password"
          autoComplete="current-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder="********"
          {...field('currentPassword')}
        />
        <TextField
          label={t('account.password.new')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.newPasswordPlaceholder')}
          {...field('newPassword')}
        >
          <PasswordStrengthMeter password={values.newPassword} />
        </TextField>
        <TextField
          label={t('auth.fields.confirmPassword')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          {...field('confirmPassword')}
        />
        {error != null && !wrongCurrentPassword && (
          <FormAlert>{t(getAuthErrorKey(error))}</FormAlert>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" fullWidth={false} onClick={onDone}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" fullWidth={false} loading={loading}>
            {loading
              ? t('account.password.submitting')
              : t('account.password.submit')}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirm.open}
        title={t('confirm.password.title')}
        message={t('confirm.password.message')}
        confirmLabel={t('confirm.password.confirm')}
        onConfirm={confirm.confirm}
        onCancel={confirm.cancel}
      />
    </>
  );
}

// A button for a profile card that opens the window where the password is
// changed.
export function ChangePasswordButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
      <Button
        variant="secondary"
        fullWidth={false}
        className="px-2.5 py-1 text-xs font-medium"
        onClick={() => {
          setChanged(false);
          setOpen(true);
        }}
      >
        {t('account.password.submit')}
      </Button>
      {changed && (
        <span
          role="status"
          className="animate-fade-in text-sm text-emerald-700"
        >
          {t('account.password.changed')}
        </span>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('account.password.title')}
      >
        <PasswordForm
          onDone={() => setOpen(false)}
          onChanged={() => setChanged(true)}
        />
      </Modal>
    </div>
  );
}
