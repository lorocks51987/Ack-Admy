import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { progressService } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";
import { notificationService } from "@/services/notificationService";

export interface ProgressState {
  xp: number;
  completedModules: number[];
  lives: number;
  streak: number;
  lastActivityDate: string | null;
  totalExercises: number;
  correctAnswers: number;
  moduleXP: Record<number, number>;
  failedQuestionIds: (string | number)[];
  spacedRepetition?: Record<string | number, { level: number, nextReviewDate: string }>;
  achievements: string[];
  streakFreezes: number;
  hintUsedCount: number;
}

const DEFAULT: ProgressState = {
  xp: 0,
  completedModules: [],
  lives: 3,
  streak: 0,
  lastActivityDate: null,
  totalExercises: 0,
  correctAnswers: 0,
  moduleXP: {},
  failedQuestionIds: [],
  achievements: [],
  streakFreezes: 0,
  hintUsedCount: 0,
};

interface ProgressContextValue {
  progress: ProgressState;
  loaded: boolean;
  completeModule: (moduleId: number, xpEarned: number) => void;
  recordAnswer: (correct: boolean) => void;
  resetProgress: () => Promise<void>;
  addFailedQuestion: (questionId: string | number) => void;
  recordReviewAnswer: (questionId: string | number, correct: boolean) => void;
  buyStreakFreeze: () => Promise<boolean>;
  spendXP: (amount: number) => boolean;
  incrementHintUsed: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function computeStreak(prev: ProgressState, today: string): number {
  if (prev.lastActivityDate === null) {
    return 1;
  }
  if (prev.lastActivityDate === today) {
    return prev.streak;
  }
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  if (prev.lastActivityDate === yesterday) {
    return prev.streak + 1;
  }
  return 1;
}

function checkAchievements(state: ProgressState): string[] {
  const current = new Set(state.achievements);
  
  if (state.completedModules.length >= 1) {
    current.add("first_steps");
  }
  
  if (state.completedModules.includes(3) || state.correctAnswers >= 20) {
    current.add("master_match");
  }
  
  if (state.xp >= 100) {
    current.add("invincible");
  }
  
  if (state.streak >= 3) {
    current.add("constant_fire");
  }

  // Novos achievements da sprint de gamificação
  if ((state.failedQuestionIds?.length ?? 0) >= 5) {
    current.add("no_fear_of_error");
  }

  if ((state.hintUsedCount ?? 0) >= 3) {
    current.add("helper_used");
  }

  // Conquista suprema ao concluir 100% dos módulos do curso
  if (state.completedModules.length >= MODULE_DEFINITIONS.length && MODULE_DEFINITIONS.length > 0) {
    current.add("legendary_guardian");
  }
  
  return Array.from(current);
}

// Map old numeric indices to new stable string IDs for smooth migration
const LEGACY_ID_MAP: Record<number, string> = {
  0: "fsi-01-triade-cid-brief",
  1: "fsi-01-triade-cid-assoc-01",
  2: "fsi-01-triade-cid-mc-01",
  3: "fsi-01-triade-cid-fill-01",
  4: "fsi-01-triade-cid-mc-02",
  5: "fsi-01-triade-cid-text-01",
  6: "fsi-04-iam-brief",
  7: "fsi-04-iam-order-01",
  8: "fsi-04-iam-assoc-01",
  9: "fsi-05-mfa-mc-01",
  10: "fsi-04-iam-mc-01",
  11: "fsi-08-malware-brief",
  12: "fsi-07-ameacas-mc-01",
  13: "fsi-08-malware-order-01",
  14: "fsi-08-malware-assoc-01",
  15: "fsi-08-malware-text-01",
  16: "fsi-06-privacidade-brief",
  17: "fsi-06-privacidade-mc-01",
  18: "fsi-06-privacidade-assoc-01",
  19: "fsi-06-privacidade-fill-01",
  20: "fsi-06-privacidade-mc-02",
  21: "fsi-12-social-brief",
  22: "fsi-13-phishing-mc-01",
  23: "fsi-13-phishing-sim-01",
  24: "fsi-12-social-order-01",
  25: "fsi-13-phishing-assoc-01",
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  
  // Usamos uma referência para o userId atual para não precisarmos recriar
  // as funções useCallback (completeModule, recordAnswer, etc) a cada mudança de sessão.
  const userRef = useRef(user?.id);
  // Referência espelho do progresso para acesso síncrono dentro de callbacks
  const progressRef = useRef<ProgressState>(DEFAULT);

  useEffect(() => {
    userRef.current = user?.id;
  }, [user?.id]);

  // Mantém progressRef sincronizado com o estado atual
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Aguardamos a inicialização do AuthContext para ter certeza do estado do usuário
    if (authLoading) return;

    let isMounted = true;
    
    // Passamos o user.id para buscar do Supabase se houver login
    progressService.getProgress(user?.id).then((saved) => {
      if (!isMounted) return;
      if (saved) {
        // Migrate old numeric IDs to stable string IDs if present
        let migratedFailedIds = saved.failedQuestionIds || [];
        let migratedSpaced = saved.spacedRepetition || {};
        
        migratedFailedIds = migratedFailedIds.map(id => typeof id === 'number' && LEGACY_ID_MAP[id] ? LEGACY_ID_MAP[id] : id);
        
        const newSpaced: Record<string, { level: number, nextReviewDate: string }> = {};
        for (const [key, val] of Object.entries(migratedSpaced)) {
          const numericKey = parseInt(key, 10);
          if (!isNaN(numericKey) && LEGACY_ID_MAP[numericKey]) {
            newSpaced[LEGACY_ID_MAP[numericKey]] = val as any;
          } else {
            newSpaced[key] = val as any;
          }
        }

        setProgress({ 
          ...DEFAULT, 
          ...saved, 
          failedQuestionIds: migratedFailedIds,
          spacedRepetition: newSpaced 
        });
      } else {
        setProgress(DEFAULT);
      }
      setLoaded(true);
      // Agenda a notificação para 24h após abrir o app
      notificationService.scheduleDailyStreakReminder();
    });

    return () => {
      isMounted = false;
    };
  }, [authLoading, user?.id]);

  const completeModule = useCallback((moduleId: number, xpEarned: number) => {
    setProgress((prev) => {
      const already = prev.completedModules.includes(moduleId);
      const today = new Date().toISOString().split("T")[0];
      const newStreak = computeStreak(prev, today);

      const next: ProgressState = {
        ...prev,
        xp: already ? prev.xp : prev.xp + xpEarned,
        completedModules: already ? prev.completedModules : [...prev.completedModules, moduleId],
        streak: newStreak,
        lastActivityDate: today,
        moduleXP: already
          ? prev.moduleXP
          : { ...prev.moduleXP, [moduleId]: xpEarned },
      };
      next.achievements = checkAchievements(next);
      // Salva usando o ID guardado na referência
      progressService.saveProgress(next, userRef.current);
      // Re-agenda a notificação para garantir 24h a partir de agora
      notificationService.scheduleDailyStreakReminder();
      return next;
    });
  }, []);

  const recordAnswer = useCallback((correct: boolean) => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        totalExercises: prev.totalExercises + 1,
        correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const addFailedQuestion = useCallback((questionId: string | number) => {
    setProgress((prev) => {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const sr = prev.spacedRepetition || {};
      
      const newSpacedRepetition = {
        ...sr,
        [questionId]: { level: 0, nextReviewDate: tomorrow }
      };

      const newFailedQuestionIds = prev.failedQuestionIds.includes(questionId) 
        ? prev.failedQuestionIds 
        : [...prev.failedQuestionIds, questionId];

      const next: ProgressState = {
        ...prev,
        failedQuestionIds: newFailedQuestionIds,
        spacedRepetition: newSpacedRepetition,
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const recordReviewAnswer = useCallback((questionId: string | number, correct: boolean) => {
    setProgress((prev) => {
      const sr = prev.spacedRepetition || {};
      const currentEntry = sr[questionId] || { level: 0, nextReviewDate: "" };

      let nextLevel = currentEntry.level;
      let nextDate = "";
      let isMastered = false;

      if (correct) {
        nextLevel += 1;
        if (nextLevel >= 3) {
          isMastered = true; // Acertou 3 vezes espaçadas = dominou
        } else {
          // Nível 1: revisa em 3 dias. Nível 2: revisa em 7 dias.
          const daysToAdd = nextLevel === 1 ? 3 : 7;
          nextDate = new Date(Date.now() + daysToAdd * 86400000).toISOString().split("T")[0];
        }
      } else {
        // Errou = volta pro nível 0, revisa amanhã.
        nextLevel = 0;
        nextDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      }

      const newSpacedRepetition = { ...sr };
      let newFailedQuestionIds = [...prev.failedQuestionIds];

      if (isMastered) {
        delete newSpacedRepetition[questionId];
        newFailedQuestionIds = newFailedQuestionIds.filter((id) => id !== questionId);
      } else {
        newSpacedRepetition[questionId] = { level: nextLevel, nextReviewDate: nextDate };
      }

      const next: ProgressState = {
        ...prev,
        failedQuestionIds: newFailedQuestionIds,
        spacedRepetition: newSpacedRepetition,
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const buyStreakFreeze = useCallback(async (): Promise<boolean> => {
    let success = false;
    setProgress((prev) => {
      if (prev.xp < 100) return prev;
      success = true;
      const next: ProgressState = {
        ...prev,
        xp: prev.xp - 100,
        streakFreezes: prev.streakFreezes + 1,
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
    return success;
  }, []);

  /**
   * Gasta XP como moeda. Retorna true se o gasto foi realizado com sucesso.
   * Retorna false se o XP for insuficiente (sem debitar).
   * O XP total diminui e afeta o ranking.
   * Usa progressRef para acesso síncrono ao XP atual, evitando race conditions.
   */
  const spendXP = useCallback((amount: number): boolean => {
    // Lê o XP atual de forma síncrona via ref
    const currentXP = progressRef.current.xp;
    if (currentXP < amount) return false; // XP insuficiente

    setProgress((prev) => {
      // Dupla verificação dentro do updater (por segurança)
      if (prev.xp < amount) return prev;
      const next: ProgressState = {
        ...prev,
        xp: prev.xp - amount,
      };
      next.achievements = checkAchievements(next);
      // progressRef será atualizado pelo useEffect acima
      progressService.saveProgress(next, userRef.current);
      return next;
    });
    return true;
  }, []);

  /**
   * Incrementa o contador de dicas usadas.
   * Usado pelo ExerciseHeader ao "Ver dica" ser acionado.
   */
  const incrementHintUsed = useCallback(() => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        hintUsedCount: (prev.hintUsedCount ?? 0) + 1,
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await progressService.clearProgress(userRef.current);
    setProgress(DEFAULT);
  }, []);

  return (
    <ProgressContext.Provider value={{
      progress,
      loaded,
      completeModule,
      recordAnswer,
      resetProgress,
      addFailedQuestion,
      recordReviewAnswer,
      buyStreakFreeze,
      spendXP,
      incrementHintUsed,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
