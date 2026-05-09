// src/hooks/useFetch.js
// Reusable data-fetching hook with loading + error states
import { useState, useEffect, useCallback } from "react";

const useFetch = (fetchFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchFn();
    if (result.error) setError(result.error);
    else setData(result.data);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
};

export default useFetch;
