import type { TFunction } from 'i18next';
import { useState, type ChangeEvent, type FormEvent } from 'react';

export interface FormError {
  key: string;
  values?: Record<string, unknown>;
}

type Errors<T> = Partial<Record<keyof T, FormError>>;

export function useFormState<T extends object>(
  initialValues: T,
  validate: (values: T) => Errors<T>,
  t: TFunction,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Errors<T>>({});

  function clearError(name: keyof T) {
    setErrors((current) => {
      if (!current[name]) return current;

      const { [name]: _removed, ...rest } = current;
      return rest as Errors<T>;
    });
  }

  function setFieldError(name: keyof T, error: FormError) {
    setErrors((current) => ({ ...current, [name]: error }));
  }

  function field(name: keyof T & string) {
    const error = errors[name];

    return {
      name,
      value: values[name] as string,
      error: error ? t(error.key, error.values) : undefined,
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setValues((current) => ({ ...current, [name]: event.target.value }));
        clearError(name);
      },
    };
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    onValid: (values: T) => void,
  ) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const [firstInvalid] = Object.keys(nextErrors);
    if (firstInvalid) {
      const input = event.currentTarget.elements.namedItem(firstInvalid);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    onValid(values);
  }

  return { values, setValues, field, setFieldError, handleSubmit };
}
