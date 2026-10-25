export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  level: 'tooShort' | 'weak' | 'fair' | 'good' | 'strong';
}

const LEVELS = ['tooShort', 'weak', 'fair', 'good', 'strong'] as const;

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) {
    return { score: 0, level: LEVELS[0] };
  }

  const checks = [
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
    password.length >= 12,
  ];
  const score = Math.max(1, checks.filter(Boolean).length) as 1 | 2 | 3 | 4;

  return { score, level: LEVELS[score] };
}
