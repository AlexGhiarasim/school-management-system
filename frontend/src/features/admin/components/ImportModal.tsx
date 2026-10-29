import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { CheckIcon, UploadIcon } from '../../../components/ui/icons.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useToast } from '../../../hooks/useToast.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { downloadText } from '../../../lib/downloadFile.ts';
import { adminService } from '../../../services/adminService.ts';
import { useImportCommit, useImportPreview } from '../hooks.ts';
import type {
  ImportFileError,
  ImportKind,
  ImportPreview,
  ImportResult,
} from '../types.ts';

// The same limit as the server, so a file that is too large is refused at once.
const MAX_FILE_CHARACTERS = 90_000;

// The columns shown in the preview, for each kind of import.
const COLUMNS: Record<ImportKind, string[]> = {
  students: ['lastName', 'firstName', 'email', 'dateOfBirth', 'className'],
  teachers: ['lastName', 'firstName', 'email', 'homeroomClass'],
  classes: ['name', 'homeroomTeacher'],
  subjects: ['name'],
};

// A spreadsheet saved as "CSV" without the UTF-8 option comes in Windows-1250.
async function readText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1250').decode(bytes);
  }
}

function fileErrorText(
  t: (key: string, options?: Record<string, unknown>) => string,
  error: ImportFileError,
  kind: ImportKind,
): string {
  if (error.code === 'missingColumns') {
    return t('import.fileError.missingColumns', {
      columns: error.columns
        .map((column) => t(`import.fields.${kind}.${column}`))
        .join(', '),
    });
  }

  return t(`import.fileError.${error.code}`, {
    max: error.code === 'tooManyRows' ? error.max : undefined,
  });
}

interface ImportContentProps {
  kind: ImportKind;
  onClose: () => void;
}

function ImportContent({ kind, onClose }: ImportContentProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const { notify } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);
  const previewImport = useImportPreview(kind);
  const commitImport = useImportCommit(kind);

  async function choose(file: File | undefined) {
    if (!file) return;

    setTooLarge(false);
    const text = await readText(file);

    if (text.length > MAX_FILE_CHARACTERS) {
      setTooLarge(true);
      return;
    }

    try {
      setPreview(await previewImport.mutateAsync(text));
      setContent(text);
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    }
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void choose(event.dataTransfer.files[0]);
  }

  async function submit() {
    try {
      setResult(await commitImport.mutateAsync(content));
    } catch (error) {
      notify(t(getApiErrorKey(error)), 'error');
    }
  }

  function downloadAccounts(accounts: ImportResult['accounts']) {
    const separator = language === 'ro' ? ';' : ',';
    const header = [
      t('import.accountsHeader.name'),
      t('auth.fields.email'),
      t('import.accountsHeader.password'),
    ];
    const lines = [
      header,
      ...accounts.map((a) => [a.name, a.email, a.password]),
    ];

    downloadText(
      '﻿' + lines.map((line) => line.join(separator)).join('\r\n') + '\r\n',
      'accounts.csv',
    );
  }

  if (result) {
    return (
      <div>
        <p className="flex items-center gap-2 text-[15px] font-medium text-slate-900">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckIcon />
          </span>
          {t(`import.done.${kind}`, { count: result.created })}
        </p>
        {result.skipped > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            {t('import.skipped', { count: result.skipped })}
          </p>
        )}

        {result.accounts.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              {t('import.generatedPasswords', {
                count: result.accounts.length,
              })}
            </p>
            <Button
              variant="secondary"
              fullWidth={false}
              className="mt-3"
              onClick={() => downloadAccounts(result.accounts)}
            >
              {t('import.downloadAccounts')}
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button fullWidth={false} onClick={onClose}>
            {t('import.finish')}
          </Button>
        </div>
      </div>
    );
  }

  if (preview && !preview.fileError) {
    const columns = COLUMNS[kind];
    const rows = onlyErrors
      ? preview.rows.filter(({ errors }) => errors.length > 0)
      : preview.rows;

    return (
      <div>
        <p className="text-sm text-slate-600">
          {t('import.summary', {
            total: preview.total,
            valid: preview.valid,
            invalid: preview.invalid,
          })}
        </p>
        {preview.invalid > 0 && (
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onlyErrors}
              onChange={(event) => setOnlyErrors(event.target.checked)}
            />
            {t('import.onlyErrors')}
          </label>
        )}

        <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-slate-300">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{t('import.preview')}</caption>
            <thead className="sticky top-0 bg-slate-100 text-xs font-semibold tracking-wide text-slate-600 uppercase">
              <tr>
                <th scope="col" className="px-3 py-2">
                  {t('import.line')}
                </th>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-2">
                    {t(`import.fields.${kind}.${column}`)}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2">
                  {t('import.status')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr
                  key={row.line}
                  className={row.errors.length > 0 ? 'bg-rose-50/60' : ''}
                >
                  <td className="px-3 py-2 text-slate-400 tabular-nums">
                    {row.line}
                  </td>
                  {columns.map((column) => (
                    <td key={column} className="px-3 py-2 text-slate-700">
                      {row.values[column] || '-'}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {row.errors.length === 0 ? (
                      <span className="font-medium text-emerald-700">
                        {t('import.ok')}
                      </span>
                    ) : (
                      <ul className="space-y-0.5 text-rose-700">
                        {row.errors.map(({ field, code }) => (
                          <li key={`${field}-${code}`}>
                            {t(`import.errors.${code}`, {
                              field: t(`import.fields.${kind}.${field}`),
                            })}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {preview.invalid > 0 && (
          <p className="mt-3 text-sm text-slate-500">{t('import.skipNote')}</p>
        )}
        {(kind === 'students' || kind === 'teachers') && (
          <p className="mt-1 text-sm text-slate-500">
            {t('import.passwordNote')}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button
            variant="secondary"
            fullWidth={false}
            onClick={() => {
              setPreview(null);
              setOnlyErrors(false);
            }}
          >
            {t('import.chooseAnother')}
          </Button>
          <Button
            fullWidth={false}
            disabled={preview.valid === 0}
            loading={commitImport.isPending}
            onClick={() => void submit()}
          >
            {t(`import.confirm.${kind}`, { count: preview.valid })}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-600">{t('import.description')}</p>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
        className={`mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <span className="text-slate-400">
          <UploadIcon />
        </span>
        <span className="text-sm font-medium text-slate-900">
          {previewImport.isPending ? t('common.loading') : t('import.choose')}
        </span>
        <span className="text-xs text-slate-500">{t('import.dropHint')}</span>
        <input
          ref={input}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          className="sr-only"
          onChange={(event) => {
            void choose(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>

      {(tooLarge || preview?.fileError) && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
        >
          {tooLarge
            ? t('import.fileError.tooLarge')
            : preview?.fileError && fileErrorText(t, preview.fileError, kind)}
        </p>
      )}

      <p className="mt-4 text-xs text-slate-500">
        {t(`import.columns.${kind}`)}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            void adminService.downloadImportTemplate(kind, language)
          }
          className="text-sm font-medium text-brand-600 hover:text-brand-500 focus:outline-none focus-visible:underline"
        >
          {t('import.template')}
        </button>
        <Button variant="secondary" fullWidth={false} onClick={onClose}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}

interface ImportModalProps {
  kind: ImportKind;
  open: boolean;
  onClose: () => void;
}

export function ImportModal({ kind, open, onClose }: ImportModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(`import.title.${kind}`)}
      extraWide
    >
      <ImportContent kind={kind} onClose={onClose} />
    </Modal>
  );
}
