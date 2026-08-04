"use client";

import { useEffect } from "react";
import { setupOnlineSync, registerBackgroundSync } from "@/lib/sync-queue";

export default function SyncInitializer() {
  useEffect(() => {
    setupOnlineSync();
    registerBackgroundSync();

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === "PROCESS_SYNC_QUEUE") {
          setupOnlineSync();
        }
      };

      navigator.serviceWorker.addEventListener("message", handler);
      return () => {
        navigator.serviceWorker.removeEventListener("message", handler);
      };
    }
  }, []);

  return null;
}
