import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COPIED_MS = 1600;

interface ProfileFieldProps {
  label: string;
  value: string;
  copyable?: boolean;
  wide?: boolean;
}

// One detail of a profile. It lights up on hover, and a copyable one shows a
// small button to copy its value.
export function ProfileField({
  label,
  value,
  copyable,
  wide,
}: ProfileFieldProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // The value stays selectable when the clipboard is not available.
    }
  }

  return (
    <div
      className={`group min-w-0 rounded-lg border border-slate-300 bg-slate-50/60 px-4 py-3 transition-colors hover:bg-slate-50 ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <dt className="text-[13px] font-medium tracking-wide text-slate-600 uppercase">
        {label}
      </dt>
      <dd className="relative mt-1 text-[15px] text-slate-900">
        <span className="[overflow-wrap:anywhere]">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => void copy()}
            className={`absolute -top-5 right-0 text-xs font-medium transition ${
              copied
                ? 'text-emerald-700'
                : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 focus-visible:opacity-100'
            }`}
          >
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        )}
      </dd>
    </div>
  );
}
