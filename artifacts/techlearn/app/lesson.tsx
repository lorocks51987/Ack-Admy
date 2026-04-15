import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { LESSONS } from "@/constants/lessons";
import { ExerciseHeader } from "@/components/ExerciseHeader";
import { FeedbackModal } from "@/components/FeedbackModal";
import { MultipleChoiceScreen } from "@/screens/MultipleChoiceScreen";
import { AssociationScreen } from "@/screens/AssociationScreen";
import { TextInputScreen } from "@/screens/TextInputScreen";
import { OrderingScreen } from "@/screens/OrderingScreen";
import { FillBlankScreen } from "@/screens/FillBlankScreen";
import { BriefingScreen } from "@/screens/BriefingScreen";
import { PhishingSimulatorScreen } from "@/screens/PhishingSimulatorScreen";

export default function LessonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [xp, setXp] = useState(0);

  const exercise = LESSONS[currentIdx];
  const isBriefing = exercise.type === "briefing";
  const phaseInfo = !isBriefing && "phaseInfo" in exercise ? exercise.phaseInfo : undefined;

  const advance = () => {
    if (currentIdx + 1 >= LESSONS.length) {
      router.replace({ pathname: "/complete", params: { xp: xp + (lastCorrect ? 10 : 0) } });
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleBriefingStart = () => advance();

  const handleAnswer = (correct: boolean) => {
    setLastCorrect(correct);
    if (!correct) setLives((l) => Math.max(0, l - 1));
    else setXp((x) => x + 10);
    setShowFeedback(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    advance();
  };

  const handleClose = () => router.back();

  const explanation =
    exercise.type === "multiple_choice" ? exercise.explanation
    : exercise.type === "phishing_email" ? exercise.explanation
    : undefined;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ExerciseHeader
        current={currentIdx}
        total={LESSONS.length}
        lives={lives}
        onClose={handleClose}
        phaseInfo={phaseInfo}
        isBriefing={isBriefing}
      />

      <View style={[styles.body, { paddingBottom: bottomPad }]}>
        {isBriefing && exercise.type === "briefing" && (
          <BriefingScreen exercise={exercise} onStart={handleBriefingStart} />
        )}
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "association" && (
          <AssociationScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "text_input" && (
          <TextInputScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "ordering" && (
          <OrderingScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "fill_blank" && (
          <FillBlankScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "phishing_email" && (
          <PhishingSimulatorScreen exercise={exercise} onAnswer={handleAnswer} />
        )}
      </View>

      {!isBriefing && (
        <FeedbackModal
          visible={showFeedback}
          correct={lastCorrect}
          explanation={explanation}
          onContinue={handleContinue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
