import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { LESSONS, MODULE_DEFINITIONS } from "@/constants/lessons";
import { useProgress } from "@/contexts/ProgressContext";
import { ExerciseHeader } from "@/components/ExerciseHeader";
import { FeedbackModal } from "@/components/FeedbackModal";
import { MultipleChoiceScreen } from "@/screens/MultipleChoiceScreen";
import { AssociationScreen } from "@/screens/AssociationScreen";
import { TextInputScreen } from "@/screens/TextInputScreen";
import { OrderingScreen } from "@/screens/OrderingScreen";
import { FillBlankScreen } from "@/screens/FillBlankScreen";
import { BriefingScreen } from "@/screens/BriefingScreen";
import { PhishingSimulatorScreen } from "@/screens/PhishingSimulatorScreen";

const NATIVE = Platform.OS !== "web";

export default function LessonScreen() {
  const colors = useColors();
  const { moduleId: moduleIdParam } = useLocalSearchParams<{ moduleId?: string }>();
  const { completeModule, recordAnswer } = useProgress();

  // Resolve module
  const moduleId = parseInt(moduleIdParam ?? "1", 10);
  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId) ?? MODULE_DEFINITIONS[0];
  const moduleSlice = LESSONS.slice(moduleDef.startIdx, moduleDef.startIdx + moduleDef.length);

  const [localIdx, setLocalIdx]         = useState(0);
  const [lives, setLives]               = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect]   = useState(false);
  const [xp, setXp]                     = useState(0);

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateNext = useCallback((cb: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -360,
      duration: 180,
      useNativeDriver: NATIVE,
    }).start(() => {
      cb();
      slideAnim.setValue(360);
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: NATIVE,
      }).start();
    });
  }, [slideAnim]);

  const exercise   = moduleSlice[localIdx];
  const isBriefing = exercise?.type === "briefing";
  const phaseInfo  = !isBriefing && exercise && "phaseInfo" in exercise ? exercise.phaseInfo : undefined;

  const advance = useCallback(() => {
    if (localIdx + 1 >= moduleSlice.length) {
      completeModule(moduleId, xp + (lastCorrect ? 10 : 0));
      router.replace({ pathname: "/complete", params: { xp: xp + (lastCorrect ? 10 : 0), moduleId } });
    } else {
      animateNext(() => setLocalIdx((i) => i + 1));
    }
  }, [localIdx, moduleSlice.length, xp, lastCorrect, moduleId, animateNext, completeModule]);

  const handleAnswer = useCallback((correct: boolean) => {
    setLastCorrect(correct);
    recordAnswer(correct);
    if (!correct) setLives((l) => Math.max(0, l - 1));
    else setXp((x) => x + 10);
    setShowFeedback(true);
  }, [recordAnswer]);

  const handleContinue = useCallback(() => {
    setShowFeedback(false);
    advance();
  }, [advance]);

  if (!exercise) return null;

  const explanation =
    exercise.type === "multiple_choice" ? exercise.explanation
    : exercise.type === "phishing_email" ? exercise.explanation
    : undefined;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ExerciseHeader
        current={localIdx}
        total={moduleSlice.length}
        lives={lives}
        onClose={() => router.back()}
        phaseInfo={phaseInfo}
        isBriefing={isBriefing}
        moduleName={moduleDef.title}
      />

      <Animated.View style={[styles.body, { transform: [{ translateX: slideAnim }] }]}>
        {exercise.type === "briefing" && (
          <BriefingScreen exercise={exercise} onStart={advance} />
        )}
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "association" && (
          <AssociationScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "text_input" && (
          <TextInputScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "ordering" && (
          <OrderingScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "fill_blank" && (
          <FillBlankScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
        {exercise.type === "phishing_email" && (
          <PhishingSimulatorScreen key={localIdx} exercise={exercise} onAnswer={handleAnswer} />
        )}
      </Animated.View>

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
