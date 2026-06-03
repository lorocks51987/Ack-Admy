import React, { createContext, useContext, useState, ReactNode } from "react";

export type ExplanationMode = "error" | "success" | "info";

export interface ExplanationData {
  title?: string;
  question?: string;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  learnMore?: string;
  examples?: string[];
  mode: ExplanationMode;
}

interface ExplanationContextProps {
  explanationData: ExplanationData | null;
  setExplanationData: (data: ExplanationData | null) => void;
}

const ExplanationContext = createContext<ExplanationContextProps>({
  explanationData: null,
  setExplanationData: () => {},
});

export const ExplanationProvider = ({ children }: { children: ReactNode }) => {
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  return (
    <ExplanationContext.Provider value={{ explanationData, setExplanationData }}>
      {children}
    </ExplanationContext.Provider>
  );
};

export const useExplanation = () => useContext(ExplanationContext);
