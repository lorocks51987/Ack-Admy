import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { progressService } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";
import { MODULE_DEFINITIONS } from "@/constants/lessons";

export interface ProgressState {
  xp: number;
  completedModules: number[];
  lives: number;
  streak: number;
  lastActivityDate: string | null;
  totalExercises: number;
  correctAnswers: number;
  moduleXP: Record<number, number>;
  failedQuestionIds: number[];
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
  addFailedQuestion: (questionId: number) => void;
  clearFailedQuestion: (questionId: number) => void;
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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  
  // Usamos uma referência para o userId atual para não precisarmos recriar
  // as funções useCallback (completeModule, recordAnswer, etc) a cada mudança de sessão.
  const userRef = useRef(user?.id);

  useEffect(() => {
    userRef.current = user?.id;
  }, [user?.id]);

  useEffect(() => {
    // Aguardamos a inicialização do AuthContext para ter certeza do estado do usuário
    if (authLoading) return;

    let isMounted = true;
    
    // Passamos o user.id para buscar do Supabase se houver login
    progressService.getProgress(user?.id).then((saved) => {
      if (!isMounted) return;
      if (saved) {
        setProgress({ ...DEFAULT, ...saved });
      } else {
        setProgress(DEFAULT);
      }
      setLoaded(true);
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

  const addFailedQuestion = useCallback((questionId: number) => {
    setProgress((prev) => {
      if (prev.failedQuestionIds.includes(questionId)) return prev;
      const next: ProgressState = {
        ...prev,
        failedQuestionIds: [...prev.failedQuestionIds, questionId],
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const clearFailedQuestion = useCallback((questionId: number) => {
    setProgress((prev) => {
      const next: ProgressState = {
        ...prev,
        failedQuestionIds: prev.failedQuestionIds.filter((id) => id !== questionId),
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
   */
  const spendXP = useCallback((amount: number): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.xp < amount) return prev; // XP insuficiente
      success = true;
      const next: ProgressState = {
        ...prev,
        xp: prev.xp - amount,
      };
      next.achievements = checkAchievements(next);
      progressService.saveProgress(next, userRef.current);
      return next;
    });
    return success;
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
      clearFailedQuestion,
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
