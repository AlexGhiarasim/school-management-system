import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { fieldClasses } from './fieldClasses.ts';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({
  label,
  error,
  className = '',
  children,
  ...props
}: SelectFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldClasses(!!error)} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={errorId} className="mt-1.5 animate-fade-in text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
