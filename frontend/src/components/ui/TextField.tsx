import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { EyeIcon, EyeOffIcon } from './icons.tsx';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  children?: ReactNode;
}

export function TextField({
  label,
  error,
  type,
  children,
  className = '',
  ...props
}: TextFieldProps) {
  const { t } = useTranslation();
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:ring-4 ${
            isPassword ? 'pr-11' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
        {children}
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={
              visible ? t('common.hidePassword') : t('common.showPassword')
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:text-indigo-600"
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 animate-fade-in text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
