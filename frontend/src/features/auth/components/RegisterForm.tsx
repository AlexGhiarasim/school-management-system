import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { isValidEmail } from '../../../utils/validators.ts';

const MIN_PASSWORD_LENGTH = 8;

interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const initialValues: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function validate(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.firstName.trim()) errors.firstName = 'Enter your first name.';
  if (!values.lastName.trim()) errors.lastName = 'Enter your last name.';
  if (!isValidEmail(values.email))
    errors.email = 'Enter a valid email address.';
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'The passwords do not match.';
  }

  return errors;
}

export function RegisterForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const bind = (field: keyof RegisterValues) => ({
    name: field,
    value: values[field],
    error: errors[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value })),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(validate(values));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          autoComplete="given-name"
          {...bind('firstName')}
        />
        <TextField
          label="Last name"
          autoComplete="family-name"
          {...bind('lastName')}
        />
      </div>
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@school.test"
        {...bind('email')}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="new-password"
        {...bind('password')}
      />
      <TextField
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        {...bind('confirmPassword')}
      />
      <Button type="submit">Create account</Button>
    </form>
  );
}
