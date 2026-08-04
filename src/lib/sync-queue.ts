import { getPendingSyncItems, removeSyncItem, incrementRetry } from "@/lib/offline-db";

const API_BASE = typeof window !== "undefined" ? window.location.origin : "";

export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const items = await getPendingSyncItems();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      const res = await fetch(`${API_BASE}${item.endpoint}`, {
        method: item.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.body),
        cache: "no-store",
      });

      if (res.ok) {
        await removeSyncItem(item.id!);
      } else {
        await incrementRetry(item.id!);
      }
    } catch (error) {
      console.error("Sync error:", error);
      await incrementRetry(item.id!);
    }
  }
}

export function setupOnlineSync() {
  if (typeof window === "undefined") return;

  window.addEventListener("online", () => {
    processSyncQueue();
  });

  if (navigator.onLine) {
    processSyncQueue();
  }
}

export function registerBackgroundSync() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    return (registration as any).sync?.register("sync-queue");
  }).catch((error) => {
    console.error("Background sync registration failed:", error);
  });
}
