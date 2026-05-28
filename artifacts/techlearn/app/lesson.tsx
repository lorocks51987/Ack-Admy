import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Platform,
  ActivityIndicator, Modal, TextInput, Pressable,
} from "react-native";
import { router, useLocalSearchParams, Redirect } from "expo-router";
import {
  AlertCircle, RotateCcw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, BookOpen, Heart, Zap, ArrowLeft, AlertTriangle
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useColors } from "@/hooks/useColors";
import { LESSONS, MODULE_DEFINITIONS } from "@/constants/lessons";
import { useProgress } from "@/contexts/ProgressContext";
import { useAuth } from "@/contexts/AuthContext";
import { ExerciseHeader } from "@/components/ExerciseHeader";
import { MultipleChoiceScreen } from "@/screens/MultipleChoiceScreen";
import { AssociationScreen } from "@/screens/AssociationScreen";
import { TextInputScreen } from "@/screens/TextInputScreen";
import { OrderingScreen } from "@/screens/OrderingScreen";
import { FillBlankScreen } from "@/screens/FillBlankScreen";
import { BriefingScreen } from "@/screens/BriefingScreen";
import { PhishingSimulatorScreen } from "@/screens/PhishingSimulatorScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ExerciseType } from "@/constants/lessons";
import { supabase } from "@/services/supabaseClient";
import { audioService } from "@/services/audioService";

const NATIVE = Platform.OS !== "web";
const MAX_LIVES = 3;

type FeedbackState = {
  visible: boolean;
  correct: boolean;
  message: string;
  learnMore?: string;
  showLearnMore: boolean;
  incentive?: string;
};

const CORRECT_INCENTIVES = [
  "Excelente! Você está dominando isso! 🔥",
  "Incrível! Mais 10 XP conquistados! 🎯",
  "Mente afiada de cibercodefensor! 🛡️",
  "Perfeito! Sua segurança está impecável! ⚡",
  "Fantástico! Continue com essa energia! 🚀",
  "Sensacional! Você aprende muito rápido! 🧠",
  "Uau, você arrasou nessa! ✨",
  "Mais um passo rumo ao topo! 🏆",
];

const WRONG_INCENTIVES = [
  "Sem problemas! Errar ensina a acertar! 💡",
  "Não desanime, a próxima é sua! 💪",
  "A prática de segurança leva à perfeição! 🛡️",
  "Tudo bem! Foco na explicação para gabaritar! 🧠",
  "Quase lá! Cada tentativa te deixa mais forte! 🌟",
  "Respire fundo, analise e vamos tentar! 🧘",
];

type SessionState = {
  localIdx?: number;
  queue?: number[];
  lives: number;
  xp: number;
};

function getSessionKey(userIdOrGuest: string, moduleId: number | string) {
  return `@ackadmy:lesson_session:${userIdOrGuest}:${moduleId}`;
}

export function LessonScreenInternal() {
  const colors = useColors();
  const { session, loading, isGuest, user, profile } = useAuth();
  const { moduleId: moduleIdParam, isRevision } = useLocalSearchParams<{ moduleId?: string; isRevision?: string }>();
  const { completeModule, recordAnswer, addFailedQuestion, clearFailedQuestion, progress, spendXP, incrementHintUsed } = useProgress();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session && !isGuest) {
    return <Redirect href="/sign-in" />;
  }

  const isMistakesReview = moduleIdParam === "mistakes";
  const moduleId = isMistakesReview ? -1 : parseInt(moduleIdParam ?? "1", 10);

  const moduleDef = isMistakesReview
    ? ({ id: -1, title: "Caixa de Erros", subtitle: "Revisão de conceitos errados", iconName: "AlertTriangle", startIdx: 0, length: 0, accentColor: "#EF4444", category: "awareness", difficulty: "Iniciante" } as any)
    : (MODULE_DEFINITIONS.find((m) => m.id === moduleId) ?? MODULE_DEFINITIONS[0]);

  // Se for o Exame Final (Módulo 6) ou Caixa de Erros, reestruturamos o moduleSlice de forma inteligente
  const moduleSlice = React.useMemo(() => {
    if (isMistakesReview) {
      // Prioriza os erros mais recentes (últimos adicionados no array) e limita a no máximo 8 por sessão (SRS)
      const reversedIds = [...(progress?.failedQuestionIds ?? [])].reverse();
      return reversedIds.slice(0, 8).map((idx) => LESSONS[idx]).filter(Boolean);
    }
    
    if (moduleId === 6) {
      // Exame Final do ACK-ADMY: misturamos 7 questões práticas chaves sem teoria (briefings)
      // de todos os módulos pedagógicos anteriores (1 a 5).
      // Selecionamos 7 índices de questões práticas balanceadas de toda a matéria:
      // Módulo 1 -> índices 1, 2 | Módulo 2 -> índice 12 | Módulo 3 -> índice 7, 8 | Módulo 5 -> índice 17 | Módulo 4 -> índice 22
      const selectedIndices = [1, 2, 7, 8, 12, 17, 22];
      const examLessons = selectedIndices.map(idx => LESSONS[idx]).filter(Boolean);
      
      // Embaralha determinando uma ordem aleatória a cada tentativa de exame!
      return [...examLessons].sort(() => 0.5 - Math.random());
    }
    
    return LESSONS.slice(moduleDef?.startIdx ?? 0, (moduleDef?.startIdx ?? 0) + (moduleDef?.length ?? 0));
  }, [isMistakesReview, moduleId, progress?.failedQuestionIds, moduleDef]);

  const userKey = isGuest ? "guest" : (user?.id ?? "anon");
  const sessionKey = getSessionKey(userKey, isMistakesReview ? "mistakes" : String(moduleId));

  const insets = useSafeAreaInsets();

  const [queue, setQueue] = useState<number[]>(Array.from({ length: moduleSlice?.length ?? 0 }, (_, i) => i));
  const [lives, setLives] = useState(moduleId === 6 ? 2 : MAX_LIVES);
  const [xp, setXp] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [savedSession, setSavedSession] = useState<SessionState | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [powerUpUsed, setPowerUpUsed] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);
  // Estado para bloquear avanço em text_input ao errar (deve tentar novamente até acertar)
  const [retryTextInput, setRetryTextInput] = useState(false);
  // Ref dos achievements anteriores para detectar novos desbloqueios
  const prevAchievementsRef = useRef<string[]>([]);

  // Contestação Modal States
  const [confrontModalVisible, setConfrontModalVisible] = useState(false);
  const [confrontReason, setConfrontReason] = useState("");
  const [isSendingConfront, setIsSendingConfront] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    correct: false,
    message: "",
    showLearnMore: false,
  });

  const slideAnim = useRef(new Animated.Value(0)).current;

  // ── Session persistence ──────────────────────────────────────────────────────
  const saveSession = useCallback(async (currentQueue: number[], livesLeft: number, currentXp: number) => {
    try {
      const data: SessionState = { queue: currentQueue, lives: livesLeft, xp: currentXp };
      await AsyncStorage.setItem(sessionKey, JSON.stringify(data));
    } catch { /* silent */ }
  }, [sessionKey]);

  const clearSession = useCallback(async () => {
    try { await AsyncStorage.removeItem(sessionKey); } catch { /* silent */ }
  }, [sessionKey]);

  // Load saved session on mount
  useEffect(() => {
    let mounted = true;
    if (isRevision === "true") {
      setSessionLoading(false);
      return;
    }
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(sessionKey);
        if (raw && mounted) {
          const parsed: SessionState = JSON.parse(raw);
          if (parsed.queue && parsed.queue.length > 0 && parsed.queue.length < moduleSlice.length) {
            setSavedSession(parsed);
            setShowResume(true);
            setSessionLoading(false);
            return;
          } else if (parsed.localIdx !== undefined && parsed.localIdx > 0 && parsed.localIdx < moduleSlice.length) {
            setSavedSession(parsed);
            setShowResume(true);
            setSessionLoading(false);
            return;
          }
        }
      } catch { /* silent */ }
      if (mounted) setSessionLoading(false);
    })();
    return () => { mounted = false; };
  }, [sessionKey, isRevision]);

  // ── Animation ────────────────────────────────────────────────────────────────
  const animateNext = useCallback((cb: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -360, duration: 180, useNativeDriver: NATIVE,
    }).start(() => {
      cb();
      slideAnim.setValue(360);
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: NATIVE }).start();
    });
  }, [slideAnim]);

  // ── Derived state ──────────────────────────────────────────────────────────────
  const currentIdx = queue[0] ?? 0;
  const exercise = moduleSlice[currentIdx];
  const isBriefing = exercise?.type === "briefing";
  const phaseInfo = !isBriefing && exercise && "phaseInfo" in exercise ? exercise.phaseInfo : undefined;
  const exerciseHint = exercise && !isBriefing && "hint" in exercise ? (exercise as any).hint as string | undefined : undefined;
  const exerciseType = exercise?.type as ExerciseType | undefined;
  // Show hint icon when there's a non-briefing exercise and no feedback visible and not game over
  const showHintIcon = !isBriefing && !feedback.visible && !gameOver;

  // ── Advance to next question ──────────────────────────────────────────────────
  const advance = useCallback((currentLives: number, currentXp: number) => {
    if (queue.length <= 1) {
      clearSession();
      if (isMistakesReview) {
        router.replace({ pathname: "/complete", params: { xp: currentXp, moduleId: -1 } });
      } else {
        completeModule(moduleId, currentXp);
        router.replace({ pathname: "/complete", params: { xp: currentXp, moduleId } });
      }
    } else {
      const nextQueue = queue.slice(1);
      saveSession(nextQueue, currentLives, currentXp);
      setPowerUpUsed(false);
      animateNext(() => setQueue(nextQueue));
    }
  }, [queue, moduleId, animateNext, completeModule, clearSession, saveSession, isMistakesReview]);

  // ── Handle answer ─────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((correct: boolean) => {
    recordAnswer(correct);
    const ex = moduleSlice[currentIdx];
    const hasFields = ex && "feedbackCorrect" in ex;
    const absIdx = LESSONS.indexOf(ex);
    const isTextInput = ex?.type === "text_input";

    // Captura achievements antes para detectar novos desbloqueios
    const prevAchievements = prevAchievementsRef.current;

    if (correct) {
      if (isMistakesReview && absIdx !== -1) {
        clearFailedQuestion(absIdx);
      }
      audioService.playCorrect();
      // Limpa o retry de text_input ao acertar
      setRetryTextInput(false);
      const newXp = xp + 10;
      setXp(newXp);
      const msg = hasFields && (ex as any).feedbackCorrect
        ? (ex as any).feedbackCorrect
        : "Boa! Continue assim.";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const randIdx = Math.floor(Math.random() * CORRECT_INCENTIVES.length);
      const randIncentive = CORRECT_INCENTIVES[randIdx];

      setFeedback({
        visible: true, correct: true, message: msg,
        learnMore: hasFields ? (ex as any).learnMore : undefined,
        showLearnMore: false,
        incentive: randIncentive,
      });
      // Verifica novos badges após atualização de estado (via setTimeout para aguardar setState)
      setTimeout(() => {
        const current = progress?.achievements ?? [];
        const hasNew = current.some((a: string) => !prevAchievementsRef.current.includes(a));
        if (hasNew) {
          audioService.playBadge();
          prevAchievementsRef.current = current;
        }
      }, 300);
    } else {
      if (!isMistakesReview && absIdx !== -1) {
        addFailedQuestion(absIdx);
      }
      audioService.playWrong();
      const msg = hasFields && (ex as any).feedbackWrong
        ? (ex as any).feedbackWrong
        : isTextInput
          ? "Resposta incorreta. Tente novamente — você precisa acertar para avançar."
          : "Quase! Releia o enunciado e tente novamente.";
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (isTextInput) {
        // text_input: não perde vida, mas não avança até acertar
        setRetryTextInput(true);
        const randIdx = Math.floor(Math.random() * WRONG_INCENTIVES.length);
        const randIncentive = WRONG_INCENTIVES[randIdx];

        setFeedback({
          visible: true, correct: false, message: msg,
          learnMore: hasFields ? (ex as any).learnMore : undefined,
          showLearnMore: false,
          incentive: randIncentive,
        });
      } else {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setGameOver(true);
          setFeedback({ visible: false, correct: false, message: "", showLearnMore: false });
        } else {
          const randIdx = Math.floor(Math.random() * WRONG_INCENTIVES.length);
          const randIncentive = WRONG_INCENTIVES[randIdx];

          setFeedback({
            visible: true, correct: false, message: msg,
            learnMore: hasFields ? (ex as any).learnMore : undefined,
            showLearnMore: false,
            incentive: randIncentive,
          });
          saveSession(queue, remaining, xp);
        }
      }
    }
  }, [moduleSlice, currentIdx, xp, lives, progress.achievements, recordAnswer, saveSession, queue, isMistakesReview, addFailedQuestion, clearFailedQuestion]);

  // ── Continue / Retry ──────────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (retryTextInput) {
      // text_input incorreto: apenas fecha o feedback, não avança
      setFeedback({ visible: false, correct: false, message: "", showLearnMore: false });
      setRetryKey((k) => k + 1); // reseta o TextInputScreen
      return;
    }
    setFeedback({ visible: false, correct: false, message: "", showLearnMore: false });
    advance(lives, xp);
  }, [lives, xp, advance, retryTextInput]);

  // ── Restart module ────────────────────────────────────────────────────────────
  const handleRestart = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearSession();
    setQueue(Array.from({ length: moduleSlice.length }, (_, i) => i));
    setLives(moduleId === 6 ? 2 : MAX_LIVES);
    setXp(0);
    setGameOver(false);
    setFeedback({ visible: false, correct: false, message: "", showLearnMore: false });
    setPowerUpUsed(false);
    setRetryKey(0);
    setSkippedCount(0);
    setRetryTextInput(false);
    slideAnim.setValue(0);
  }, [clearSession, slideAnim, moduleSlice.length]);

  // ── Resume session ────────────────────────────────────────────────────────────
  const handleResume = useCallback(() => {
    if (!savedSession) return;
    if (savedSession.queue) {
      setQueue(savedSession.queue);
    } else if (savedSession.localIdx !== undefined) {
      setQueue(Array.from({ length: moduleSlice.length }, (_, i) => i).slice(savedSession.localIdx));
    }
    setLives(savedSession.lives);
    setXp(savedSession.xp);
    setShowResume(false);
  }, [savedSession, moduleSlice.length]);

  const handleRestartFromResume = useCallback(async () => {
    await clearSession();
    setShowResume(false);
    setSavedSession(null);
  }, [clearSession]);

  // ── Skip & Power-up ────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    if (queue.length > 1) {
      const newQueue = [...queue.slice(1), queue[0]];
      setSkippedCount((c) => c + 1);
      setPowerUpUsed(false);
      animateNext(() => setQueue(newQueue));
    }
  }, [queue, animateNext]);

  const handlePowerUp = useCallback(() => {
    setPowerUpUsed(true);
  }, []);

  // ── Send Contest (Confrontar Resposta) ──
  const handleSendConfront = async () => {
    if (isGuest) return;
    if (!confrontReason.trim()) return;
    setIsSendingConfront(true);
    try {
      const userEmail = user?.email || profile?.email || "anon@example.com";
      const { error } = await supabase.from("question_reports").insert({
        user_id: user?.id || null,
        user_email: userEmail,
        module_id: moduleId,
        question_id: String(currentIdx),
        question_title: exercise.type === "briefing" ? exercise.scenarioTitle : (exercise as any).question || (exercise as any).instruction || "Questão",
        selected_answer: "",
        reason: confrontReason.trim(),
      });
      if (error) throw error;
      
      if (Platform.OS === 'web') {
        window.alert("Obrigado. Sua contestação será analisada.");
      } else {
        const { Alert } = require("react-native");
        Alert.alert("Sucesso", "Obrigado. Sua contestação será analisada.");
      }
    } catch (err) {
      console.warn("Error inserting question report:", err);
      // Graceful fallback to alert
      if (Platform.OS === 'web') {
        window.alert("Obrigado. Sua contestação será analisada.");
      } else {
        const { Alert } = require("react-native");
        Alert.alert("Sucesso", "Obrigado. Sua contestação será analisada.");
      }
    } finally {
      setIsSendingConfront(false);
      setConfrontModalVisible(false);
      setConfrontReason("");
    }
  };

  if (sessionLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!exercise) return null;

  // ── Resume screen ─────────────────────────────────────────────────────────────
  if (showResume && savedSession) {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 20 }}>
          <View style={[s.resumeCard, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}>
            <View style={[s.resumeIcon, { backgroundColor: colors.primary + "15" }]}>
              <BookOpen size={32} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[s.resumeTitle, { color: colors.foreground }]}>Atividade em andamento</Text>
            <Text style={[s.resumeSub, { color: colors.mutedForeground }]}>
              Você pausou no exercício {savedSession.localIdx} de {moduleSlice.length - 1} com{" "}
              {savedSession.xp} XP acumulados.
            </Text>
            <View style={s.resumeStats}>
              <View style={[s.resumeStat, { backgroundColor: colors.background }]}>
                <Zap size={14} color={colors.primary} />
                <Text style={[s.resumeStatText, { color: colors.primary }]}>{savedSession.xp} XP</Text>
              </View>
              <View style={[s.resumeStat, { backgroundColor: colors.background }]}>
                <Heart size={14} color="#EF4444" />
                <Text style={[s.resumeStatText, { color: "#EF4444" }]}>{savedSession.lives} vidas</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[s.resumeBtn, { backgroundColor: colors.primary }]}
              onPress={handleResume}
              activeOpacity={0.85}
            >
              <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
              <Text style={s.resumeBtnText}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.resumeBtnSecondary, { borderColor: colors.border }]}
              onPress={handleRestartFromResume}
              activeOpacity={0.8}
            >
              <RotateCcw size={14} color={colors.mutedForeground} strokeWidth={2} />
              <Text style={[s.resumeBtnSecondaryText, { color: colors.mutedForeground }]}>
                Recomeçar módulo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <ExerciseHeader
        current={moduleSlice.length - queue.length}
        total={moduleSlice.length}
        lives={lives}
        xp={xp}
        onClose={() => router.back()}
        phaseInfo={phaseInfo}
        isBriefing={isBriefing}
        moduleName={moduleDef?.title ?? ""}
        hint={exerciseHint}
        exerciseType={exerciseType}
        showHintIcon={showHintIcon}
        powerUpUsed={powerUpUsed}
        onPowerUp={handlePowerUp}
        onSkip={queue.length > 1 ? handleSkip : undefined}
        currentXP={progress?.xp ?? 0}
        onSpendXP={spendXP}
        onIncrementHintUsed={incrementHintUsed}
        isMistakesReview={isMistakesReview}
      />

      <Animated.View style={[s.body, { transform: [{ translateX: slideAnim }] }]}>
        {skippedCount > 0 && queue.length === skippedCount && !isBriefing && (
          <View style={{ backgroundColor: colors.primary + "15", padding: 12, alignItems: "center" }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
              Você tem questões para revisar antes de concluir.
            </Text>
          </View>
        )}

        {exercise.type === "briefing" && (
          <BriefingScreen exercise={exercise} onStart={() => advance(lives, xp)} />
        )}
        {exercise.type === "multiple_choice" && (
          <MultipleChoiceScreen
            key={`mc-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
            isMistakesReview={isMistakesReview}
          />
        )}
        {exercise.type === "association" && (
          <AssociationScreen
            key={`as-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
          />
        )}
        {exercise.type === "text_input" && (
          <TextInputScreen
            key={`ti-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
            isMistakesReview={isMistakesReview}
          />
        )}
        {exercise.type === "ordering" && (
          <OrderingScreen
            key={`or-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
          />
        )}
        {exercise.type === "fill_blank" && (
          <FillBlankScreen
            key={`fb-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
          />
        )}
        {exercise.type === "phishing_email" && (
          <PhishingSimulatorScreen
            key={`ph-${currentIdx}-${retryKey}`}
            exercise={exercise}
            onAnswer={handleAnswer}
            feedbackVisible={feedback.visible}
            powerUpUsed={powerUpUsed}
          />
        )}
      </Animated.View>

      {/* ── Inline feedback panel ── */}
      {!isBriefing && !gameOver && feedback.visible && (
        <FeedbackPanel
          feedback={feedback}
          colors={colors}
          lives={lives}
          maxLives={MAX_LIVES}
          insets={insets}
          onContinue={handleContinue}
          retryTextInput={retryTextInput}
          onToggleLearnMore={() =>
            setFeedback((f) => ({ ...f, showLearnMore: !f.showLearnMore }))
          }
          onConfront={() => setConfrontModalVisible(true)}
        />
      )}

      {/* ── Game Over overlay ── */}
      {gameOver && (
        <View style={[s.gameOverOverlay, { backgroundColor: colors.background + "F0" }]}>
          <View style={[s.gameOverCard, { backgroundColor: colors.card, borderColor: colors.error + "50" }]}>
            <View style={[s.gameOverIconBg, { backgroundColor: colors.error + "18" }]}>
              <AlertCircle size={40} color={colors.error} strokeWidth={1.5} />
            </View>
            <Text style={[s.gameOverTitle, { color: colors.foreground }]}>Suas vidas acabaram!</Text>
            <Text style={[s.gameOverSub, { color: colors.mutedForeground }]}>
              Revise o conteúdo do briefing e tente novamente. Você consegue!
            </Text>
            <TouchableOpacity
              style={[s.restartBtn, { backgroundColor: colors.primary }]}
              onPress={handleRestart}
              activeOpacity={0.85}
            >
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={s.restartBtnText}>Recomeçar Módulo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.backBtn, { borderColor: colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <ChevronLeft size={14} color={colors.mutedForeground} strokeWidth={2} />
              <Text style={[s.backBtnText, { color: colors.mutedForeground }]}>Voltar ao Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Confrontar Resposta Modal ── */}
      <Modal
        visible={confrontModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfrontModalVisible(false)}
        statusBarTranslucent
      >
        <Pressable
          style={s.modalOverlay}
          onPress={() => setConfrontModalVisible(false)}
        >
          <Pressable style={[s.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: colors.foreground }]}>Confrontar resposta</Text>
            </View>
            
            {isGuest ? (
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_500Medium", color: colors.error, textAlign: "center", lineHeight: 20 }}>
                  Entre ou crie uma conta para enviar a contestação.
                </Text>
                <TouchableOpacity
                  style={[s.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setConfrontModalVisible(false)}
                >
                  <Text style={s.modalBtnText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 18 }}>
                  Explique por que você acredita que sua resposta também está correta.
                </Text>
                
                <TextInput
                  style={[s.confrontInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.input }]}
                  multiline
                  numberOfLines={4}
                  placeholder="Escreva sua explicação detalhada aqui..."
                  placeholderTextColor={colors.mutedForeground}
                  value={confrontReason}
                  onChangeText={setConfrontReason}
                  textAlignVertical="top"
                />
                
                <View style={s.modalActionsRow}>
                  <TouchableOpacity
                    style={[s.modalCancelBtn, { borderColor: colors.border }]}
                    onPress={() => { setConfrontModalVisible(false); setConfrontReason(""); }}
                    disabled={isSendingConfront}
                  >
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[s.modalSubmitBtn, { backgroundColor: confrontReason.trim() ? colors.primary : colors.muted }]}
                    onPress={handleSendConfront}
                    disabled={!confrontReason.trim() || isSendingConfront}
                  >
                    {isSendingConfront ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: confrontReason.trim() ? "#FFF" : colors.mutedForeground, fontFamily: "Inter_700Bold" }}>Enviar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function LessonErrorFallback() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: colors.background }}>
      <AlertTriangle size={48} color={colors.error} strokeWidth={1.5} style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, textAlign: "center", marginBottom: 8 }}>
        Não foi possível carregar esta atividade.
      </Text>
      <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", marginBottom: 24 }}>
        Ocorreu um erro inesperado ao carregar o conteúdo do exercício.
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: colors.primary,
          paddingVertical: 14,
          paddingHorizontal: 24,
          borderRadius: 12,
        }}
        onPress={() => router.replace("/")}
      >
        <ArrowLeft size={16} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 15 }}>Voltar para o início</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function LessonScreen() {
  return (
    <ErrorBoundary FallbackComponent={LessonErrorFallback}>
      <LessonScreenInternal />
    </ErrorBoundary>
  );
}

// ── Feedback Panel ─────────────────────────────────────────────────────────────
function FeedbackPanel({
  feedback, colors, lives, maxLives, insets, onContinue, onToggleLearnMore, onConfront, retryTextInput,
}: {
  feedback: FeedbackState;
  colors: any;
  lives: number;
  maxLives: number;
  insets: any;
  retryTextInput?: boolean;
  onContinue: () => void;
  onToggleLearnMore: () => void;
  onConfront?: () => void;
}) {
  const accent = feedback.correct ? colors.success : colors.error;
  const statusBg = feedback.correct ? "rgba(34,197,94,0.09)" : "rgba(239,68,68,0.09)";
  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <View style={[fb.panel, { backgroundColor: colors.card, borderTopColor: accent, paddingBottom: safeBottom }]}>
      {/* Status row */}
      <View style={[fb.statusRow, { backgroundColor: statusBg, borderRadius: 12, padding: 14 }]}>
        {feedback.correct
          ? <CheckCircle size={26} color={colors.success} strokeWidth={2} />
          : <XCircle size={26} color={colors.error} strokeWidth={2} />
        }
        <View style={{ flex: 1 }}>
          <Text style={[fb.statusTitle, { color: accent }]}>
            {feedback.incentive || (feedback.correct ? "Boa!" : "Quase!")}
          </Text>
          <Text style={[fb.statusMsg, { color: colors.foreground }]}>
            {feedback.message}
          </Text>
        </View>
        {/* Remaining lives on error */}
        {!feedback.correct && (
          <View style={fb.livesCol}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                size={12}
                color={i < lives ? "#EF4444" : colors.border}
                strokeWidth={2}
                fill={i < lives ? "#EF4444" : "transparent"}
              />
            ))}
          </View>
        )}
      </View>

      {/* Explanations and Confront block */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 4 }}>
        {feedback.learnMore && (
          <TouchableOpacity
            style={[fb.learnMoreBtn, { borderColor: colors.border }]}
            onPress={onToggleLearnMore}
            activeOpacity={0.8}
          >
            <BookOpen size={13} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[fb.learnMoreText, { color: colors.mutedForeground }]} adjustsFontSizeToFit={true} numberOfLines={1}>
              {feedback.showLearnMore 
                ? "Ocultar explicação" 
                : feedback.correct 
                ? "Saiba mais" 
                : "Entender o erro"}
            </Text>
          </TouchableOpacity>
        )}
        
        {!feedback.correct && onConfront && (
          <TouchableOpacity
            style={[fb.learnMoreBtn, { borderColor: colors.border }]}
            onPress={onConfront}
            activeOpacity={0.8}
          >
            <AlertCircle size={13} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[fb.learnMoreText, { color: colors.mutedForeground }]} adjustsFontSizeToFit={true} numberOfLines={1}>
              Confrontar resposta
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {feedback.showLearnMore && feedback.learnMore && (
        <View style={[fb.learnMoreCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[fb.learnMoreLabel, { color: colors.mutedForeground }]}>SAIBA MAIS</Text>
          <Text style={[fb.learnMoreContent, { color: colors.foreground }]}>
            {feedback.learnMore}
          </Text>
        </View>
      )}

      {/* Action button */}
      <TouchableOpacity
        style={[fb.primaryBtn, { backgroundColor: feedback.correct ? colors.success : colors.primary }]}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={fb.primaryBtnText} adjustsFontSizeToFit={true} numberOfLines={1}>
          {feedback.correct ? "Continuar" : (retryTextInput ? "Tentar novamente" : "Continuar")}
        </Text>
        <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
    padding: 24, zIndex: 99,
  },
  gameOverCard: {
    width: "100%", borderRadius: 16, borderWidth: 1,
    padding: 28, alignItems: "center", gap: 16,
  },
  gameOverIconBg: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  gameOverTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  gameOverSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  restartBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 10, paddingVertical: 14, width: "100%",
  },
  restartBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 0.2 },
  backBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, borderWidth: 1, paddingVertical: 12, width: "100%",
  },
  backBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  // Resume
  resumeCard: {
    width: "100%", borderRadius: 16, borderWidth: 1,
    padding: 24, alignItems: "center", gap: 16,
  },
  resumeIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
  },
  resumeTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  resumeSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  resumeStats: { flexDirection: "row", gap: 12 },
  resumeStat: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  resumeStatText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  resumeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 10, paddingVertical: 14, width: "100%",
  },
  resumeBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFF" },
  resumeBtnSecondary: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, borderWidth: 1, paddingVertical: 11, width: "100%",
  },
  resumeBtnSecondaryText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // Modals overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  modalBtn: {
    borderRadius: 10, paddingVertical: 13,
    alignItems: "center", justifyContent: "center",
  },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  confrontInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    height: 100,
  },
  modalActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalSubmitBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});

const fb = StyleSheet.create({
  panel: {
    borderTopWidth: 3,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  statusRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  statusTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statusMsg: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: 2 },
  livesCol: { flexDirection: "column", alignItems: "center", gap: 2, paddingLeft: 4 },
  learnMoreBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", borderRadius: 7, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  learnMoreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  learnMoreCard: {
    borderRadius: 10, borderWidth: 1, padding: 13, gap: 5,
  },
  learnMoreLabel: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  learnMoreContent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 10, paddingVertical: 15, gap: 8,
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFF", letterSpacing: 0.2 },
});
