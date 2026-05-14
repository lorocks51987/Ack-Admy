// In-memory store — replace with Drizzle + PostgreSQL when ready
const store = new Map<string, unknown>();

export const progressService = {
  get(deviceId: string): unknown | null {
    return store.get(deviceId) ?? null;
  },

  save(deviceId: string, data: unknown): void {
    store.set(deviceId, data);
  },

  delete(deviceId: string): void {
    store.delete(deviceId);
  },
};
