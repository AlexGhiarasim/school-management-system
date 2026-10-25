import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { isValidEmail } from '../../../utils/validators.ts';

interface LoginErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: LoginErrors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';

    setErrors(nextErrors);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <TextField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@school.test"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <Button type="submit">Sign in</Button>
    </form>
  );
}
