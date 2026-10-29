import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '../../../components/ui/Button.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useAuth } from '../../../hooks/useAuth.ts';
import { useRequestState } from '../../../hooks/useRequestState.ts';
import { paths } from '../../../routes/paths.ts';
import {
  EMAIL_MAX_LENGTH,
  isValidEmail,
  PASSWORD_MAX_LENGTH,
} from '../../../utils/validators.ts';
import { getAuthErrorKey } from '../errors.ts';
import { FormAlert } from './FormAlert.tsx';

interface LoginValues {
  email: string;
  password: string;
}

function validate(values: LoginValues) {
  const errors: Partial<Record<keyof LoginValues, FormError>> = {};

  if (!isValidEmail(values.email)) {
    errors.email = { key: 'auth.errors.emailInvalid' };
  }
  if (!values.password) {
    errors.password = { key: 'auth.errors.passwordRequired' };
  }

  return errors;
}

export function LoginForm() {
  const { t } = useTranslation();
  const { field, handleSubmit } = useFormState<LoginValues>(
    { email: '', password: '' },
    validate,
    t,
  );
  const { login } = useAuth();
  const { loading, error, run } = useRequestState();

  return (
    <form
      onSubmit={(event) =>
        handleSubmit(event, (values) =>
          run(() => login(values.email.trim(), values.password)),
        )
      }
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
      <TextField
        label={t('auth.fields.password')}
        type="password"
        autoComplete="current-password"
        maxLength={PASSWORD_MAX_LENGTH}
        placeholder={t('auth.fields.passwordPlaceholder')}
        {...field('password')}
      />
      <p className="mt-1 mb-3 text-right text-sm">
        <Link
          to={paths.forgotPassword}
          className="font-medium text-slate-500 transition hover:text-brand-600 focus:outline-none focus-visible:underline"
        >
          {t('auth.login.forgot')}
        </Link>
      </p>
      <Button type="submit" loading={loading}>
        {loading ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button>
      {error != null && <FormAlert>{t(getAuthErrorKey(error))}</FormAlert>}
    </form>
  );
}
