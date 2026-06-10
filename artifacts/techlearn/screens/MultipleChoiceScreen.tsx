import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CheckCircle, XCircle } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { MultipleChoiceExercise } from "@/constants/lessons";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (correct: boolean, userAnswer?: any) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
  isMistakesReview?: boolean;
}

export function MultipleChoiceScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false, isMistakesReview = false }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();

  const locked = checked || feedbackVisible;

  const eliminatedIndices = React.useMemo(() => {
    if (powerUpUsed) {
      return exercise.options
        .map((_, i) => i)
        .filter((i) => i !== exercise.correct)
        .slice(0, 2);
    }
    if (isMistakesReview) {
      // Elimina automaticamente 1 alternativa incorreta como pista inteligente na revisão de erros!
      return exercise.options
        .map((_, i) => i)
        .filter((i) => i !== exercise.correct)
        .slice(0, 1);
    }
    return [];
  }, [powerUpUsed, isMistakesReview, exercise]);

  const handleSelect = (idx: number) => {
    if (locked || eliminatedIndices.includes(idx)) return;
    Haptics.selectionAsync();
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null || locked) return;
    setChecked(true);
    const correct = selected === exercise.correct;
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy);
    onAnswer(correct, exercise.options[selected]);
  };

  const getOptionStyle = (idx: number) => {
    if (eliminatedIndices.includes(idx)) {
      return { bg: colors.card, border: colors.border + "40", textColor: colors.mutedForeground, opacity: 0.4 };
    }
    if (!checked) {
      return selected === idx
        ? { bg: colors.primary + "16", border: colors.primary, textColor: colors.foreground, opacity: 1 }
        : { bg: colors.card, border: colors.border, textColor: colors.foreground, opacity: 1 };
    }
    if (idx === exercise.correct && selected === exercise.correct) {
      return { bg: "rgba(34,197,94,0.12)", border: colors.success, textColor: colors.foreground, opacity: 1 };
    }
    if (idx === selected && idx !== exercise.correct) {
      return { bg: "rgba(239,68,68,0.10)", border: colors.error, textColor: colors.foreground, opacity: 1 };
    }
    return { bg: colors.card, border: colors.border + "80", textColor: colors.mutedForeground, opacity: 1 };
  };

  const renderIcon = (idx: number) => {
    const letter = String.fromCharCode(65 + idx); // A, B, C, D
    if (!checked) {
      const isSelected = selected === idx;
      return (
        <View style={[
          styles.optLetter,
          {
            backgroundColor: isSelected ? colors.primary : "transparent",
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: 1.5,
          }
        ]}>
          <Text style={[styles.optLetterText, { color: isSelected ? "#FFF" : colors.mutedForeground }]}>
            {letter}
          </Text>
        </View>
      );
    }
    if (idx === exercise.correct && selected === exercise.correct) {
      return <CheckCircle size={20} color={colors.success} strokeWidth={2.5} />;
    }
    if (idx === selected && idx !== exercise.correct) {
      return <XCircle size={20} color={colors.error} strokeWidth={2.5} />;
    }
    return (
      <View style={[styles.optLetter, { borderColor: colors.border + "60", borderWidth: 1.5 }]}>
        <Text style={[styles.optLetterText, { color: colors.border }]}>{letter}</Text>
      </View>
    );
  };

  const canCheck = selected !== null && !locked;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question card */}
        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.question, { color: colors.foreground }]}>{exercise.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {exercise.options.map((opt, idx) => {
            const st = getOptionStyle(idx);
            const isEliminated = eliminatedIndices.includes(idx);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: st.bg, borderColor: st.border, opacity: st.opacity }]}
                onPress={() => handleSelect(idx)}
                activeOpacity={locked || isEliminated ? 1 : 0.72}
                disabled={locked || isEliminated}
              >
                {renderIcon(idx)}
                <Text style={[styles.optionText, { color: st.textColor, textDecorationLine: isEliminated ? "line-through" : "none" }]}>
                  {isEliminated ? "Eliminada" : opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {!feedbackVisible && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.btn, {
              backgroundColor: canCheck ? colors.primary : colors.muted,
              opacity: canCheck ? 1 : 0.6,
            }]}
            onPress={handleCheck}
            activeOpacity={0.85}
            disabled={!canCheck}
          >
            <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>
              Confirmar resposta
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 32 },
  questionCard: {
    borderRadius: 16, borderWidth: 1, padding: 20,
  },
  question: { fontSize: 17, fontFamily: "Inter_700Bold", lineHeight: 28 },
  options: { gap: 12 },
  option: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1.5, padding: 16, gap: 14,
  },
  optLetter: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  optLetterText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", minHeight: 52 },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
