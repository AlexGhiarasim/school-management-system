import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadIcon } from '../../../components/ui/icons.tsx';
import type { ImportKind } from '../types.ts';
import { ImportModal } from './ImportModal.tsx';

// A quiet button, next to the main one, that opens the import window.
export function ImportButton({ kind }: { kind: ImportKind }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition hover:text-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
      >
        <UploadIcon />
        {t('import.button')}
      </button>
      <ImportModal kind={kind} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
