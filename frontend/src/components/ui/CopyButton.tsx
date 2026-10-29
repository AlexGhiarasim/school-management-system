import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const COPIED_MS = 1600;

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

// Copies a value to the clipboard and says so for a moment.
export function CopyButton({ value, label, className = '' }: CopyButtonProps) {
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
    <button
      type="button"
      onClick={() => void copy()}
      className={`text-sm font-medium transition ${
        copied ? 'text-emerald-700' : 'text-brand-600 hover:text-brand-700'
      } focus:outline-none focus-visible:underline ${className}`}
    >
      {copied ? t('common.copied') : (label ?? t('common.copy'))}
    </button>
  );
}
