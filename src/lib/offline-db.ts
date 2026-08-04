import Dexie, { type Table } from "dexie";

export type SyncQueueItem = {
  id?: string;
  endpoint: string;
  method: string;
  body: any;
  createdAt: Date;
  retries: number;
};

class SyncQueueDB extends Dexie {
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("si-bumdes-offline");
    this.version(1).stores({
      syncQueue: "id, endpoint, createdAt, retries",
    });
  }
}

export const syncQueueDb = new SyncQueueDB();

export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "createdAt" | "retries">) {
  await syncQueueDb.syncQueue.add({
    ...item,
    createdAt: new Date(),
    retries: 0,
  });
}

export async function getPendingSyncItems() {
  return syncQueueDb.syncQueue.where("retries").below(3).toArray();
}

export async function removeSyncItem(id: string) {
  await syncQueueDb.syncQueue.delete(id);
}

export async function incrementRetry(id: string) {
  await syncQueueDb.syncQueue.update(id, { retries: 1 });
}
