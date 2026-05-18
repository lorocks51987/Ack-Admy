import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/services/supabaseClient";
import type { ProgressState } from "@/contexts/ProgressContext";

const STORAGE_KEY = "@ackadmy:progress_v3";

const getStorageKey = (userId?: string) => {
  return userId ? `${STORAGE_KEY}:${userId}` : `${STORAGE_KEY}:anonymous`;
};

export const progressService = {
  async getProgress(userId?: string): Promise<ProgressState | null> {
    try {
      const storageKey = getStorageKey(userId);
      // 1. Tentar pegar do AsyncStorage local primeiro
      const rawLocal = await AsyncStorage.getItem(storageKey);
      const localData: ProgressState | null = rawLocal ? JSON.parse(rawLocal) : null;

      // 2. Se houver usuário logado, buscar da nuvem
      if (userId) {
        const { data: cloudData, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Supabase fetch progress error:", error.message);
          return localData; // Fallback para local
        }

        if (cloudData) {
          const mappedCloud: ProgressState = {
            xp: cloudData.xp || 0,
            completedModules: cloudData.completed_modules || [],
            lives: cloudData.lives ?? 3,
            streak: cloudData.streak || 0,
            lastActivityDate: cloudData.last_activity_date || null,
            totalExercises: cloudData.total_exercises || 0,
            correctAnswers: cloudData.correct_answers || 0,
            moduleXP: cloudData.module_xp || {},
          };

          // Lógica de Merge: se o local tem mais XP, o usuário deve ter jogado offline.
          if (localData && localData.xp > mappedCloud.xp) {
            // Salvar silenciosamente o local mais atualizado na nuvem
            this.saveProgress(localData, userId).catch(() => {});
            return localData;
          }

          // Se a nuvem for mais recente ou igual, usamos ela e sincronizamos o local
          await AsyncStorage.setItem(storageKey, JSON.stringify(mappedCloud));
          return mappedCloud;
        }
      }

      // 3. Retorna os dados locais se não houver nuvem ou user_id
      return localData;
    } catch (err) {
      console.warn("getProgress exception:", err);
      return null;
    }
  },

  async saveProgress(data: ProgressState, userId?: string): Promise<void> {
    try {
      const storageKey = getStorageKey(userId);
      // Sempre salvar localmente (fallback/offline)
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));

      // Se existir usuário, salva na nuvem
      if (userId) {
        const { error } = await supabase.from("user_progress").upsert({
          user_id: userId,
          xp: data.xp,
          completed_modules: data.completedModules,
          correct_answers: data.correctAnswers,
          total_exercises: data.totalExercises,
          streak: data.streak,
          lives: data.lives,
          last_activity_date: data.lastActivityDate,
          module_xp: data.moduleXP,
          sync_pending: false,
        });

        if (error) {
          console.warn("Supabase upsert progress error:", error.message);
          // Opcional: salvaríamos um { sync_pending: true } localmente aqui
        }
      }
    } catch (err) {
      console.warn("saveProgress exception:", err);
    }
  },

  async clearProgress(userId?: string): Promise<void> {
    try {
      const storageKey = getStorageKey(userId);
      // Limpa no local
      await AsyncStorage.removeItem(storageKey);

      // Reseta os contadores no banco, sem deletar o registro
      if (userId) {
        const { error } = await supabase
          .from("user_progress")
          .update({
            xp: 0,
            completed_modules: [],
            correct_answers: 0,
            total_exercises: 0,
            streak: 0,
            lives: 3,
            last_activity_date: null,
            module_xp: {},
          })
          .eq("user_id", userId);

        if (error) {
          console.warn("Supabase clear progress error:", error.message);
        }
      }
    } catch (err) {
      console.warn("clearProgress exception:", err);
    }
  },
};
