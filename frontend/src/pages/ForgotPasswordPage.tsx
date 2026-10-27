import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AuthPageLayout } from '../components/layout/AuthPageLayout.tsx';
import { Button } from '../components/ui/Button.tsx';
import { TextField } from '../components/ui/TextField.tsx';
import { FormAlert } from '../features/auth/components/FormAlert.tsx';
import { getAuthErrorKey } from '../features/auth/errors.ts';
import { useFormState, type FormError } from '../hooks/useFormState.ts';
import { useRequestState } from '../hooks/useRequestState.ts';
import { paths } from '../routes/paths.ts';
import { authService } from '../services/authService.ts';
import { EMAIL_MAX_LENGTH, isValidEmail } from '../utils/validators.ts';

const LINK_CLASS =
  'font-semibold text-indigo-600 transition hover:text-indigo-500 hover:underline focus:outline-none focus-visible:underline';

interface ForgotValues {
  email: string;
}

function validate({ email }: ForgotValues) {
  const errors: Partial<Record<keyof ForgotValues, FormError>> = {};

  if (!isValidEmail(email)) {
    errors.email = { key: 'auth.errors.emailInvalid' };
  }

  return errors;
}

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  const [sent, setSent] = useState(false);
  const { field, handleSubmit } = useFormState<ForgotValues>(
    { email: '' },
    validate,
    t,
  );
  const { loading, error, run } = useRequestState();

  async function submit({ email }: ForgotValues) {
    const failure = await run(() =>
      authService.forgotPassword(email.trim(), i18n.resolvedLanguage ?? 'ro'),
    );

    if (failure === null) setSent(true);
  }

  return (
    <AuthPageLayout>
      {sent ? (
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.forgot.sentTitle')}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {t('auth.forgot.sentText')}
          </p>
          <p className="mt-6 text-sm">
            <Link to={paths.home} className={LINK_CLASS}>
              {t('auth.forgot.back')}
            </Link>
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t('auth.forgot.title')}
          </h1>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            {t('auth.forgot.subtitle')}
          </p>
          <form
            onSubmit={(event) => handleSubmit(event, submit)}
            noValidate
            className="space-y-4"
          >
            <TextField
              label={t('auth.fields.email')}
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={EMAIL_MAX_LENGTH}
              placeholder={t('auth.fields.emailPlaceholder')}
              {...field('email')}
            />
            <Button type="submit" loading={loading}>
              {loading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
            </Button>
            {error != null && (
              <FormAlert>{t(getAuthErrorKey(error))}</FormAlert>
            )}
          </form>
          <p className="mt-5 text-center text-sm">
            <Link to={paths.home} className={LINK_CLASS}>
              {t('auth.forgot.back')}
            </Link>
          </p>
        </>
      )}
    </AuthPageLayout>
  );
}
