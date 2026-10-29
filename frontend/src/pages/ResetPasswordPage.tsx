import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { AuthPageLayout } from '../components/layout/AuthPageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import { TextField } from '../components/ui/TextField.tsx';
import { FormAlert } from '../features/auth/components/FormAlert.tsx';
import { PasswordStrengthMeter } from '../features/auth/components/PasswordStrengthMeter.tsx';
import { getAuthErrorKey } from '../features/auth/errors.ts';
import { useFormState, type FormError } from '../hooks/useFormState.ts';
import { useRequestState } from '../hooks/useRequestState.ts';
import { ApiError } from '../lib/api.ts';
import { paths } from '../routes/paths.ts';
import { authService } from '../services/authService.ts';
import { validatePassword } from '../utils/accountValidation.ts';
import { PASSWORD_MAX_LENGTH } from '../utils/validators.ts';

const LINK_CLASS =
  'font-semibold text-brand-600 transition hover:text-brand-500 hover:underline focus:outline-none focus-visible:underline';

interface ResetValues {
  password: string;
  confirmPassword: string;
}

function validate(values: ResetValues) {
  const errors: Partial<Record<keyof ResetValues, FormError>> = {};

  const password = validatePassword(values.password);
  if (password) errors.password = password;

  if (!values.confirmPassword) {
    errors.confirmPassword = { key: 'auth.errors.confirmRequired' };
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = { key: 'auth.errors.passwordsMismatch' };
  }

  return errors;
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const token = useSearchParams()[0].get('token') ?? '';
  const [done, setDone] = useState(false);
  const { values, field, handleSubmit } = useFormState<ResetValues>(
    { password: '', confirmPassword: '' },
    validate,
    t,
  );
  const { loading, error, run } = useRequestState();

  async function submit({ password }: ResetValues) {
    const failure = await run(() => authService.resetPassword(token, password));

    if (failure === null) setDone(true);
  }

  const linkInvalid =
    !token || (error instanceof ApiError && error.status === 400);

  if (done) {
    return (
      <AuthPageLayout>
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.reset.doneTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('auth.reset.doneText')}
          </p>
          <Link
            to={paths.home}
            className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
          >
            {t('auth.reset.goLogin')}
          </Link>
        </div>
      </AuthPageLayout>
    );
  }

  if (linkInvalid) {
    return (
      <AuthPageLayout>
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.reset.invalidTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('auth.reset.invalidText')}
          </p>
          <p className="mt-6 text-sm">
            <Link to={paths.forgotPassword} className={LINK_CLASS}>
              {t('auth.reset.requestNew')}
            </Link>
          </p>
        </div>
      </AuthPageLayout>
    );
  }

  return (
    <AuthPageLayout>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {t('auth.reset.title')}
      </h1>
      <p className="mt-1 mb-5 text-sm text-slate-500">
        {t('auth.reset.subtitle')}
      </p>
      <form
        onSubmit={(event) => handleSubmit(event, submit)}
        noValidate
        className="space-y-4"
      >
        <TextField
          label={t('auth.reset.newPassword')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.newPasswordPlaceholder')}
          {...field('password')}
        >
          <PasswordStrengthMeter password={values.password} />
        </TextField>
        <TextField
          label={t('auth.fields.confirmPassword')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          {...field('confirmPassword')}
        />
        <Button type="submit" loading={loading}>
          {loading ? t('auth.reset.submitting') : t('auth.reset.submit')}
        </Button>
        {error != null && <FormAlert>{t(getAuthErrorKey(error))}</FormAlert>}
      </form>
    </AuthPageLayout>
  );
}
