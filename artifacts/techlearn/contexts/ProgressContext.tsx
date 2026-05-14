import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { progressService } from "@/services/progressService";

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
    // First ever activity
    return 1;
  }
  if (prev.lastActivityDate === today) {
    // Already recorded today — no change
    return prev.streak;
  }
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
  if (prev.lastActivityDate === yesterday) {
    // Consecutive day
    return prev.streak + 1;
  }
  // Gap > 1 day — reset
  return 1;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    progressService.getProgress().then((saved) => {
      if (saved) setProgress({ ...DEFAULT, ...saved });
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    progressService.saveProgress(next);
  }, []);

  const completeModule = useCallback((moduleId: number, xpEarned: number) => {
    setProgress((prev) => {
      const already = prev.completedModules.includes(moduleId);
      const today = new Date().toISOString().split("T")[0];
      const newStreak = computeStreak(prev, today);

      const next: ProgressState = {
        ...prev,
        // XP only added once per module — if already completed, no bonus
        xp: already ? prev.xp : prev.xp + xpEarned,
        completedModules: already ? prev.completedModules : [...prev.completedModules, moduleId],
        streak: newStreak,
        lastActivityDate: today,
        // moduleXP only recorded once
        moduleXP: already
          ? prev.moduleXP
          : { ...prev.moduleXP, [moduleId]: xpEarned },
      };
      progressService.saveProgress(next);
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
      progressService.saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await progressService.clearProgress();
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
