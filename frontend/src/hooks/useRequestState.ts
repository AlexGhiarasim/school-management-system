import { useState } from 'react';

export function useRequestState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function run(action: () => Promise<void>): Promise<unknown> {
    setLoading(true);
    setError(null);

    try {
      await action();
      return null;
    } catch (caught) {
      setError(caught);
      return caught;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, run };
}
