import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProgressState } from "@/contexts/ProgressContext";

const STORAGE_KEY = "@ackadmy:progress_v2";

export const progressService = {
  async getProgress(): Promise<ProgressState | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ProgressState;
    } catch {
      return null;
    }
  },

  async saveProgress(data: ProgressState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Local storage failure is silent — data is still in memory
    }
  },

  async clearProgress(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  },

  // Placeholder — wire this up once backend auth (deviceId) is implemented
  async syncProgressWithApi(_deviceId: string, _data: ProgressState): Promise<void> {
    // TODO: POST /api/progress/:deviceId with JSON body
    // Intentionally no-op until auth layer is ready
  },
};
