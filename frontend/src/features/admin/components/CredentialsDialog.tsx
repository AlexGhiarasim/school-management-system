import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { CopyButton } from '../../../components/ui/CopyButton.tsx';
import { EyeIcon, EyeOffIcon } from '../../../components/ui/icons.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';

export interface Credentials {
  name: string;
  email: string;
  password: string;
}

interface CredentialsDialogProps {
  credentials: Credentials | null;
  onClose: () => void;
}

function CredentialsContent({
  credentials,
  onClose,
}: {
  credentials: Credentials;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <p className="text-sm text-slate-600">
        {t('credentials.message', { name: credentials.name })}
      </p>

      <dl className="mt-4 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t('auth.fields.email')}
            </dt>
            <dd className="mt-1 font-mono text-base break-all text-slate-900">
              {credentials.email}
            </dd>
          </div>
          <CopyButton value={credentials.email} />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t('auth.fields.password')}
            </dt>
            <dd className="mt-1 font-mono text-base break-all text-slate-900">
              {visible
                ? credentials.password
                : '•'.repeat(credentials.password.length)}
            </dd>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              aria-label={
                visible ? t('common.hidePassword') : t('common.showPassword')
              }
              className="text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:text-brand-600"
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <CopyButton value={credentials.password} />
          </div>
        </div>
      </dl>

      <p className="mt-4 text-sm text-slate-500">{t('credentials.warning')}</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <CopyButton
          value={`${t('auth.fields.email')}: ${credentials.email}\n${t('auth.fields.password')}: ${credentials.password}`}
          label={t('credentials.copyAll')}
        />
        <Button fullWidth={false} onClick={onClose}>
          {t('credentials.done')}
        </Button>
      </div>
    </>
  );
}

// Shown once after an account is created: the password cannot be read again.
export function CredentialsDialog({
  credentials,
  onClose,
}: CredentialsDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={credentials !== null}
      onClose={onClose}
      title={t('credentials.title')}
    >
      {credentials && (
        <CredentialsContent credentials={credentials} onClose={onClose} />
      )}
    </Modal>
  );
}
