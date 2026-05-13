import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ackadmy:progress_v2";

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
  streak: 1,
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

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setProgress({ ...DEFAULT, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setProgress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const completeModule = useCallback((moduleId: number, xpEarned: number) => {
    setProgress((prev) => {
      const already = prev.completedModules.includes(moduleId);
      const completedModules = already ? prev.completedModules : [...prev.completedModules, moduleId];
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = prev.lastActivityDate !== today;
      const next: ProgressState = {
        ...prev,
        xp: prev.xp + xpEarned,
        completedModules,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        lastActivityDate: today,
        moduleXP: { ...prev.moduleXP, [moduleId]: (prev.moduleXP[moduleId] ?? 0) + xpEarned },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
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
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetProgress = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
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
