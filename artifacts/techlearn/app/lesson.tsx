import React, { useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import { AlertCircle, RotateCcw, ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { LESSONS, MODULE_DEFINITIONS } from "@/constants/lessons";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
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
const MAX_LIVES = 3;

export default function LessonScreen() {
  const colors = useColors();
  const { session, loading } = useAuth();
  const { moduleId: moduleIdParam } = useLocalSearchParams<{ moduleId?: string }>();
  const { completeModule, recordAnswer } = useProgress();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  const moduleId  = parseInt(moduleIdParam ?? "1", 10);
  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId) ?? MODULE_DEFINITIONS[0];
  const moduleSlice = LESSONS.slice(moduleDef.startIdx, moduleDef.startIdx + moduleDef.length);

  const [localIdx,    setLocalIdx]    = useState(0);
  const [lives,       setLives]       = useState(MAX_LIVES);
  const [showFeedback,setShowFeedback]= useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [xp,          setXp]          = useState(0);
  const [gameOver,    setGameOver]    = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateNext = useCallback((cb: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -360,
      duration: 180,
      useNativeDriver: NATIVE,
    }).start(() => {
      cb();
      slideAnim.setValue(360);
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: NATIVE }).start();
    });
  }, [slideAnim]);

  const exercise   = moduleSlice[localIdx];
  const isBriefing = exercise?.type === "briefing";
  const phaseInfo  = !isBriefing && exercise && "phaseInfo" in exercise ? exercise.phaseInfo : undefined;

  const advance = useCallback(() => {
    if (localIdx + 1 >= moduleSlice.length) {
      completeModule(moduleId, xp);
      router.replace({ pathname: "/complete", params: { xp, moduleId } });
    } else {
      animateNext(() => setLocalIdx((i) => i + 1));
    }
  }, [localIdx, moduleSlice.length, xp, moduleId, animateNext, completeModule]);

  const handleAnswer = useCallback((correct: boolean) => {
    setLastCorrect(correct);
    recordAnswer(correct);

    if (correct) {
      setXp((x) => x + 10);
      setShowFeedback(true);
    } else {
      const remaining = lives - 1;
      setLives(remaining);
      if (remaining <= 0) {
        // Lives exhausted — show game over, skip feedback modal
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setGameOver(true);
      } else {
        setShowFeedback(true);
      }
    }
  }, [recordAnswer, lives]);

  const handleContinue = useCallback(() => {
    setShowFeedback(false);
    advance();
  }, [advance]);

  const handleRestart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalIdx(0);
    setLives(MAX_LIVES);
    setXp(0);
    setGameOver(false);
    setShowFeedback(false);
    setLastCorrect(false);
    slideAnim.setValue(0);
  }, [slideAnim]);

  if (!exercise) return null;

  const explanation =
    exercise.type === "multiple_choice" ? exercise.explanation
    : exercise.type === "phishing_email"  ? exercise.explanation
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

      {!isBriefing && !gameOver && (
        <FeedbackModal
          visible={showFeedback}
          correct={lastCorrect}
          explanation={explanation}
          onContinue={handleContinue}
        />
      )}

      {/* Game Over overlay — rendered when lives reach 0 */}
      {gameOver && (
        <View style={[styles.gameOverOverlay, { backgroundColor: colors.background }]}>
          <View style={[styles.gameOverCard, { backgroundColor: colors.card, borderColor: colors.error + "50" }]}>
            <View style={[styles.gameOverIconBg, { backgroundColor: colors.error + "18" }]}>
              <AlertCircle size={40} color={colors.error} strokeWidth={1.5} />
            </View>
            <Text style={[styles.gameOverTitle, { color: colors.foreground }]}>Suas vidas acabaram!</Text>
            <Text style={[styles.gameOverSub, { color: colors.mutedForeground }]}>
              Não desanime — reveja o conteúdo e tente novamente. Você consegue!
            </Text>

            <TouchableOpacity
              style={[styles.restartBtn, { backgroundColor: colors.primary }]}
              onPress={handleRestart}
              activeOpacity={0.85}
            >
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.restartBtnText}>Tentar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.backBtn, { borderColor: colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <ChevronLeft size={14} color={colors.mutedForeground} strokeWidth={2} />
              <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 99,
  },
  gameOverCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  gameOverIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  gameOverTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  gameOverSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  restartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
  },
  restartBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    width: "100%",
  },
  backBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
