import { useState } from 'react';

// Holds the values of a valid form until the user confirms the action.
export function useConfirmedSubmit<T>(
  run: (values: T) => void | Promise<void>,
) {
  const [pending, setPending] = useState<T | null>(null);

  return {
    values: pending,
    open: pending !== null,
    request: (values: T) => setPending(values),
    cancel: () => setPending(null),
    confirm: () => {
      if (pending === null) return;

      const values = pending;
      setPending(null);
      void run(values);
    },
  };
}
