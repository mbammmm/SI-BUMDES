import { addToSyncQueue } from "@/lib/offline-db";

export type OfflineFetchOptions = RequestInit & {
  queueWhenOffline?: boolean;
};

export async function offlineFetch(url: string, options: OfflineFetchOptions = {}) {
  const { queueWhenOffline = true, ...fetchOptions } = options;

  if (navigator.onLine || !queueWhenOffline) {
    return fetch(url, fetchOptions);
  }

  const method = fetchOptions.method || "GET";
  if (method === "GET") {
    return fetch(url, fetchOptions);
  }

  let body = fetchOptions.body;
  if (body && typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // keep as-is
    }
  }

  await addToSyncQueue({
    endpoint: url,
    method,
    body: body as any,
  });

  return new Response(
    JSON.stringify({ queued: true, message: "Data disimpan secara offline dan akan disinkronkan saat online." }),
    {
      status: 202,
      headers: { "Content-Type": "application/json" },
    }
  );
}
