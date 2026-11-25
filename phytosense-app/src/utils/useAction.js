import { useCallback, useRef, useState } from 'react';

// Wraps an async function with loading + error state for controllers.
export function useAction(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      return await ref.current(...args);
    } catch (e) {
      setError(e.message || 'Something went wrong');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, setError };
}
