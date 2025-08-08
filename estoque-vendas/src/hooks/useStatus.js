import { useCallback, useEffect, useState } from 'react';

export default function useStatus(refreshInterval = 10000) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async (signal) => {
    try {
      const res = await fetch('/api/status', { signal });
      if (!res.ok) throw new Error('Failed to fetch status');
      const json = await res.json();
      setStatus(json);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStatus(controller.signal);
    const interval = setInterval(() => {
      const ctrl = new AbortController();
      fetchStatus(ctrl.signal);
    }, refreshInterval);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchStatus, refreshInterval]);

  return { status, error, loading: !status && !error };
}
