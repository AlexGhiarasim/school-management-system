import { useEffect, useRef, useState } from 'react';

export function usePendingAction(duration = 900) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function run() {
    window.clearTimeout(timer.current);
    setDone(false);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, duration);
  }

  return { loading, done, run };
}
