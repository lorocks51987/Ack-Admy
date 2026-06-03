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
      let localData: ProgressState | null = rawLocal ? JSON.parse(rawLocal) : null;

      // Se houver usuário logado, mas não temos dados locais para ele,
      // vamos verificar se existe progresso de visitante (anônimo) para migrar!
      if (userId && !localData) {
        const anonKey = getStorageKey(undefined);
        const rawAnon = await AsyncStorage.getItem(anonKey);
        if (rawAnon) {
          const anonData: ProgressState = JSON.parse(rawAnon);
          if (anonData.xp > 0 || anonData.completedModules.length > 0) {
            localData = anonData;
            // Salva esse progresso na chave do usuário logado
            await AsyncStorage.setItem(storageKey, JSON.stringify(localData));
            // Remove a chave do visitante para evitar migrações indevidas
            await AsyncStorage.removeItem(anonKey);
            console.log("Migrated guest progress to logged user:", userId);
          }
        }
      }

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
          const rawModuleXp = cloudData.module_xp || {};
          const { _failed_question_ids, _spaced_repetition, _achievements, _streak_freezes, ...cleanedModuleXp } = rawModuleXp;

          const mappedCloud: ProgressState = {
            xp: cloudData.xp || 0,
            completedModules: cloudData.completed_modules || [],
            lives: cloudData.lives ?? 3,
            streak: cloudData.streak || 0,
            lastActivityDate: cloudData.last_activity_date || null,
            totalExercises: cloudData.total_exercises || 0,
            correctAnswers: cloudData.correct_answers || 0,
            moduleXP: cleanedModuleXp || {},
            failedQuestionIds: _failed_question_ids || [],
            spacedRepetition: _spaced_repetition || {},
            achievements: _achievements || [],
            streakFreezes: _streak_freezes || 0,
            hintUsedCount: rawModuleXp._hint_used_count || 0,
          };

          // Lógica de Merge: se o local (migrado ou offline) tem mais XP, o usuário deve ter jogado offline.
          if (localData && localData.xp > mappedCloud.xp) {
            // Salvar silenciosamente o local mais atualizado na nuvem
            this.saveProgress(localData, userId).catch(() => {});
            return localData;
          }

          // Se a nuvem for mais recente ou igual, usamos ela e sincronizamos o local
          await AsyncStorage.setItem(storageKey, JSON.stringify(mappedCloud));
          return mappedCloud;
        } else {
          // Se não existir registro no banco ainda, mas temos progresso local (migrado), sincronizamos imediatamente
          if (localData) {
            this.saveProgress(localData, userId).catch(() => {});
          }
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
        const moduleXPWithMetadata = {
          ...data.moduleXP,
          _failed_question_ids: data.failedQuestionIds,
          _spaced_repetition: data.spacedRepetition || {},
          _achievements: data.achievements,
          _streak_freezes: data.streakFreezes,
          _hint_used_count: data.hintUsedCount ?? 0,
        };

        const payload = {
          user_id: userId,
          xp: data.xp,
          completed_modules: data.completedModules,
          correct_answers: data.correctAnswers,
          total_exercises: data.totalExercises,
          streak: data.streak,
          lives: data.lives,
          last_activity_date: data.lastActivityDate,
          module_xp: moduleXPWithMetadata,
          sync_pending: false,
        };

        // Verificamos de forma explícita se já existe um registro na nuvem para este usuário
        const { data: existing, error: selectError } = await supabase
          .from("user_progress")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (selectError) {
          console.warn("Supabase check progress error:", selectError.message);
        }

        if (existing) {
          // Se o registro já existir, fazemos uma atualização explícita (UPDATE)
          const { error: updateError } = await supabase
            .from("user_progress")
            .update(payload)
            .eq("user_id", userId);

          if (updateError) {
            console.warn("Supabase update progress error:", updateError.message);
          }
        } else {
          // Se o registro não existir, fazemos uma inserção explícita (INSERT)
          const { error: insertError } = await supabase
            .from("user_progress")
            .insert(payload);

          if (insertError) {
            console.warn("Supabase insert progress error:", insertError.message);
          }
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
            module_xp: {
              _failed_question_ids: [],
              _spaced_repetition: {},
              _achievements: [],
              _streak_freezes: 0,
            },
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
