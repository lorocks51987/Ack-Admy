import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";
import { progressService } from "@/services/progressService";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressState {
  xp: number;
  completedModules: number[];
  lives: number;
  streak: number;
  lastActivityDate: string | null;
  totalExercises: number;
  correctAnswers: number;
  moduleXP: Record<number, number>;
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
};

interface ProgressContextValue {
  progress: ProgressState;
  loaded: boolean;
  completeModule: (moduleId: number, xpEarned: number) => void;
  recordAnswer: (correct: boolean) => void;
  resetProgress: () => Promise<void>;
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
      progressService.saveProgress(next, userRef.current);
      return next;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await progressService.clearProgress(userRef.current);
    setProgress(DEFAULT);
  }, []);

  return (
    <ProgressContext.Provider value={{ progress, loaded, completeModule, recordAnswer, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
