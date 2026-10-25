import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { AlertIcon, CheckIcon, CloseIcon } from './icons.tsx';
import { ToastContext, type ToastType } from './toastContext.ts';

const AUTO_DISMISS_MS = 5000;

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-white text-slate-800 ring-slate-200',
};

interface ToastItemData {
  id: number;
  message: string;
  type: ToastType;
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItemData;
  onDismiss: (id: number) => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <li
      className={`pointer-events-auto flex animate-fade-in items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${STYLES[toast.type]}`}
    >
      {toast.type === 'success' ? <CheckIcon /> : <AlertIcon />}
      <span className="flex-1 pt-0.5">{toast.message}</span>
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={() => onDismiss(toast.id)}
        className="rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <CloseIcon />
      </button>
    </li>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((current) => [
      ...current,
      { id: Date.now() + Math.random(), message, type },
    ]);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ul
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </ul>
    </ToastContext.Provider>
  );
}
