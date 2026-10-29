import { useTranslation } from 'react-i18next';
import { useSubjectName } from '../../../hooks/useSubjectName.ts';
import { formatShortDate } from '../../../utils/format.ts';
import type { GradeAuditAction, GradeChange } from '../types.ts';

const ACTION_TONES: Record<GradeAuditAction, string> = {
  CREATED: 'bg-emerald-50 text-emerald-800',
  UPDATED: 'bg-brand-50 text-brand-700',
  DELETED: 'bg-rose-50 text-rose-800',
};

export function GradeActionBadge({ action }: { action: GradeAuditAction }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_TONES[action]}`}
    >
      {t(`admin.activity.actions.${action}`)}
    </span>
  );
}

// Describes what changed, for example "7 → 9" or "Mathematics → Physics".
export function GradeChangeSummary({ change }: { change: GradeChange }) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const subjectName = useSubjectName();
  const parts: string[] = [];

  if (change.action === 'CREATED') {
    parts.push(String(change.newValue));
  } else if (change.action === 'DELETED') {
    parts.push(String(change.oldValue));
  } else {
    if (change.oldValue !== change.newValue) {
      parts.push(`${change.oldValue} → ${change.newValue}`);
    }
    if (change.previousSubjectName) {
      parts.push(
        `${subjectName(change.previousSubjectName)} → ${subjectName(change.subjectName)}`,
      );
    }
    if (change.oldDate && change.newDate && change.oldDate !== change.newDate) {
      parts.push(
        t('admin.activity.dateChange', {
          from: formatShortDate(change.oldDate, language),
          to: formatShortDate(change.newDate, language),
        }),
      );
    }
  }

  return (
    <span className="font-medium text-slate-900 tabular-nums">
      {parts.join(' · ')}
    </span>
  );
}
