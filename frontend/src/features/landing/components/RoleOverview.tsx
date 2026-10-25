import { useTranslation } from 'react-i18next';
import { CheckIcon } from '../../../components/ui/icons.tsx';

const ROLES = ['teacher', 'student'] as const;

export function RoleOverview() {
  const { t } = useTranslation();

  return (
    <ul className="max-w-md space-y-4">
      {ROLES.map((role) => (
        <li
          key={role}
          className="flex items-start gap-4 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <CheckIcon />
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              {t(`landing.roles.${role}.name`)}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {t(`landing.roles.${role}.description`)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
