"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useAutoRefresh<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, ...deps]);

  return { data, loading, error, refetch };
}
