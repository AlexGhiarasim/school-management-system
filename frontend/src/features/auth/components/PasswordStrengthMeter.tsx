import { useTranslation } from 'react-i18next';
import { getPasswordStrength } from '../../../utils/password.ts';

const BAR_COLORS = [
  'bg-red-400',
  'bg-red-400',
  'bg-amber-400',
  'bg-lime-500',
  'bg-emerald-500',
];

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const { t } = useTranslation();

  if (!password) {
    return null;
  }

  const { score, level } = getPasswordStrength(password);

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-1 flex gap-1">
      {[1, 2, 3, 4].map((segment) => (
        <span
          key={segment}
          className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
            segment <= score ? BAR_COLORS[score] : 'bg-slate-200'
          }`}
        />
      ))}
      <span className="sr-only" aria-live="polite">
        {t('auth.strength.label', { level: t(`auth.strength.${level}`) })}
      </span>
    </div>
  );
}
