import { useEffect, useRef, useCallback } from "react";
import { subscribeRefresh } from "@/lib/refresh";

export function useRefreshOnEvent(callback: () => void, deps: any[] = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return subscribeRefresh(() => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
