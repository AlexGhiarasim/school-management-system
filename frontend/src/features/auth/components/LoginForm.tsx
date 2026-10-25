import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { usePendingAction } from '../../../hooks/usePendingAction.ts';
import {
  EMAIL_MAX_LENGTH,
  isValidEmail,
  PASSWORD_MAX_LENGTH,
} from '../../../utils/validators.ts';
import { FormNotice } from './FormNotice.tsx';

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
  const { loading, done, run } = usePendingAction();

  return (
    <form
      onSubmit={(event) => handleSubmit(event, run)}
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
      <Button type="submit" loading={loading}>
        {loading ? t('auth.login.submitting') : t('auth.login.submit')}
      </Button>
      {done && <FormNotice>{t('auth.login.notice')}</FormNotice>}
    </form>
  );
}
